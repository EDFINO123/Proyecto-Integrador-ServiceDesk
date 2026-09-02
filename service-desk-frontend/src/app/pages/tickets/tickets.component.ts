import {
  Component,
  computed,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  EstadoTicket,
  PrioridadTicket,
  Ticket,
} from '../../models/ticket.model';
import { Tecnico } from '../../dtos/usuario.dto';
import { AuthService } from '../../services/auth.service';
import { TicketService } from '../../services/ticket.service';
import { AvatarComponent } from '../../shared/avatar/avatar.component';

type FiltroEstado = 'TODOS' | EstadoTicket;

@Component({
  selector: 'app-tickets',
  imports: [FormsModule, AvatarComponent],
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.css',
})
export class TicketsComponent {
  private readonly ticketService = inject(TicketService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly usuario = this.authService.usuario;

  readonly esAdmin = computed(() => this.usuario()?.rol === 'ROLE_ADMIN');
  readonly esTecnico = computed(() => this.usuario()?.rol === 'ROLE_TECNICO');
  readonly esGestion = computed(() => this.esAdmin() || this.esTecnico());
  readonly esUsuario = computed(() => this.usuario()?.rol === 'ROLE_USUARIO');

  readonly tituloVista = computed(() => {
    if (this.esAdmin()) {
      return 'Panel de Administración';
    }
    if (this.esTecnico()) {
      return 'Vista Técnico';
    }
    return 'Mis Incidencias';
  });

  readonly subtituloVista = computed(() =>
    this.esGestion()
      ? 'Gestión global de las incidencias de la empresa'
      : 'Consulta y reporta tus incidencias de soporte',
  );

  readonly claseBadgeGestion = computed(() =>
    this.esAdmin()
      ? 'border-purple-500/40 bg-purple-500/10 text-purple-300'
      : 'border-sky-500/40 bg-sky-500/10 text-sky-300',
  );

  readonly etiquetaBadgeGestion = computed(() =>
    this.esAdmin() ? 'Admin' : 'Técnico',
  );

  readonly tickets = signal<Ticket[]>([]);
  readonly mostrarModal = signal(false);
  readonly cargando = signal(false);

  readonly titulo = signal('');
  readonly descripcion = signal('');
  readonly adjuntoUrl = signal('');
  readonly prioridad = signal<PrioridadTicket>('MEDIA');
  readonly prioridades: PrioridadTicket[] = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];

  readonly filtroEstado = signal<FiltroEstado>('TODOS');
  readonly busqueda = signal('');
  readonly filtros: { valor: FiltroEstado; etiqueta: string }[] = [
    { valor: 'TODOS', etiqueta: 'Todos' },
    { valor: 'ABIERTO', etiqueta: 'Abiertos' },
    { valor: 'EN_PROCESO', etiqueta: 'En Proceso' },
    { valor: 'RESUELTO', etiqueta: 'Resueltos' },
    { valor: 'CERRADO', etiqueta: 'Cerrados' },
  ];

  readonly menuAbierto = signal<number | null>(null);
  readonly ticketAEliminar = signal<Ticket | null>(null);
  readonly tecnicos = signal<Tecnico[]>([]);

  readonly totalTickets = computed(() => this.tickets().length);
  readonly abiertos = computed(() => this.tickets().filter((t) => t.estado === 'ABIERTO').length);
  readonly enProceso = computed(() => this.tickets().filter((t) => t.estado === 'EN_PROCESO').length);
  readonly resueltosCerrados = computed(() =>
    this.tickets().filter((t) => t.estado === 'RESUELTO' || t.estado === 'CERRADO').length,
  );

