import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Comentario } from '../../models/comentario.model';
import {
  EstadoTicket,
  PrioridadTicket,
  Ticket,
} from '../../models/ticket.model';
import { AuthService } from '../../services/auth.service';
import { TicketService } from '../../services/ticket.service';
import { AvatarComponent } from '../../shared/avatar/avatar.component';

@Component({
  selector: 'app-ticket-detalle',
  imports: [FormsModule, AvatarComponent],
  templateUrl: './ticket-detalle.component.html',
  styleUrl: './ticket-detalle.component.css',
})
export class TicketDetalleComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ticketService = inject(TicketService);
  private readonly authService = inject(AuthService);

  readonly usuario = this.authService.usuario;

  readonly ticket = signal<Ticket | null>(null);
  readonly comentarios = signal<Comentario[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly adjuntoRoto = signal(false);

  readonly nuevoMensaje = signal('');
  readonly enviando = signal(false);

  readonly solucion = signal('');
  readonly guardandoSolucion = signal(false);

  readonly calificacion = signal(0);
  readonly calificando = signal(false);
  readonly mostrarCalificacion = signal(false);

  readonly id = computed(() =>
    Number(this.route.snapshot.paramMap.get('id')),
  );

  readonly puedeGestionar = computed(() => {
    const rol = this.usuario()?.rol;
    return rol === 'ROLE_TECNICO' || rol === 'ROLE_ADMIN';
  });

  readonly esUsuario = computed(() => this.usuario()?.rol === 'ROLE_USUARIO');

  readonly puedeCalificar = computed(() => {
    const t = this.ticket();
    return (
      this.esUsuario() &&
      t?.estado === 'RESUELTO' &&
      t.calificacion == null
    );
  });

  constructor() {
    this.cargar();
  }

  cargar(): void {
    const id = this.id();
    if (!id) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.cargando.set(true);
    this.error.set('');
    this.adjuntoRoto.set(false);
    this.ticketService.obtenerPorId(id).subscribe({
      next: (t) => {
        this.ticket.set(t);
        this.solucion.set(t.solucion ?? '');
        this.cargarComentarios();
      },
      error: () => {
        this.cargando.set(false);
        this.error.set('No se pudo cargar el ticket.');
      },
    });
  }

  routerBack(): void {
    const rol = this.usuario()?.rol;
    if (rol === 'ROLE_TECNICO') {
      this.router.navigate(['/tecnico/dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  cargarComentarios(): void {
    this.ticketService.obtenerComentarios(this.id()).subscribe({
      next: (lista) => this.comentarios.set(lista),
      error: () => this.cargando.set(false),
      complete: () => this.cargando.set(false),
    });
  }

  esMio(c: Comentario): boolean {
    return c.autorEmail === this.usuario()?.email;
  }

  enviarComentario(): void {
    const mensaje = this.nuevoMensaje().trim();
    if (!mensaje) {
      return;
    }
    this.enviando.set(true);
    this.ticketService.crearComentario(this.id(), mensaje).subscribe({
      next: (c) => {
        this.enviando.set(false);
        this.nuevoMensaje.set('');
        this.comentarios.update((lista) => [...lista, c]);
      },
      error: () => this.enviando.set(false),
    });
  }

  opcionesEstado(): EstadoTicket[] {
    const transiciones: Record<EstadoTicket, EstadoTicket[]> = {
      ABIERTO: ['EN_PROCESO'],
      EN_PROCESO: ['RESUELTO'],
      RESUELTO: [],
      CERRADO: [],
    };
    return transiciones[this.ticket()?.estado ?? 'ABIERTO'];
  }

  cambiarEstado(estado: EstadoTicket): void {
    if (estado === 'RESUELTO' && !this.solucion().trim()) {
      this.error.set('Debes guardar la solución antes de marcar el ticket como resuelto.');
      return;
    }
    this.error.set('');
    this.ticketService.actualizarEstado(this.id(), estado).subscribe({
      next: (t) => {
        this.ticket.set(t);
        this.cargarComentarios();
      },
    });
  }

  guardarSolucion(): void {
    this.guardandoSolucion.set(true);
    this.ticketService
      .guardarSolucion(this.id(), this.solucion())
      .subscribe({
        next: (t) => {
          this.guardandoSolucion.set(false);
          this.ticket.set(t);
        },
        error: () => this.guardandoSolucion.set(false),
      });
  }

  abrirCalificacion(): void {
    this.calificacion.set(0);
    this.mostrarCalificacion.set(true);
  }

  cerrarCalificacion(): void {
    if (!this.calificando()) {
      this.mostrarCalificacion.set(false);
    }
  }

  confirmarCalificacion(): void {
    const nota = this.calificacion();
    if (nota < 1 || nota > 5) {
      return;
    }
    this.calificando.set(true);
    this.ticketService.calificarTicket(this.id(), nota).subscribe({
      next: (t) => {
        this.calificando.set(false);
        this.mostrarCalificacion.set(false);
        this.ticket.set(t);
      },
      error: () => {
        this.calificando.set(false);
        this.error.set('No se pudo calificar el servicio.');
      },
    });
  }

  onEnter(event: Event): void {
    const teclado = event as KeyboardEvent;
    if (teclado.shiftKey) {
      return;
    }
    event.preventDefault();
    this.enviarComentario();
  }

  esImagen(url: string): boolean {
    return (
      url.startsWith('data:image') ||
      /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(url)
    );
  }

  formatoFecha(fecha?: string): string {
    if (!fecha) {
      return '';
    }
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  labelEstado(estado: EstadoTicket): string {
    const labels: Record<EstadoTicket, string> = {
      ABIERTO: 'Abierto',
      EN_PROCESO: 'En Proceso',
      RESUELTO: 'Resuelto',
      CERRADO: 'Cerrado',
    };
    return labels[estado];
  }

  claseEstado(estado: EstadoTicket): string {
    const clases: Record<EstadoTicket, string> = {
      ABIERTO: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      EN_PROCESO: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      RESUELTO: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      CERRADO: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    };
    return clases[estado];
  }

  clasePrioridad(prioridad: PrioridadTicket): string {
    const clases: Record<PrioridadTicket, string> = {
      BAJA: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      MEDIA: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      ALTA: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      CRITICA: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    };
    return clases[prioridad];
  }
}
