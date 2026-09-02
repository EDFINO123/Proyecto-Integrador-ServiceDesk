import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { AVATARES_PRESET } from '../../shared/avatares';
import { AvatarComponent } from '../../shared/avatar/avatar.component';

@Component({
  selector: 'app-perfil',
  imports: [FormsModule, AvatarComponent],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css',
})
export class PerfilComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly usuario = this.authService.usuario;
  readonly avatares = AVATARES_PRESET;

  readonly nombre = signal('');
  readonly telefono = signal('');
  readonly avatarUrl = signal('');
  readonly urlPropia = signal('');
  readonly mostrarUrl = signal(false);

  readonly guardando = signal(false);
  readonly error = signal('');
  readonly exito = signal('');

  readonly avatarPreview = computed(() => ({
    nombre: this.nombre() || this.usuario()?.nombre || '?',
    avatarUrl: this.avatarUrl() || undefined,
  }));

  constructor() {
    const u = this.usuario();
    if (u) {
      this.nombre.set(u.nombre);
      this.telefono.set(u.telefono ?? '');
      const av = u.avatarUrl ?? '';
      this.avatarUrl.set(av);
      if (av && !av.startsWith('sd-avatar:') && !av.startsWith('data:')) {
        this.urlPropia.set(av);
        this.mostrarUrl.set(true);
      }
    }
  }

  seleccionarPreset(token: string): void {
    this.avatarUrl.set(token);
    this.error.set('');
  }

  aplicarUrlPropia(): void {
    const url = this.urlPropia().trim();
    if (!url) {
      return;
    }
    this.avatarUrl.set(url);
    this.error.set('');
  }

  esSeleccionado(token: string): boolean {
    return this.avatarUrl() === token;
  }

  rolLabel(): string {
    const rol = this.usuario()?.rol;
    if (rol === 'ROLE_ADMIN') {
      return 'Administrador';
    }
    if (rol === 'ROLE_TECNICO') {
      return 'Técnico';
    }
    return 'Usuario';
  }

  volverAlDashboard(): void {
    const ruta = this.usuario()?.rol === 'ROLE_TECNICO' ? '/tecnico/dashboard' : '/dashboard';
    this.router.navigate([ruta]);
  }

  guardar(): void {
    if (!this.nombre().trim()) {
      this.error.set('El nombre no puede estar vacío.');
      return;
    }
    this.guardando.set(true);
    this.error.set('');
    this.exito.set('');
    this.authService
      .actualizarPerfil({
        nombre: this.nombre().trim(),
        telefono: this.telefono().trim() || undefined,
        avatarUrl: this.avatarUrl() || undefined,
      })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.exito.set('Perfil actualizado correctamente.');
        },
        error: () => {
          this.guardando.set(false);
          this.error.set('No se pudo actualizar el perfil. Intenta de nuevo.');
        },
      });
  }
}
