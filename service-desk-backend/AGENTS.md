## Goal
- Completar el Service Desk full-stack (Spring Boot + Angular) con paneles por rol: gestión de personal ADMIN, panel "Mi Perfil" con avatares, y flujo interactivo de tickets (chat, calificación y adjuntos).

## Constraints & Preferences
- Backend: Spring Boot 3.2.5, JDK 21 (`JAVA_HOME` = `C:\Program Files\Java\jdk-21.0.10`), `jakarta.persistence.*`, Lombok, paquete base `com.example.demo`; compilar con `.\mvnw.cmd compile -q`.
- Frontend: Angular 21 standalone, signals, `inject()`, Tailwind 4, Dark Glassmorphism (`bg-slate-950`, bordes `slate-800/80`, `backdrop-blur-md`, degradados `from-purple-600 to-pink-600`); construir con `ng build` en `C:\Users\user\Documents\AllAngular\service-desk-frontend\service-desk-frontend`.
- CORS solo permite `http://localhost:4200`; API root `http://localhost:8080`.
- Jerarquía de roles: ROLE_USUARIO (sus tickets, crear, ver estado, calificar), ROLE_TECNICO (bandeja, tomar, ABIERTO→EN_PROCESO→RESUELTO, solución), ROLE_ADMIN (global, usuarios).
- Registro público siempre ROLE_USUARIO; los técnicos solo los crea ADMIN.
- Avatares: set local de 10 SVG cyber embebidos como data URIs + URL propia (sin subida de archivos); se guardan en backend y también se reflejan en localStorage+Signal.
- "Nombre de usuario" = campo `nombre` existente; el email sigue siendo identificador de login.
- Estilo ESTABLECIDO: modales `.card-glow rounded-3xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-md`, inputs `rounded-xl border border-slate-800/80 bg-slate-950/60`, botones `rounded-xl bg-gradient-to-r from-purple-600 to-pink-600`.

## Progress
### Done
- **Gestión de Personal (ADMIN) completa y verificada E2E**: `Usuario` + `especialidad` y `activo`; DTOs `RegistrarTecnicoRequestDto` y `UsuarioAdminDto`; `AdminController` (`POST /api/admin/usuarios/tecnico`, `GET /api/admin/usuarios`, `DELETE /api/admin/usuarios/{id}`) con `@PreAuthorize("hasRole('ADMIN')")`; SecurityConfig `requestMatchers("/api/admin/**").authenticated()`; frontend `gestion-personal.component` (KPIs, filtros Todos/Técnicos, modal registro glassmorphism, tabla con badges y avatares, botón "🗑️ Eliminar" por fila + modal de confirmación irreversible, bloqueo de eliminación de la propia cuenta con badge "Eres tú"); ruta `/dashboard/personal` protegida con `rolGuard(['ROLE_ADMIN'])`, pestañas admin en `MainLayoutComponent`. Verificado E2E (14/08/2026): creación de técnico con password por defecto `Tecnico123!`, borrado de cuenta E2E vía API (`ANTES=14 → DESPUES=13`), login posterior bloqueado (403), 403 para no-admin en DELETE, cuentas no eliminables por uno mismo (guard en UI).
- **Mi Perfil full-stack completa y verificada E2E**: `Usuario` + `telefono`/`avatarUrl`; `AuthResponseDto` los incluye; `PATCH /api/perfil` en `PerfilController`; `UsuarioService.actualizarPerfil`; `Ticket` + campos `@Transient` `usuarioNombre/Avatar` y `tecnicoNombre/Avatar`; `TicketServiceImpl` enriquece todas las rutas desde `UsuarioRepository`; `TecnicoDto`/`UsuarioAdminDto` + `avatarUrl`.
- **Frontend Mi Perfil**: `shared/avatares.ts` con 10 SVG tokens `sd-avatar:cyber-N` + `resolverAvatar`; `shared/avatar/avatar.component` reutilizable; página `/perfil` (grid selector avatares glassmorphism, campo URL propia, preview vivo, guarda y actualiza Signal+localStorage); navbar con avatar real + dropdown glassmorphism "Mi Perfil"/"Cerrar Sesión" (cierre con clic fuera); avatares en tarjetas de tickets, nota de solución, menú asignar técnico, dashboard técnico y tabla Gestión Personal.
- **Backend chat/calificación/adjuntos compilado y verificado E2E**: entidad `Comentario` (ticketId, autorEmail, autorNombre, autorAvatar, mensaje, fechaCreacion) + `ComentarioRepository`; DTOs `ComentarioRequestDto` y `CalificacionRequestDto`; `Ticket` + `adjuntoUrl` y `calificacion`; `TicketService`/`TicketServiceImpl` + `calificarTicket` (solo solicitante, solo RESUELTO, valida 1-5, pasa a CERRADO) y `crearComentario`/`obtenerComentarios` (admin o participante); `TicketController` + `GET/POST /{id}/comentarios`, `PATCH /{id}/calificar`.
- **Frontend chat/calificación/adjuntos completo y compilado (`ng build` NG_EXIT=0)**: `ticket-detalle.component` (página `/ticket/:id` con hilo tipo chat con avatares, estados, solución, modal 1-5 ⭐, banner "✅ Tu incidencia fue resuelta", adjunto); `tickets.component` con tarjeta clickeable → detalle, banner "Cerrar & Calificar", campo URL de adjunto en crear (preview); `tecnico-dashboard` con tarjeta clickeable → detalle y botón "Accionar" con `stopPropagation`.

