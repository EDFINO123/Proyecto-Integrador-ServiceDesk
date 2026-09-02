import { Component, computed, input } from '@angular/core';

import { resolverAvatar } from '../avatares';

export type TamanoAvatar = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarUsuario {
  nombre?: string;
  avatarUrl?: string | null;
}

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.css',
})
export class AvatarComponent {
  readonly usuario = input<AvatarUsuario | null | undefined>(null);
  readonly tamano = input<TamanoAvatar>('md');
  readonly borde = input<boolean>(true);

  readonly src = computed(() => resolverAvatar(this.usuario()?.avatarUrl));

  readonly inicial = computed(() => {
    const nombre = this.usuario()?.nombre?.trim();
    return nombre ? nombre.charAt(0).toUpperCase() : '?';
  });

  readonly clases = computed(() => {
    const base = 'inline-flex shrink-0 select-none items-center justify-center font-bold';
    const tam = {
      xs: 'h-6 w-6 text-[9px]',
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-14 w-14 text-lg',
      xl: 'h-24 w-24 text-3xl',
    }[this.tamano()];
    const estilo =
      'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/20';
    return `${base} ${tam} ${estilo}`;
  });

  readonly imagenClases = computed(() => {
    const tam = {
      xs: 'h-6 w-6',
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-14 w-14',
      xl: 'h-24 w-24',
    }[this.tamano()];
    return `${tam} ${this.borde() ? 'border-2 border-slate-700/60' : ''}`;
  });
}
