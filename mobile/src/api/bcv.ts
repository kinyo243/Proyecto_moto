import mobileApiClient from './client';
import type { TasasBCV } from '../types';

export const getTasasBCVMovil = async (forceRefresh = false): Promise<TasasBCV> => {
  const res = await mobileApiClient.get<TasasBCV>('/bcv/tasas', {
    params: { force_refresh: forceRefresh },
  });
  return res.data;
};
