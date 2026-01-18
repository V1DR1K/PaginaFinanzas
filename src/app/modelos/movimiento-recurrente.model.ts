export enum FrecuenciaRecurrencia {
  DIARIA = 'DIARIA',
  SEMANAL = 'SEMANAL',
  QUINCENAL = 'QUINCENAL',
  MENSUAL = 'MENSUAL',
  TRIMESTRAL = 'TRIMESTRAL',
  SEMESTRAL = 'SEMESTRAL',
  ANUAL = 'ANUAL'
}

export type Frecuencia = FrecuenciaRecurrencia | 'DIARIA' | 'SEMANAL' | 'QUINCENAL' | 'MENSUAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL';

export interface MovimientoRecurrente {
  id: number;
  tipo: 'ingreso' | 'egreso';
  tipoMovimiento: string;
  categoriaId?: number;
  cantidad: number;
  descripcion?: string;
  frecuencia: FrecuenciaRecurrencia;
  diaEjecucion: number; // Día del mes (1-31) o día de la semana (1-7)
  activo: boolean;
  fechaInicio: string;
  fechaFin?: string;
  proximaEjecucion?: string;
  ultimaEjecucion?: string;
  userId: number;
}

export interface MovimientoRecurrenteRequest {
  tipo: 'ingreso' | 'egreso';
  tipoMovimiento?: string;
  categoriaId?: number;
  cantidad: number;
  descripcion?: string;
  frecuencia: Frecuencia;
  proximaEjecucion: string;
  activo: boolean;
}
