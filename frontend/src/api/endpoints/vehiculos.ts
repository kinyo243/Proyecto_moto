import apiClient from '../client';
import type { Vehiculo, CreateVehiculoPayload } from '../../types';

export const createVehiculo = (
  data: CreateVehiculoPayload,
  updateIfExists: boolean = true
) =>
  apiClient.post<Vehiculo>('/vehiculos', data, {
    params: { update_if_exists: updateIfExists },
  });

export const getVehiculo = (id: number) =>
  apiClient.get<Vehiculo>(`/vehiculos/${id}`);

export const getVehiculoByPlaca = (placa: string) =>
  apiClient.get<Vehiculo>(`/vehiculos`, { params: { placa } });

export const getHistorialVehiculo = (placa: string) =>
  apiClient.get<Vehiculo & { cliente: any; ordenes_reparacion: any[] }>(
    `/vehiculos/placa/${encodeURIComponent(placa)}/historial`
  );

