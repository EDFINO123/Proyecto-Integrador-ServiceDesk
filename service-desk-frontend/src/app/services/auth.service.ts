import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '../dtos/auth.dto';
import {
  RegistrarTecnicoRequest,
  UsuarioAdmin,
} from '../dtos/usuario.dto';
import { PerfilRequest } from '../dtos/perfil.dto';

const TOKEN_KEY = 'servicedesk_token';
const USUARIO_KEY = 'servicedesk_usuario';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiRoot = 'http://localhost:8080';
  private readonly apiUrl = 'http://localhost:8080/api/auth';

  private readonly usuarioSignal = signal<AuthResponse | null>(null);

  readonly usuario = this.usuarioSignal.asReadonly();
  readonly estaAutenticado = computed(() => this.usuarioSignal() !== null);

  constructor() {
    this.restaurarSesion();
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap((response) => this.guardarSesion(response)),
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap((response) => this.guardarSesion(response)),
    );
  }

  registrarTecnico(request: RegistrarTecnicoRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiRoot}/api/admin/usuarios/tecnico`,
      request,
    );
  }

  obtenerUsuarios(): Observable<UsuarioAdmin[]> {
    return this.http.get<UsuarioAdmin[]>(`${this.apiRoot}/api/admin/usuarios`);
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiRoot}/api/admin/usuarios/${id}`);
  }

  actualizarPerfil(request: PerfilRequest): Observable<AuthResponse> {
    return this.http
      .patch<AuthResponse>(`${this.apiRoot}/api/perfil`, request)
      .pipe(tap((response) => this.guardarSesion(response)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    this.usuarioSignal.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private guardarSesion(response: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(response));
    this.usuarioSignal.set(response);
  }

  private restaurarSesion(): void {
    const usuario = localStorage.getItem(USUARIO_KEY);
    if (!usuario) {
      return;
    }
    try {
      this.usuarioSignal.set(JSON.parse(usuario));
    } catch {
      localStorage.removeItem(USUARIO_KEY);
    }
  }
}
