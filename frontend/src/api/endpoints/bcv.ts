import apiClient from '../client';

export interface TasasBCV {
  fuente: string;
  url: string;
  usd: number;
  eur: number;
  fecha_valor: string | null;
  consultado_en: string;
  cached: boolean;
  antiguedad_segundos?: number;
  aviso?: string;
}

export const getTasasBCV = (forceRefresh = false) =>
  apiClient.get<TasasBCV>('/bcv/tasas', {
    params: { force_refresh: forceRefresh },
  });

