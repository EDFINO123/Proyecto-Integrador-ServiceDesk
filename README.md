# 🚀 Sistema Web Service Desk con Alta Disponibilidad

**Escuela:** Tecnologías de la Información  
**Carrera:** Computación e Informática / Redes y Comunicaciones  
**Curso:** Proyecto Integrador  
**Ciclo / Módulo:** Sexto / Módulo 1  
**Año:** 2026  

---

## 👥 Integrantes del Equipo
* **Chagua Quispe, Florencio Jetli** — *Coordinador de Proyecto & Scrum Master*
* **Fabricio Edwar Sullca Sánchez** — *Líder Técnico & Arquitecto Full Stack*
* **Cabrera Marcani, Jhair Alexander** — *Desarrollador Frontend & UI/UX*
* **Zolorzano Huari, Lucio Miguel** — *Ingeniero QA & Especialista en Seguridad*

---

## 📂 Entrega Oficial de Documentos y Recursos (Drive)

Accede a la carpeta principal estructurada con toda la documentación, presentaciones y evidencias del proyecto:

📁 **[Enlace a la Carpeta Principal del Proyecto en Google Drive](https://drive.google.com/drive/folders/1XtGc5ZzSqpIKNCsG2RKjPMNUbtiqnKJg?usp=sharing)**

### Estructura de la Entrega:
* 📄 `📁 Documentacion/`: Informe Final del Proyecto Integrador (.docx / .pdf).
* 📊 `📁 Presentacion/`: Diapositivas de la exposición (.pptx).
* 🎥 `📁 Video_Exposicion/`: Grabación explicativa del sistema y la arquitectura.
* 🛠️ `📁 Recursos_Adicionales/`: Manual de usuario, guía de instalación y scripts.

---

## 💻 Arquitectura y Tecnologías

### Backend
* **Lenguaje & Framework:** Java 21 + Spring Boot 3
* **Seguridad:** Spring Security con Autenticación JWT (JSON Web Token)
* **Persistencia:** JPA / Hibernate + MySQL
* **Control de Acceso:** Rol-based Access Control (`ROLE_ADMIN`, `ROLE_TECNICO`, `ROLE_USUARIO`)

### Frontend
* **Framework:** Angular 21 (Signals + Standalone Components)
* **Estilos:** Tailwind CSS (Diseño Dark Glassmorphic)
* **Estado & Reactividad:** Signals y RxJS

### Infraestructura & Redes
* **Servidor & Load Balancer:** NGINX (Configuración para Alta Disponibilidad)
* **Despliegue:** Docker / Docker-Compose
* **Seguridad de Red:** Arquitectura segmentada mediante VLANs

---

## ⚡ Características Principales del Sistema
1. **Gestión Completa del Ciclo de Vida del Ticket:** Flujo de estados estricto (`ABIERTO` ➔ `EN_PROCESO` ➔ `RESUELTO` ➔ `CERRADO`).
2. **Chat de Comentarios en Tiempo Real:** Comunicación fluida entre el solicitante y el técnico asignado en cada ticket.
3. **Módulo de Calificación:** Evaluación del servicio de 1 a 5 estrellas otorgada por el usuario antes de cerrar la incidencia.
4. **Gestión de Personal & Perfil:** Panel exclusivo de administración para la alta/baja de técnicos y personalización de avatares estilo Cyber/Tech.
