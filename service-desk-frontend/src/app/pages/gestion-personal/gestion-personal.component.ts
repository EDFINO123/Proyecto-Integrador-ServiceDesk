import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { UsuarioAdmin } from '../../dtos/usuario.dto';
import { AuthService } from '../../services/auth.service';
import { AvatarComponent } from '../../shared/avatar/avatar.component';

type Filtro = 'TODOS' | 'TECNICOS';

@Component({
  selector: 'app-gestion-personal',
  imports: [FormsModule, AvatarComponent],
  templateUrl: './gestion-personal.component.html',
  styleUrl: './gestion-personal.component.css',
})
export class GestionPersonalComponent {
  private readonly authService = inject(AuthService);

  readonly usuarios = signal<UsuarioAdmin[]>([]);
  readonly cargando = signal(false);

  readonly filtro = signal<Filtro>('TODOS');
  readonly especialidades = [
    'Soporte General',
    'Redes y Conectividad',
    'Hardware',
    'Software y Aplicaciones',
    'Base de Datos',
    'Infraestructura',
    'Seguridad',
  ];

  readonly mostrarModal = signal(false);
  readonly guardando = signal(false);
  readonly error = signal('');

  readonly usuarioAEliminar = signal<UsuarioAdmin | null>(null);
  readonly eliminando = signal(false);

  readonly nombre = signal('');
  readonly email = signal('');
  readonly password = signal('');
  readonly especialidad = signal('Soporte General');

  readonly totalUsuarios = computed(() => this.usuarios().length);
  readonly totalTecnicos = computed(() =>
    this.usuarios().filter((u) => u.rol === 'ROLE_TECNICO').length,
  );
  readonly totalActivos = computed(
    () => this.usuarios().filter((u) => u.activo).length,
  );

  readonly usuariosVisibles = computed(() => {
    const lista = this.usuarios();
    return this.filtro() === 'TODOS'
      ? lista
      : lista.filter((u) => u.rol === 'ROLE_TECNICO');
  });

  constructor() {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando.set(true);
    this.authService.obtenerUsuarios().subscribe({
      next: (lista) => this.usuarios.set(lista),
      error: () => this.cargando.set(false),
      complete: () => this.cargando.set(false),
    });
  }

  esCuentaPropia(usuario: UsuarioAdmin): boolean {
    return usuario.email === this.authService.usuario()?.email;
  }

  abrirConfirmacion(usuario: UsuarioAdmin): void {
    this.error.set('');
    this.usuarioAEliminar.set(usuario);
  }

  cancelarEliminacion(): void {
    if (!this.eliminando()) {
      this.usuarioAEliminar.set(null);
    }
  }

  confirmarEliminacion(): void {
    const usuario = this.usuarioAEliminar();
    if (!usuario) {
      return;
    }
    this.eliminando.set(true);
    this.error.set('');
    this.authService.eliminarUsuario(usuario.id).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.usuarioAEliminar.set(null);
        this.cargarUsuarios();
      },
      error: (err) => {
        this.eliminando.set(false);
        this.error.set(
          err?.status === 409
            ? 'No se puede eliminar esta cuenta: tiene datos asociados.'
            : 'No se pudo eliminar la cuenta. Intenta de nuevo.',
        );
      },
    });
  }

  abrirModal(): void {
    this.nombre.set('');
    this.email.set('');
    this.password.set('');
    this.especialidad.set('Soporte General');
    this.error.set('');
    this.mostrarModal.set(true);
  }

  cerrarModal(): void {
    if (!this.guardando()) {
      this.mostrarModal.set(false);
    }
  }

  registrarTecnico(): void {
    if (!this.nombre().trim() || !this.email().trim()) {
      this.error.set('Completa el nombre y el email.');
      return;
    }
    this.guardando.set(true);
    this.error.set('');
    this.authService
      .registrarTecnico({
        nombre: this.nombre(),
        email: this.email(),
        password: this.password().trim() || undefined,
        especialidad: this.especialidad(),
      })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.mostrarModal.set(false);
          this.cargarUsuarios();
        },
        error: (err) => {
          this.guardando.set(false);
          this.error.set(
            err?.status === 409
              ? 'El email ya está registrado.'
              : 'No se pudo registrar el técnico. Intenta de nuevo.',
          );
        },
      });
  }

  rolLabel(rol: UsuarioAdmin['rol']): string {
    const labels = {
      ROLE_ADMIN: 'Administrador',
      ROLE_TECNICO: 'Técnico',
      ROLE_USUARIO: 'Usuario',
    } as const;
    return labels[rol];
  }

  claseRol(rol: UsuarioAdmin['rol']): string {
    const clases = {
      ROLE_ADMIN: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      ROLE_TECNICO: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      ROLE_USUARIO: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    } as const;
    return clases[rol];
  }

  claseFiltro(valor: Filtro): string {
    return this.filtro() === valor
      ? 'rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1.5 text-sm font-semibold shadow-lg shadow-purple-600/30 transition active:scale-95'
      : 'rounded-full border border-slate-800/80 bg-slate-900/40 px-4 py-1.5 text-sm text-slate-400 backdrop-blur-md transition hover:border-purple-600/50 hover:text-white';
  }
}
