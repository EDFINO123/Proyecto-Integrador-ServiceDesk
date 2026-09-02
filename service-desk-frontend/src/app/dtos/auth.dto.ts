export type Rol = 'ROLE_ADMIN' | 'ROLE_TECNICO' | 'ROLE_USUARIO';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
}

export interface AuthResponse {
  token: string;
  email: string;
  nombre: string;
  rol: Rol;
  telefono?: string;
  avatarUrl?: string;
}
