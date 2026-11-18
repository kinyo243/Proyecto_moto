import apiClient from '../client';
import type { Cliente, CreateClientePayload } from '../../types';

export const createCliente = (
  data: CreateClientePayload,
  getIfExists: boolean = true
) =>
  apiClient.post<Cliente>('/clientes', data, {
    params: { get_if_exists: getIfExists },
  });

export const buscarClientes = (q: string) =>
  apiClient.get<Cliente[]>('/clientes/buscar', { params: { q } });

export const getCliente = (id: number) =>
  apiClient.get<Cliente>(`/clientes/${id}`);


