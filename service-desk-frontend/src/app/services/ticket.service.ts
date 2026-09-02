import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Tecnico } from '../dtos/usuario.dto';
import { Comentario } from '../models/comentario.model';
import { EstadoTicket, Ticket } from '../models/ticket.model';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/tickets';

  obtenerTecnicos(): Observable<Tecnico[]> {
    return this.http.get<Tecnico[]>('http://localhost:8080/api/usuarios/tecnicos');
  }

  asignarTicket(id: number, tecnicoEmail: string): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.apiUrl}/${id}/asignar`, { tecnicoEmail });
  }

  obtenerTodos(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.apiUrl);
  }

  obtenerMisTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/mis`);
  }

  obtenerAsignados(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/asignados`);
  }

  obtenerPendientes(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/pendientes`);
  }

  tomarTicket(id: number): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.apiUrl}/${id}/tomar`, null);
  }

  guardarSolucion(id: number, solucion: string): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.apiUrl}/${id}/solucion`, { solucion });
  }

  obtenerPorId(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`);
  }

  crearTicket(ticket: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, ticket);
  }

  actualizarEstado(id: number, estado: EstadoTicket): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.apiUrl}/${id}/estado`, null, {
      params: { estado },
    });
  }

  calificarTicket(id: number, calificacion: number): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.apiUrl}/${id}/calificar`, {
      calificacion,
    });
  }

  obtenerComentarios(id: number): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(`${this.apiUrl}/${id}/comentarios`);
  }

  crearComentario(id: number, mensaje: string): Observable<Comentario> {
    return this.http.post<Comentario>(`${this.apiUrl}/${id}/comentarios`, {
      mensaje,
    });
  }

  eliminarTicket(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
