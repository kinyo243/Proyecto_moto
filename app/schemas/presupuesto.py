from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, computed_field
from app.models.presupuesto import EstadoPresupuesto, TipoItemPresupuesto, MetodoPago


class ItemPresupuestoBase(BaseModel):
    tipo: TipoItemPresupuesto = Field(default=TipoItemPresupuesto.REPUESTO)
    descripcion: str = Field(..., min_length=2, max_length=255)
    cantidad: float = Field(default=1.0, gt=0)
    precio_unitario: float = Field(default=0.0, ge=0)


class ItemPresupuestoCreate(ItemPresupuestoBase):
    pass


class ItemPresupuestoUpdate(BaseModel):
    tipo: Optional[TipoItemPresupuesto] = None
    descripcion: Optional[str] = Field(None, min_length=2, max_length=255)
    cantidad: Optional[float] = Field(None, gt=0)
    precio_unitario: Optional[float] = Field(None, ge=0)


class ItemPresupuestoResponse(ItemPresupuestoBase):
    id: int
    presupuesto_id: int

    @computed_field
    def subtotal(self) -> float:
        return round(self.cantidad * self.precio_unitario, 2)

    model_config = ConfigDict(from_attributes=True)


class PresupuestoBase(BaseModel):
    estado: EstadoPresupuesto = Field(default=EstadoPresupuesto.BORRADOR)
    impuesto_porcentaje: float = Field(default=16.0, ge=0, le=100)
    descuento: float = Field(default=0.0, ge=0)
    notas: Optional[str] = Field(None, max_length=500)


class PresupuestoCreate(BaseModel):
    orden_id: int = Field(..., gt=0)
    impuesto_porcentaje: float = Field(default=16.0, ge=0, le=100)
    descuento: float = Field(default=0.0, ge=0)
    notas: Optional[str] = Field(None, max_length=500)
    items: Optional[List[ItemPresupuestoCreate]] = Field(default_factory=list)


class PresupuestoUpdate(BaseModel):
    estado: Optional[EstadoPresupuesto] = None
    impuesto_porcentaje: Optional[float] = Field(None, ge=0, le=100)
    descuento: Optional[float] = Field(None, ge=0)
    notas: Optional[str] = Field(None, max_length=500)


class PresupuestoResponse(PresupuestoBase):
    id: int
    orden_id: int
    created_at: datetime
    updated_at: datetime
    items: List[ItemPresupuestoResponse] = []

    @computed_field
    def subtotal_bruto(self) -> float:
        return round(sum(i.subtotal for i in self.items), 2)

    @computed_field
    def monto_impuesto(self) -> float:
        base = max(0.0, self.subtotal_bruto - self.descuento)
        return round(base * (self.impuesto_porcentaje / 100.0), 2)

    @computed_field
    def total(self) -> float:
        base = max(0.0, self.subtotal_bruto - self.descuento)
        return round(base + self.monto_impuesto, 2)

    model_config = ConfigDict(from_attributes=True)


class PagoCreate(BaseModel):
    orden_id: int = Field(..., gt=0)
    monto: float = Field(..., gt=0)
    metodo_pago: MetodoPago = Field(default=MetodoPago.EFECTIVO)
    referencia: Optional[str] = Field(None, max_length=100)
    notas: Optional[str] = Field(None, max_length=255)


class PagoResponse(BaseModel):
    id: int
    orden_id: int
    monto: float
    metodo_pago: MetodoPago
    referencia: Optional[str]
    notas: Optional[str]
    fecha_pago: datetime

    model_config = ConfigDict(from_attributes=True)


class BalanceOrdenResponse(BaseModel):
    orden_id: int
    total_presupuesto: float
    total_pagado: float
    saldo_pendiente: float
    estado_pago: str  # "Sin Presupuesto", "Pendiente", "Parcialmente Pagado", "Pagado Total"
    pagos: List[PagoResponse] = []

