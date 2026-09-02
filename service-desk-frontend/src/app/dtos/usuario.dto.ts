export interface Tecnico {
  email: string;
  nombre: string;
  avatarUrl?: string;
}

export interface RegistrarTecnicoRequest {
  nombre: string;
  email: string;
  password?: string;
  especialidad?: string;
}

export interface UsuarioAdmin {
  id: number;
  nombre: string;
  email: string;
  rol: 'ROLE_ADMIN' | 'ROLE_TECNICO' | 'ROLE_USUARIO';
  activo: boolean;
  especialidad?: string;
  telefono?: string;
  avatarUrl?: string;
}
