import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Rol } from '../dtos/auth.dto';
import { AuthService } from '../services/auth.service';

const dashboardPorRol: Record<Rol, string> = {
  ROLE_ADMIN: '/dashboard',
  ROLE_TECNICO: '/tecnico/dashboard',
  ROLE_USUARIO: '/dashboard',
};

export function rolGuard(rolesPermitidos: Rol[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.estaAutenticado()) {
      return router.createUrlTree(['/login']);
    }

    const rol = authService.usuario()?.rol;
    if (rol && rolesPermitidos.includes(rol)) {
      return true;
    }

    return router.createUrlTree([rol ? dashboardPorRol[rol] : '/login']);
  };
}
