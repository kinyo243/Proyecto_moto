from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, Response
from sqlalchemy.orm import Session
from sqlalchemy import select, or_

from app.core.database import get_db
from app.models.cliente import Cliente
from app.models.vehiculo import Vehiculo
from app.schemas.vehiculo import (
    VehiculoCreate,
    VehiculoUpdate,
    VehiculoResponse,
    VehiculoWithClienteResponse,
    VehiculoDetailResponse,
)

router = APIRouter()


@router.post(
    "",
    response_model=VehiculoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Asociar o registrar vehículo con millaje/combustible (Recepción)",
)
def create_vehiculo(
    payload: VehiculoCreate,
    response: Response,
    update_if_exists: bool = Query(
        False,
        description="Si es True y el vehículo ya existe por placa, actualiza su millaje y combustible de ingreso",
    ),
    db: Session = Depends(get_db),
):
    """
    Asocia un vehículo (moto o automóvil) a un cliente existente, registrando el
    kilometraje (millaje) actual y el nivel de combustible al momento de ingresar.
    """
    # 1. Validar que el cliente propietario exista
    cliente = db.get(Cliente, payload.cliente_id)
    if not cliente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se puede asociar el vehículo: El cliente con ID {payload.cliente_id} no existe.",
        )

    # 2. Verificar existencia previa por placa
    existing_vehiculo = db.execute(
        select(Vehiculo).where(Vehiculo.placa == payload.placa)
    ).scalars().first()

    if existing_vehiculo:
        if update_if_exists:
            # Validar consistencia del odómetro
            if payload.kilometraje_actual < existing_vehiculo.kilometraje_actual:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Inconsistencia en odómetro: El kilometraje de ingreso ({payload.kilometraje_actual} km) "
                        f"no puede ser inferior al previamente registrado ({existing_vehiculo.kilometraje_actual} km)."
                    ),
                )

            # Actualizar datos de ingreso al taller
            existing_vehiculo.kilometraje_actual = payload.kilometraje_actual
            existing_vehiculo.nivel_combustible = payload.nivel_combustible
            existing_vehiculo.cliente_id = payload.cliente_id  # Permite transferencia de titular

            if payload.marca:
                existing_vehiculo.marca = payload.marca
            if payload.modelo:
                existing_vehiculo.modelo = payload.modelo
            if payload.anio:
                existing_vehiculo.anio = payload.anio
            if payload.vin:
                existing_vehiculo.vin = payload.vin

            db.commit()
            db.refresh(existing_vehiculo)
            response.status_code = status.HTTP_200_OK
            return existing_vehiculo

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"El vehículo con placa '{payload.placa}' ya se encuentra registrado "
                f"(ID: {existing_vehiculo.id}, Cliente ID: {existing_vehiculo.cliente_id}). "
                f"Active el parámetro update_if_exists=true para actualizar su kilometraje y nivel de combustible."
            ),
        )

    # 3. Validar unicidad de VIN si fue suministrado
    if payload.vin:
        existing_vin = db.execute(
            select(Vehiculo).where(Vehiculo.vin == payload.vin)
        ).scalars().first()
        if existing_vin:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe otro vehículo registrado con el número de chasis/VIN '{payload.vin}'.",
            )

    # 4. Crear nuevo vehículo
    nuevo_vehiculo = Vehiculo(**payload.model_dump())
    db.add(nuevo_vehiculo)
    db.commit()
    db.refresh(nuevo_vehiculo)
    return nuevo_vehiculo


