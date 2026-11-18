const es = {
  // Nav
  'nav.dashboard': 'Dashboard',
  'nav.recepcion': 'Recepción / DVI',
  'nav.ordenes': 'Órdenes',
  'nav.camaras': 'Cámaras',
  'nav.configuracion': 'Configuración',

  // Connection
  'conn.connected': 'Conectado',
  'conn.disconnected': 'Sin conexión',
  'conn.checking': 'Verificando...',

  // Dashboard metrics
  'dash.active_orders': 'Órdenes Activas',
  'dash.vehicles_in_bays': 'Vehículos en Bahías',
  'dash.pending_inspections': 'Inspecciones Pendientes',
  'dash.recent_orders': 'Órdenes Recientes',
  'dash.no_orders': 'No hay órdenes activas.',
  'dash.loading': 'Cargando...',
  'dash.error': 'Error al cargar datos.',
  'dash.refresh': 'Actualizar',

  // Table headers
  'table.id': '#',
  'table.plate': 'Placa',
  'table.vehicle': 'Vehículo',
  'table.client': 'Cliente',
  'table.bay': 'Bahía',
  'table.status': 'Estado',
  'table.created': 'Ingreso',
  'table.actions': 'Acciones',

  // Status labels
  'status.En Espera': 'En Espera',
  'status.En Diagnóstico': 'En Diagnóstico',
  'status.En Reparación': 'En Reparación',
  'status.Listo': 'Listo',
  'status.Entregado': 'Entregado',

  // Misc
  'misc.view': 'Ver',
  'misc.edit': 'Editar',
  'misc.coming_soon': 'Próximamente',
} as const;

export default es;
export type TranslationKey = keyof typeof es;

