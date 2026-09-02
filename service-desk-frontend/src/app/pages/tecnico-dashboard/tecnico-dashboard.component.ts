import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  EstadoTicket,
  PrioridadTicket,
  Ticket,
} from '../../models/ticket.model';
import { AuthService } from '../../services/auth.service';
import { TicketService } from '../../services/ticket.service';
import { AvatarComponent } from '../../shared/avatar/avatar.component';

type Bandeja = 'asignados' | 'pendientes';

@Component({
  selector: 'app-tecnico-dashboard',
  imports: [FormsModule, AvatarComponent],
  templateUrl: './tecnico-dashboard.component.html',
  styleUrl: './tecnico-dashboard.component.css',
})
export class TecnicoDashboardComponent {
  private readonly ticketService = inject(TicketService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly usuario = this.authService.usuario;

  readonly asignados = signal<Ticket[]>([]);
  readonly pendientes = signal<Ticket[]>([]);
  readonly cargando = signal(false);

  readonly bandeja = signal<Bandeja>('asignados');

  readonly ticketActivo = signal<Ticket | null>(null);
  readonly solucion = signal('');
  readonly solucionCargando = signal(false);
  readonly tomando = signal(false);
  readonly error = signal('');

  readonly totalAsignados = computed(() => this.asignados().length);
  readonly totalPendientes = computed(() => this.pendientes().length);
  readonly resueltosHoy = computed(() => {
    const hoy = new Date().toISOString().slice(0, 10);
    return this.asignados().filter(
      (t) => t.estado === 'RESUELTO' && (t.fechaActualizacion ?? '').startsWith(hoy),
    ).length;
  });

  readonly ticketsVisibles = computed(() =>
    this.bandeja() === 'asignados' ? this.asignados() : this.pendientes(),
  );

  constructor() {
    this.cargarTodo();
  }

  cargarTodo(): void {
    this.cargando.set(true);
    this.ticketService.obtenerAsignados().subscribe({
      next: (lista) => this.asignados.set(lista),
      error: () => this.cargando.set(false),
    });
    this.ticketService.obtenerPendientes().subscribe({
      next: (lista) => this.pendientes.set(lista),
      error: () => this.cargando.set(false),
      complete: () => this.cargando.set(false),
    });
  }

  esMio(ticket: Ticket): boolean {
    return ticket.tecnicoEmail != null && ticket.tecnicoEmail === this.usuario()?.email;
  }

  abrirAccion(ticket: Ticket): void {
    this.solucion.set(ticket.solucion ?? '');
    this.ticketActivo.set(ticket);
    this.error.set('');
  }

  verDetalle(ticket: Ticket): void {
    if (ticket.id != null) {
      this.router.navigate(['/ticket', ticket.id]);
    }
  }

  cerrarAccion(): void {
    this.ticketActivo.set(null);
  }

  tomarTicket(): void {
    const ticket = this.ticketActivo();
    if (!ticket?.id) {
      return;
    }
    this.tomando.set(true);
    this.ticketService.tomarTicket(ticket.id).subscribe({
      next: (actualizado) => {
        this.tomando.set(false);
        this.ticketActivo.set(actualizado);
        this.cargarTodo();
      },
      error: () => this.tomando.set(false),
    });
  }

  cambiarEstado(estado: EstadoTicket): void {
    const ticket = this.ticketActivo();
    if (!ticket?.id) {
      return;
    }
    if (estado === 'RESUELTO' && !this.solucion().trim()) {
      this.error.set('Debes guardar la solución antes de marcar el ticket como resuelto.');
      return;
    }
    this.error.set('');
    this.ticketService.actualizarEstado(ticket.id, estado).subscribe({
      next: (actualizado) => {
        this.ticketActivo.set(actualizado);
        this.cargarTodo();
      },
    });
  }

  guardarSolucion(): void {
    const ticket = this.ticketActivo();
    if (!ticket?.id) {
      return;
    }
    this.solucionCargando.set(true);
    this.ticketService.guardarSolucion(ticket.id, this.solucion()).subscribe({
      next: (actualizado) => {
        this.solucionCargando.set(false);
        this.ticketActivo.set(actualizado);
        this.cargarTodo();
      },
      error: () => this.solucionCargando.set(false),
    });
  }

  opcionesEstado(estado: EstadoTicket): EstadoTicket[] {
    const transiciones: Record<EstadoTicket, EstadoTicket[]> = {
      ABIERTO: ['EN_PROCESO'],
      EN_PROCESO: ['RESUELTO'],
      RESUELTO: [],
      CERRADO: [],
    };
    return transiciones[estado];
  }

  claseBandeja(valor: Bandeja): string {
    return this.bandeja() === valor
      ? 'rounded-full bg-gradient-to-r from-sky-600 to-purple-600 px-4 py-1.5 text-sm font-semibold shadow-lg shadow-sky-600/30 transition active:scale-95'
      : 'rounded-full border border-slate-800/80 bg-slate-900/40 px-4 py-1.5 text-sm text-slate-400 backdrop-blur-md transition hover:border-sky-600/50 hover:text-white';
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
