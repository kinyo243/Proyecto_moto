import { useEffect, useState, useCallback } from 'react';
import { getOrdenes } from '../api/endpoints/ordenes';
import { getBahias } from '../api/endpoints/bahias';
import type { OrdenReparacion, Bahia } from '../types';

const ACTIVE_STATES = ['En Espera', 'En Diagnóstico', 'En Reparación', 'Listo'];

interface DashboardData {
  ordenes: OrdenReparacion[];
  bahias: Bahia[];
  loading: boolean;
  error: string | null;
  activeCount: number;
  pendingInspections: number;
  refresh: () => void;
}

export function useDashboard(): DashboardData {
  const [ordenes, setOrdenes] = useState<OrdenReparacion[]>([]);
  const [bahias, setBahias] = useState<Bahia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordenesRes, bahiasRes] = await Promise.all([
        getOrdenes({ limit: 50 }),
        getBahias(),
      ]);
      setOrdenes(ordenesRes.data);
      setBahias(bahiasRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const activeCount = ordenes.filter((o) =>
    ACTIVE_STATES.includes(o.estado),
  ).length;

  // Orders in "En Espera" or "En Diagnóstico" are considered pending inspection
  const pendingInspections = ordenes.filter(
    (o) => o.estado === 'En Espera' || o.estado === 'En Diagnóstico',
  ).length;

  return {
    ordenes,
    bahias,
    loading,
    error,
    activeCount,
    pendingInspections,
    refresh: fetchAll,
  };
}