### In Progress
- (ninguno)

### Blocked
- (ninguno)

## Key Decisions
- Máquina de estados validada en `TicketServiceImpl.validarTransicion`: ABIERTO→EN_PROCESO→RESUELTO→CERRADO (también ABIERTO/EN_PROCESO→CERRADO); transiciones ilegales → 400 y RESUELTO exige `solucion` previa (400 si no). El frontend guarda la solución antes de marcar RESUELTO (guard en `cambiarEstado`).
- `GET /api/tickets/{id}` autorizado por rol: solo solicitante, técnico asignado o ADMIN (terceros → 403), vía `TicketServiceImpl.obtenerPorIdAutorizado`.
- Alta Disponibilidad (simulación) con `nginx.conf` + `docker-compose.yml` en la raíz del backend: 2 réplicas del backend (`eclipse-temurin:21-jdk` + jar montado) balanceadas por NGINX en `:8080`. Requiere `.\mvnw.cmd package -q` antes (genera `target/ServiceDesk-0.0.1-SNAPSHOT.jar`).
- Backend se arranca/detiene por el usuario en STS (modo recomendado); también arrancado en background con `Start-Process .\mvnw.cmd spring-boot:run` (logs en `C:\Users\user\AppData\Local\Temp\opencode\sd-backend5.log`). Para detener: matar listener del puerto 8080 o `Get-CimInstance Win32_Process` filtrando `java.exe` con `*ServiceDesk*`.
- `solucion` y `estado` se actualizan por separado: `PATCH /api/tickets/{id}/solucion` solo guarda texto; `PATCH /api/tickets/{id}/estado?estado=RESUELTO` cambia el estado.
- Calificar requiere estado RESUELTO (400 en otro caso), solo solicitante (403 para terceros), una sola vez (CONFLICT); nota se acota a 1-5.
- Verificación E2E final (13/08/2026): comentarios técnico+usuario en ticket #5, estado RESUELTO con solución, calificación 4 → CERRADO; tickets temporales con/sin adjunto creados y borrados; comentario de prueba "intruso" eliminado vía SQL directo (tabla `comentarios`); ticket #5 quedó CERRADO con calificación 4 (estado coherente, el detalle muestra `calificacion` siempre que exista).
- MySQL: `jdbc:mysql://localhost:3306/servicedesk_db`, root/mysql; cliente en `C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe`. Tablas: `comentarios`, `tickets`, `usuarios`.
- Credenciales: `admin@servicedesk.com` / `admin123`; técnicos `pass123` excepto los creados por admin con `Tecnico123!`.

## Next Steps
1. Ninguno pendiente de esta iteración. Próxima iteración posible: refrescar chat en vivo, notificaciones, o editar perfil de otros usuarios desde ADMIN.

## Relevant Files
- Backend (`C:\Users\user\Documents\Workspace\ServiceDesk`): `model/entity/Comentario.java`, `repository/ComentarioRepository.java`, `dto/ComentarioRequestDto.java`, `dto/CalificacionRequestDto.java`, `model/entity/Ticket.java` (+`adjuntoUrl`, +`calificacion`, +transients), `service/impl/TicketServiceImpl.java` (+comentarios, +calificar, +validarTransicion, +obtenerPorIdAutorizado), `controller/TicketController.java` (+3 endpoints, +auth en GET/{id}), `controller/AdminController.java` (POST/GET/DELETE usuarios), `controller/PerfilController.java` (PATCH), `service/UsuarioService.java` (actualizarPerfil, eliminarUsuario, buildAuthResponse), `model/entity/Usuario.java` (+especialidad/telefono/avatarUrl/activo), `dto/AuthResponseDto.java`, `dto/TecnicoDto.java`, `dto/UsuarioAdminDto.java`, `dto/PerfilRequestDto.java`, `dto/RegistrarTecnicoRequestDto.java`, `dto/SolucionRequestDto.java`, `nginx.conf`, `docker-compose.yml`.
- Frontend (`C:\Users\user\Documents\AllAngular\service-desk-frontend\service-desk-frontend`): `pages/ticket-detalle/ticket-detalle.component.{ts,html,css}`, `pages/tickets/tickets.component.{ts,html}`, `pages/tecnico-dashboard/tecnico-dashboard.component.{ts,html}`, `pages/perfil/perfil.component.{ts,html,css}` (+botón "← Volver al Dashboard" por rol), `pages/gestion-personal/gestion-personal.component.{ts,html,css}` (+eliminar con confirmación), `shared/avatares.ts`, `shared/avatar/avatar.component.{ts,html,css}`, `layout/main-layout/main-layout.component.{ts,html}`, `app.routes.ts`, `services/auth.service.ts` (+eliminarUsuario, actualizarPerfil), `services/ticket.service.ts`, `models/ticket.model.ts`, `models/comentario.model.ts`, `dtos/auth.dto.ts`, `dtos/perfil.dto.ts`, `dtos/usuario.dto.ts`.
