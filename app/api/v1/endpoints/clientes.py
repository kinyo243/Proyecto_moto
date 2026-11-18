from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, Response
from sqlalchemy.orm import Session
from sqlalchemy import select, or_

from app.core.database import get_db
from app.models.cliente import Cliente, TipoCliente
from app.schemas.cliente import (
    ClienteCreate,
    ClienteSearch,
    ClienteUpdate,
    ClienteResponse,
    ClienteDetailResponse,
)

router = APIRouter()


@router.post(
    "",
    response_model=ClienteResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear o recuperar cliente existente (Recepción)",
)
def create_cliente(
    payload: ClienteCreate,
    response: Response,
    get_if_exists: bool = Query(
        False,
        description="Si es True y el cliente ya existe por teléfono o correo, retorna el cliente existente con HTTP 200 en vez de lanzar error 409",
    ),
    db: Session = Depends(get_db),
):
    """
    Registra un nuevo cliente en el taller o recupera el existente si ya está registrado.
    Ideal para el mostrador de recepción al ingresar un cliente por teléfono o correo.
    """
    # 1. Búsqueda de duplicados por teléfono o email
    conditions = [Cliente.telefono == payload.telefono]
    if payload.email:
        conditions.append(Cliente.email == payload.email)

    existing = db.execute(select(Cliente).where(or_(*conditions))).scalars().first()

    if existing:
        if get_if_exists:
            # Retorna el cliente existente sin duplicar registros (HTTP 200 OK)
            response.status_code = status.HTTP_200_OK
            return existing

        motivo = (
            f"con el teléfono '{payload.telefono}'"
            if existing.telefono == payload.telefono
            else f"con el correo '{payload.email}'"
        )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Ya existe un cliente registrado {motivo} (Cliente ID: {existing.id}, Nombre: '{existing.nombre}'). "
                f"Utilice get_if_exists=true para obtener el cliente existente o consulte el ID indicado."
            ),
        )

    # 2. Creación del nuevo cliente
    nuevo_cliente = Cliente(**payload.model_dump())
    db.add(nuevo_cliente)
    db.commit()
    db.refresh(nuevo_cliente)
    return nuevo_cliente


@router.post(
    "/buscar",
    response_model=List[ClienteResponse],
    summary="Buscar clientes por criterios múltiples (Recepción)",
)
def search_clientes(
    payload: ClienteSearch,
    db: Session = Depends(get_db),
):
    """
    Permite al recepcionista buscar clientes antes de registrar uno nuevo,
    evitando duplicidades en la base de datos.
    """
    query = select(Cliente)
    filters = []

    if payload.telefono:
        filters.append(Cliente.telefono.ilike(f"%{payload.telefono.strip()}%"))

    if payload.email:
        filters.append(Cliente.email.ilike(f"%{payload.email.strip()}%"))

    if payload.query:
        term = f"%{payload.query.strip()}%"
        filters.append(
            or_(
                Cliente.nombre.ilike(term),
                Cliente.telefono.ilike(term),
                Cliente.email.ilike(term),
            )
        )

    if not filters:
        # Si no hay filtros, retorna los primeros 10 clientes más recientes
        return db.execute(query.order_by(Cliente.id.desc()).limit(10)).scalars().all()

    query = query.where(or_(*filters)).order_by(Cliente.id.desc()).limit(20)
    return db.execute(query).scalars().all()


@router.get(
    "",
    response_model=List[ClienteResponse],
    summary="Listar clientes con paginación y filtros",
)
def list_clientes(
    skip: int = Query(0, ge=0, description="Registros a omitir"),
    limit: int = Query(20, ge=1, le=100, description="Límite por página"),
    tipo: Optional[TipoCliente] = Query(None, description="Filtrar por tipo (regular/flotilla)"),
    search: Optional[str] = Query(None, description="Buscar por nombre, teléfono o email"),
    db: Session = Depends(get_db),
):
    query = select(Cliente)

    if tipo:
        query = query.where(Cliente.tipo == tipo)

    if search:
        search_filter = f"%{search.strip()}%"
        query = query.where(
            or_(
                Cliente.nombre.ilike(search_filter),
                Cliente.telefono.ilike(search_filter),
                Cliente.email.ilike(search_filter),
            )
        )

    query = query.order_by(Cliente.id.desc()).offset(skip).limit(limit)
    return db.execute(query).scalars().all()


@router.get(
    "/{cliente_id}",
    response_model=ClienteDetailResponse,
    summary="Obtener detalle de cliente por ID",
)
def get_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
):
    cliente = db.get(Cliente, cliente_id)
    if not cliente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cliente con ID {cliente_id} no encontrado",
        )
    return cliente


@router.put(
    "/{cliente_id}",
    response_model=ClienteResponse,
    summary="Actualizar información de cliente",
)
def update_cliente(
    cliente_id: int,
    payload: ClienteUpdate,
    db: Session = Depends(get_db),
):
    cliente = db.get(Cliente, cliente_id)
    if not cliente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cliente con ID {cliente_id} no encontrado",
        )

    update_data = payload.model_dump(exclude_unset=True)

    # Validar unicidad si se actualiza teléfono o email
    if "telefono" in update_data and update_data["telefono"] != cliente.telefono:
        dup = db.execute(
            select(Cliente).where(Cliente.telefono == update_data["telefono"], Cliente.id != cliente_id)
        ).scalars().first()
        if dup:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"El teléfono '{update_data['telefono']}' ya pertenece a otro cliente",
            )

    if "email" in update_data and update_data["email"] and update_data["email"] != cliente.email:
        dup = db.execute(
            select(Cliente).where(Cliente.email == update_data["email"], Cliente.id != cliente_id)
        ).scalars().first()
        if dup:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"El correo '{update_data['email']}' ya pertenece a otro cliente",
            )

    for field, value in update_data.items():
        setattr(cliente, field, value)

    db.commit()
    db.refresh(cliente)
    return cliente


@router.delete(
    "/{cliente_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar cliente",
)
def delete_cliente(
    cliente_id: int,
    db: Session = Depends(get_db),
):
    cliente = db.get(Cliente, cliente_id)
    if not cliente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cliente con ID {cliente_id} no encontrado",
        )

    db.delete(cliente)
    db.commit()
    return None
