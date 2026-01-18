export enum TipoMovimiento {
  GASTO = 'Gasto',
  INVERSION = 'Inversion',
  SALARIO = 'Salario'
}

export interface Movimiento {
  id: number;
  tipo: 'ingreso' | 'egreso';
  tipoMovimiento?: TipoMovimiento;
  categoriaId: number;
  cantidad: number;
  fecha: string;
  descripcion?: string;
}
