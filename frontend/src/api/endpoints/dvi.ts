import apiClient from '../client';
import type {
  InspeccionDVI,
  ItemDVI,
  EstadoDVI,
  EvidenciaInspeccion,
} from '../../types';

export const createOrInitDVI = (data: {
  orden_id: number;
  tecnico_responsable?: string;
  usar_plantilla_esencial?: boolean;
}) =>
  apiClient.post<InspeccionDVI>('/dvi', {
    usar_plantilla_esencial: true,
    ...data,
  });

export const getDVIByOrden = (ordenId: number) =>
  apiClient.get<InspeccionDVI>(`/dvi/orden/${ordenId}`);

export const updateItem = (
  id: number,
  data: { estado?: EstadoDVI; observaciones?: string },
) => apiClient.patch<ItemDVI>(`/dvi/items/${id}`, data);

export const attachEvidenceToItem = (
  itemId: number,
  data: {
    archivo_base64: string;
    tipo_archivo?: 'foto' | 'video';
    descripcion?: string;
  }
) =>
  apiClient.post<EvidenciaInspeccion>(`/dvi/items/${itemId}/evidencias`, {
    tipo_archivo: 'foto',
    ...data,
  });

export const saveFirma = (
  ordenId: number,
  data: {
    firma_base64: string;
    nombre_firmante: string;
    documento_firmante?: string;
    aprobado?: boolean;
    notas?: string;
  }
) =>
  apiClient.post<InspeccionDVI>(`/dvi/orden/${ordenId}/firma`, {
    aprobado: true,
    ...data,
  });

export const downloadPDF = (ordenId: number) =>
  apiClient.get(`/dvi/orden/${ordenId}/pdf`, { responseType: 'blob' });


