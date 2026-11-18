import apiClient from '../client';
import type {
  OrdenReparacion,
  OrdenReparacionDetail,
  CreateOrdenPayload,
  EstadoOrden,
} from '../../types';

export const getOrdenes = (params?: {
  skip?: number;
  limit?: number;
  estado?: EstadoOrden;
}) => apiClient.get<OrdenReparacion[]>('/ordenes-reparacion', { params });

export const getOrden = (id: number) =>
  apiClient.get<OrdenReparacionDetail>(`/ordenes-reparacion/${id}`);

export const createOrden = (data: CreateOrdenPayload) =>
  apiClient.post<OrdenReparacion>('/ordenes-reparacion', data);

export const updateOrdenEstado = (id: number, estado: EstadoOrden) =>
  apiClient.patch<OrdenReparacion>(`/ordenes-reparacion/${id}/estado`, {
    estado,
  });

