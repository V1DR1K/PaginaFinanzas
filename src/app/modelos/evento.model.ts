export interface Evento {
  id?: string;
  fecha: Date;
  descripcion: string;
  usuario: string;
  tipoId?: string;
}