  readonly ticketsFiltrados = computed(() => {
    const estado = this.filtroEstado();
    const q = this.busqueda().trim().toLowerCase();

    return this.tickets().filter((t) => {
      const cumpleEstado = estado === 'TODOS' || t.estado === estado;
      if (!cumpleEstado) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        t.titulo.toLowerCase().includes(q) ||
        t.descripcion.toLowerCase().includes(q)
      );
    });
  });

  constructor() {
    this.cargarTickets();
    if (this.esAdmin()) {
      this.ticketService.obtenerTecnicos().subscribe({
        next: (lista) => this.tecnicos.set(lista),
      });
    }
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.menuAbierto.set(null);
  }

  cargarTickets(): void {
    this.cargando.set(true);
    const fuente = this.esUsuario()
      ? this.ticketService.obtenerMisTickets()
      : this.ticketService.obtenerTodos();
    fuente.subscribe({
      next: (lista) => this.tickets.set(lista),
      error: () => this.cargando.set(false),
      complete: () => this.cargando.set(false),
    });
  }

  abrirModal(): void {
    this.titulo.set('');
    this.descripcion.set('');
    this.adjuntoUrl.set('');
    this.prioridad.set('MEDIA');
    this.mostrarModal.set(true);
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
  }

  verDetalle(ticket: Ticket): void {
    if (ticket.id != null) {
      this.router.navigate(['/ticket', ticket.id]);
    }
  }

  pendienteDeCalificar(ticket: Ticket): boolean {
    return ticket.estado === 'RESUELTO' && ticket.calificacion == null;
  }

  guardarTicket(): void {
    if (!this.titulo().trim()) {
      return;
    }
    this.ticketService
      .crearTicket({
        titulo: this.titulo(),
        descripcion: this.descripcion(),
        adjuntoUrl: this.adjuntoUrl().trim() || undefined,
        estado: 'ABIERTO',
        prioridad: this.prioridad(),
      })
      .subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarTickets();
        },
      });
  }

  toggleMenu(id: number | undefined): void {
    this.menuAbierto.set(this.menuAbierto() === id ? null : (id ?? null));
  }

  siguientesEstados(estado: EstadoTicket): EstadoTicket[] {
    const transiciones: Record<EstadoTicket, EstadoTicket[]> = {
      ABIERTO: ['EN_PROCESO', 'CERRADO'],
      EN_PROCESO: ['RESUELTO', 'CERRADO'],
      RESUELTO: ['CERRADO'],
      CERRADO: [],
    };
    return transiciones[estado];
  }

  cambiarEstado(ticket: Ticket, estado: EstadoTicket): void {
    if (!ticket.id) {
      return;
    }
    this.ticketService.actualizarEstado(ticket.id, estado).subscribe({
      next: () => {
        this.menuAbierto.set(null);
        this.cargarTickets();
      },
    });
  }

  asignarTicket(ticket: Ticket, tecnicoEmail: string): void {
    if (!ticket.id || !tecnicoEmail) {
      return;
    }
    this.ticketService.asignarTicket(ticket.id, tecnicoEmail).subscribe({
      next: () => {
        this.menuAbierto.set(null);
        this.cargarTickets();
      },
    });
  }

  abrirConfirmacionEliminar(ticket: Ticket): void {
    this.ticketAEliminar.set(ticket);
  }

  cancelarEliminacion(): void {
    this.ticketAEliminar.set(null);
  }

  confirmarEliminacion(): void {
    const ticket = this.ticketAEliminar();
    if (!ticket?.id) {
      return;
    }
    this.ticketService.eliminarTicket(ticket.id).subscribe({
      next: () => {
        this.ticketAEliminar.set(null);
        this.cargarTickets();
      },
    });
  }

  claseFiltro(valor: FiltroEstado): string {
    return this.filtroEstado() === valor
      ? 'rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1.5 text-sm font-semibold shadow-lg shadow-purple-600/30 transition active:scale-95'
      : 'rounded-full border border-slate-800/80 bg-slate-900/40 px-4 py-1.5 text-sm text-slate-400 backdrop-blur-md transition hover:border-purple-600/50 hover:text-white';
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
