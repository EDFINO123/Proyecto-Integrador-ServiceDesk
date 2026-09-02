export interface Comentario {
  id: number;
  ticketId: number;
  autorEmail: string;
  autorNombre: string;
  autorAvatar?: string;
  mensaje: string;
  fechaCreacion: string;
}
