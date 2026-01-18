export interface Categoria {
  id: number;
  nombre: string;
  tipo: 'ingreso' | 'egreso';
  icono?: string;
  color?: string;
  userId: number;
  categoriaPadreId?: number;
  subcategorias?: Categoria[];
}

export interface CategoriaRequest {
  nombre: string;
  tipo: 'ingreso' | 'egreso';
  icono?: string;
  color?: string;
  categoriaPadreId?: number;
}
