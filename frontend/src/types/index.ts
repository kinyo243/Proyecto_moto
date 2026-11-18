// ─── Enums ────────────────────────────────────────────────────────────────────

export type EstadoOrden =
  | 'En Espera'
  | 'En Diagnóstico'
  | 'En Reparación'
  | 'Listo'
  | 'Entregado';

export type EstadoDVI = 'Verde' | 'Amarillo' | 'Rojo';

export type EstadoAprobacion = 'Pendiente' | 'Aprobado' | 'Rechazado';

export type NivelCombustible =
  | 'Vacio'
  | 'Reserva'
  | '1/4'
  | '1/2'
  | '3/4'
  | 'Lleno';

export type TipoCliente = 'regular' | 'flotilla';

export type EstadoCamara = 'activa' | 'inactiva' | 'error';

export type EstadoPresupuesto = 'Borrador' | 'Enviado' | 'Aprobado' | 'Rechazado';

export type TipoItemPresupuesto = 'Repuesto' | 'Mano de Obra' | 'Servicio Externo';

export type MetodoPago = 'Efectivo' | 'Transferencia' | 'Tarjeta Débito' | 'Tarjeta Crédito' | 'Otro';

export type RolUsuario = 'administrador' | 'recepcionista' | 'mecanico';

export interface Usuario {
  id: number;
  email: string;
  nombre_completo: string;
  rol: RolUsuario;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  usuario: Usuario;
}

// ─── Core Entities ─────────────────────────────────────────────────────────────

export interface Cliente {
  id: number;
  nombre: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  tipo: TipoCliente;
  fecha_creacion: string;
}

export interface Vehiculo {
  id: number;
  cliente_id: number;
  marca: string;
  modelo: string;
  anio: number;
  placa: string;
  vin: string | null;
  kilometraje_actual: number | null;
  nivel_combustible: NivelCombustible | null;
  cliente?: Cliente;
}

export interface Bahia {
  id: number;
  nombre_bahia: string;
  descripcion: string | null;
  camaras?: Camara[];
  orden_activa?: OrdenReparacion | null;
}

export interface BahiaDetail extends Bahia {
  camaras: Camara[];
  orden_activa: OrdenReparacion | null;
}

export interface Camara {
  id: number;
  bahia_id: number;
  url_rtsp: string;
  estado: EstadoCamara;
}

export interface EvidenciaCapturada {
  id: number;
  orden_id: number;
  camara_id?: number | null;
  archivo_path: string;
  notas?: string | null;
  fecha_captura: string;
}

// ─── Órdenes de Reparación ────────────────────────────────────────────────────

export interface OrdenReparacion {
  id: number;
  vehiculo_id: number;
  estado: EstadoOrden;
  notas_recepcion: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface OrdenReparacionDetail extends OrdenReparacion {
  vehiculo: Vehiculo & { cliente: Cliente };
  bahia?: Bahia | null;
}

// ─── DVI ──────────────────────────────────────────────────────────────────────

export interface EvidenciaInspeccion {
  id: number;
  item_dvi_id: number;
  tipo_archivo: string;
  archivo_path: string;
  descripcion: string | null;
  fecha_creacion: string;
}

export interface ItemDVI {
  id: number;
  inspeccion_id: number;
  categoria: string;
  nombre_item: string;
  estado: EstadoDVI;
  observaciones: string | null;
  evidencias: EvidenciaInspeccion[];
}

export interface InspeccionDVI {
  id: number;
  orden_id: number;
  fecha_inspeccion: string;
  tecnico_responsable: string | null;
  notas_generales: string | null;
  estado_aprobacion: EstadoAprobacion;
  firma_cliente: string | null;
  nombre_firmante: string | null;
  documento_firmante: string | null;
  fecha_firma: string | null;
  items: ItemDVI[];
}

// ─── Presupuesto y Cobranza ───────────────────────────────────────────────────

export interface ItemPresupuesto {
  id: number;
  presupuesto_id: number;
  tipo: TipoItemPresupuesto;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Presupuesto {
  id: number;
  orden_id: number;
  estado: EstadoPresupuesto;
  impuesto_porcentaje: number;
  descuento: number;
  notas: string | null;
  created_at: string;
  updated_at: string;
  items: ItemPresupuesto[];
  subtotal_bruto: number;
  monto_impuesto: number;
  total: number;
}

export interface Pago {
  id: number;
  orden_id: number;
  monto: number;
  metodo_pago: MetodoPago;
  referencia: string | null;
  notas: string | null;
  fecha_pago: string;
}

export interface BalanceOrden {
  orden_id: number;
  total_presupuesto: number;
  total_pagado: number;
  saldo_pendiente: number;
  estado_pago: string;
  pagos: Pago[];
}

// ─── Pagination / list wrappers ───────────────────────────────────────────────

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

// ─── Request payloads ─────────────────────────────────────────────────────────

export interface CreateClientePayload {
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  tipo?: TipoCliente;
}

export interface CreateVehiculoPayload {
  cliente_id: number;
  marca: string;
  modelo: string;
  anio: number;
  placa: string;
  vin?: string;
  kilometraje_actual?: number;
  nivel_combustible?: NivelCombustible;
}

export interface CreateOrdenPayload {
  vehiculo_id: number;
  notas_recepcion?: string;
}

