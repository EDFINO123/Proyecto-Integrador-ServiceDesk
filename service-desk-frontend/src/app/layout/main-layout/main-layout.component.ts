import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { AvatarComponent } from '../../shared/avatar/avatar.component';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AvatarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly usuario = this.authService.usuario;
  readonly menuAbierto = signal(false);

  readonly esAdmin = computed(() => this.usuario()?.rol === 'ROLE_ADMIN');

  readonly rolLabel = computed(() => {
    const rol = this.usuario()?.rol;
    if (rol === 'ROLE_ADMIN') {
      return 'Administrador';
    }
    if (rol === 'ROLE_TECNICO') {
      return 'Técnico';
    }
    return 'Usuario';
  });

  readonly claseRol = computed(() => {
    const rol = this.usuario()?.rol;
    if (rol === 'ROLE_ADMIN') {
      return 'border-purple-500/40 bg-purple-500/10 text-purple-300';
    }
    if (rol === 'ROLE_TECNICO') {
      return 'border-sky-500/40 bg-sky-500/10 text-sky-300';
    }
    return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
  });

  @HostListener('document:click')
  cerrarMenuAlExterior(): void {
    this.menuAbierto.set(false);
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuAbierto.set(!this.menuAbierto());
  }

  irAlPerfil(event: Event): void {
    event.stopPropagation();
    this.menuAbierto.set(false);
    this.router.navigate(['/perfil']);
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
