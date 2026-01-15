export interface Movimiento {
  id: number;
  tipo: 'ingreso' | 'egreso';
  cantidad: number;
  fecha: string;
  descripcion?: string;
}
