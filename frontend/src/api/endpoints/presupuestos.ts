import apiClient from '../client';
import type {
  Presupuesto,
  ItemPresupuesto,
  Pago,
  BalanceOrden,
  TipoItemPresupuesto,
  EstadoPresupuesto,
  MetodoPago,
} from '../../types';

export const createPresupuesto = (data: {
  orden_id: number;
  impuesto_porcentaje?: number;
  descuento?: number;
  notas?: string;
  items?: Array<{
    tipo: TipoItemPresupuesto;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
  }>;
}) => apiClient.post<Presupuesto>('/presupuestos', data);

export const getPresupuestoByOrden = (ordenId: number) =>
  apiClient.get<Presupuesto>(`/presupuestos/orden/${ordenId}`);

export const updatePresupuesto = (
  presupuestoId: number,
  data: {
    estado?: EstadoPresupuesto;
    impuesto_porcentaje?: number;
    descuento?: number;
    notas?: string;
  }
) => apiClient.patch<Presupuesto>(`/presupuestos/${presupuestoId}`, data);

export const addItemPresupuesto = (
  presupuestoId: number,
  data: {
    tipo: TipoItemPresupuesto;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
  }
) => apiClient.post<ItemPresupuesto>(`/presupuestos/${presupuestoId}/items`, data);

export const deleteItemPresupuesto = (itemId: number) =>
  apiClient.delete(`/presupuestos/items/${itemId}`);

export const registrarPago = (data: {
  orden_id: number;
  monto: number;
  metodo_pago: MetodoPago;
  referencia?: string;
  notas?: string;
}) => apiClient.post<Pago>('/presupuestos/pagos', data);

export const getBalanceOrden = (ordenId: number) =>
  apiClient.get<BalanceOrden>(`/presupuestos/orden/${ordenId}/balance`);

