import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly modo = signal<'login' | 'register'>('login');
  readonly nombre = signal('');
  readonly email = signal('');
  readonly password = signal('');
  readonly cargando = signal(false);
  readonly error = signal('');

  alternarModo(): void {
    this.modo.set(this.modo() === 'login' ? 'register' : 'login');
    this.error.set('');
  }

  claseTab(modo: 'login' | 'register'): string {
    return this.modo() === modo
      ? 'rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 py-2 text-sm font-semibold shadow-lg shadow-purple-600/30 transition'
      : 'rounded-lg py-2 text-sm text-slate-400 transition hover:text-white';
  }

  enviar(): void {
    this.modo() === 'login' ? this.login() : this.registrar();
  }

  private login(): void {
    if (!this.email().trim() || !this.password()) {
      this.error.set('Ingresa tu email y contraseña.');
      return;
    }
    this.cargando.set(true);
    this.error.set('');
    this.authService
      .login({ email: this.email(), password: this.password() })
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: () => {
          this.cargando.set(false);
          this.error.set('Credenciales inválidas. Intenta de nuevo.');
        },
        complete: () => this.cargando.set(false),
      });
  }

  private registrar(): void {
    if (!this.nombre().trim() || !this.email().trim() || !this.password()) {
      this.error.set('Completa todos los campos.');
      return;
    }
    this.cargando.set(true);
    this.error.set('');
    this.authService
      .register({
        nombre: this.nombre(),
        email: this.email(),
        password: this.password(),
        rol: 'ROLE_USUARIO',
      })
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: () => {
          this.cargando.set(false);
          this.error.set('No se pudo registrar. Verifica que el email no esté en uso.');
        },
        complete: () => this.cargando.set(false),
      });
  }
}
