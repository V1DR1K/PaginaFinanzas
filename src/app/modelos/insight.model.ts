export enum TipoInsight {
  GASTO_AUMENTADO = 'GASTO_AUMENTADO',
  GASTO_DISMINUIDO = 'GASTO_DISMINUIDO',
  AHORRO_POTENCIAL = 'AHORRO_POTENCIAL',
  GASTO_INUSUAL = 'GASTO_INUSUAL',
  META_CERCANA = 'META_CERCANA',
  PATRON_DETECTADO = 'PATRON_DETECTADO'
}

export enum SeveridadInsight {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ALERT = 'ALERT'
}

export interface Insight {
  id: number;
  tipo: 'AHORRO' | 'GASTO' | 'TENDENCIA' | 'ALERTA' | 'SUGERENCIA';
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  severidad: SeveridadInsight;
  titulo: string;
  descripcion: string;
  monto?: number;
  categoria?: string;
  fecha: string;
  fechaGeneracion: string;
  leido: boolean;
  userId: number;
}

export interface InsightsResponse {
  insights: Insight[];
  gastosInusuales: GastoInusual[];
}

export interface GastoInusual {
  id: number;
  movimientoId: number;
  tipo: string;
  cantidad: number;
  cantidadActual: number;
  descripcion?: string;
  fecha: string;
  promedioHistorico: number;
  desviacion: number;
  porcentajeDesviacion: number;
  razon: string;
  motivoAlerta: string;
}