@router.get(
    "",
    response_model=List[VehiculoResponse],
    summary="Listar vehículos con paginación y filtros",
)
def list_vehiculos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    cliente_id: Optional[int] = Query(None, description="Filtrar por cliente"),
    placa: Optional[str] = Query(None, description="Buscar por placa"),
    search: Optional[str] = Query(None, description="Buscar por marca o modelo"),
    db: Session = Depends(get_db),
):
    query = select(Vehiculo)

    if cliente_id:
        query = query.where(Vehiculo.cliente_id == cliente_id)

    if placa:
        query = query.where(Vehiculo.placa.ilike(f"%{placa.strip()}%"))

    if search:
        search_filter = f"%{search.strip()}%"
        query = query.where(
            or_(
                Vehiculo.marca.ilike(search_filter),
                Vehiculo.modelo.ilike(search_filter),
            )
        )

    query = query.order_by(Vehiculo.id.desc()).offset(skip).limit(limit)
    return db.execute(query).scalars().all()


@router.get(
    "/{vehiculo_id}",
    response_model=VehiculoDetailResponse,
    summary="Obtener detalle completo de un vehículo",
)
def get_vehiculo(
    vehiculo_id: int,
    db: Session = Depends(get_db),
):
    vehiculo = db.get(Vehiculo, vehiculo_id)
    if not vehiculo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehículo con ID {vehiculo_id} no encontrado.",
        )
    return vehiculo


@router.put(
    "/{vehiculo_id}",
    response_model=VehiculoResponse,
    summary="Actualizar información de un vehículo",
)
def update_vehiculo(
    vehiculo_id: int,
    payload: VehiculoUpdate,
    db: Session = Depends(get_db),
):
    vehiculo = db.get(Vehiculo, vehiculo_id)
    if not vehiculo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehículo con ID {vehiculo_id} no encontrado.",
        )

    update_data = payload.model_dump(exclude_unset=True)

    # Validar cliente si se cambia de dueño
    if "cliente_id" in update_data and update_data["cliente_id"] != vehiculo.cliente_id:
        cliente = db.get(Cliente, update_data["cliente_id"])
        if not cliente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No se puede transferir el vehículo: El cliente con ID {update_data['cliente_id']} no existe.",
            )

    # Validar placa única
    if "placa" in update_data and update_data["placa"] != vehiculo.placa:
        dup_placa = db.execute(
            select(Vehiculo).where(Vehiculo.placa == update_data["placa"], Vehiculo.id != vehiculo_id)
        ).scalars().first()
        if dup_placa:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"La placa '{update_data['placa']}' ya pertenece a otro vehículo.",
            )

    # Validar VIN único
    if "vin" in update_data and update_data["vin"] and update_data["vin"] != vehiculo.vin:
        dup_vin = db.execute(
            select(Vehiculo).where(Vehiculo.vin == update_data["vin"], Vehiculo.id != vehiculo_id)
        ).scalars().first()
        if dup_vin:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"El VIN '{update_data['vin']}' ya pertenece a otro vehículo.",
            )

    for field, value in update_data.items():
        setattr(vehiculo, field, value)

    db.commit()
    db.refresh(vehiculo)
    return vehiculo


@router.get(
    "/placa/{placa}/historial",
    response_model=VehiculoDetailResponse,
    summary="Consultar historial técnico y órdenes de reparación por placa",
)
def get_historial_vehiculo_by_placa(
    placa: str,
    db: Session = Depends(get_db),
):
    """
    Retorna el expediente clínico del vehículo: datos del cliente, características,
    kilometraje actual e historial completo de órdenes previas en el taller.
    """
    clean_placa = placa.strip().upper()
    vehiculo = db.execute(
        select(Vehiculo).where(Vehiculo.placa == clean_placa)
    ).scalars().first()

    if not vehiculo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró ningún vehículo registrado con la placa '{clean_placa}'.",
        )

    return vehiculo


@router.delete(
    "/{vehiculo_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar vehículo",
)
def delete_vehiculo(
    vehiculo_id: int,
    db: Session = Depends(get_db),
):
    vehiculo = db.get(Vehiculo, vehiculo_id)
    if not vehiculo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehículo con ID {vehiculo_id} no encontrado.",
        )

    db.delete(vehiculo)
    db.commit()
    return None
