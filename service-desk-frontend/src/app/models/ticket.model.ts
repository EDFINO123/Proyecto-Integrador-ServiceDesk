export type EstadoTicket = 'ABIERTO' | 'EN_PROCESO' | 'RESUELTO' | 'CERRADO';

export type PrioridadTicket = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export interface Ticket {
  id?: number;
  titulo: string;
  descripcion: string;
  estado: EstadoTicket;
  prioridad: PrioridadTicket;
  usuarioEmail?: string;
  tecnicoEmail?: string;
  usuarioNombre?: string;
  usuarioAvatar?: string;
  tecnicoNombre?: string;
  tecnicoAvatar?: string;
  solucion?: string;
  adjuntoUrl?: string;
  calificacion?: number;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}
