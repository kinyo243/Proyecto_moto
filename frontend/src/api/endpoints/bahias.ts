import apiClient from '../client';
import type { Bahia, BahiaDetail, Camara, EvidenciaCapturada } from '../../types';

export const getBahias = () => apiClient.get<BahiaDetail[]>('/bahias');

export const getBahia = (id: number) =>
  apiClient.get<Bahia & { camaras: Camara[] }>(`/bahias/${id}`);

export const captureBahiaPhoto = (
  bahiaId: number,
  data: {
    imagen_base64: string;
    camara_id?: number;
    notas?: string;
  }
) => apiClient.post<EvidenciaCapturada>(`/bahias/${bahiaId}/captura`, data);

export const uploadEvidenciaFormData = async (
  bahiaId: number,
  formData: FormData
) => {
  // Convierte el blob a base64 para el endpoint de bahía
  const file = formData.get('file') as File | null;
  const notas = formData.get('notas') as string | null;
  const camaraId = formData.get('camara_id') as string | null;

  if (file) {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    return captureBahiaPhoto(bahiaId, {
      imagen_base64: base64,
      notas: notas || undefined,
      camara_id: camaraId ? parseInt(camaraId, 10) : undefined,
    });
  }

  throw new Error('Archivo no encontrado en FormData');
};


