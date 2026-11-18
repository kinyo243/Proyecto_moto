export interface TasasBCV {
  fuente: string;
  url: string;
  usd: number;
  eur: number;
  fecha_valor: string | null;
  consultado_en: string;
  cached: boolean;
}

export interface MetodosPagoDesglose {
  efectivo_usd: number;
  efectivo_ves: number;
  pago_movil_ves: number;
  punto_debito_ves: number;
  zelle_usd: number;
  transferencia_ves: number;
}

export interface ResumenCajaHoy {
  apertura_fecha: string;
  estado_caja: 'abierta' | 'cerrada';
  total_ingresos_usd: number;
  total_ingresos_ves: number;
  utilidad_estimada_usd: number;
  cantidad_cobros: number;
  creditos_por_cobrar_usd: number;
  desglose: MetodosPagoDesglose;
}

export interface OrdenMovil {
  id: number;
  numero_orden: string;
  placa: string;
  marca_modelo: string;
  cliente_nombre: string;
  cliente_telefono: string;
  estado: 'recepcion' | 'dvi_pendiente' | 'en_espera_repuestos' | 'en_trabajo' | 'control_calidad' | 'listo' | 'entregado';
  bahia?: string;
  total_usd: number;
  saldo_pendiente_usd: number;
  fecha_ingreso: string;
}

export interface RepuestoInventario {
  id: number;
  codigo_parte: string;
  descripcion: string;
  categoria: string;
  stock_actual: number;
  stock_minimo: number;
  ubicacion_pasillo: string;
  ubicacion_estante: string;
  ubicacion_gaveta?: string;
  costo_usd: number;
  precio_venta_usd: number;
}

export interface ItemDviMovil {
  id: number;
  categoria: string;
  nombre: string;
  estado: 'verde' | 'amarillo' | 'rojo' | 'sin_evaluar';
  foto_url?: string;
  observaciones?: string;
}

