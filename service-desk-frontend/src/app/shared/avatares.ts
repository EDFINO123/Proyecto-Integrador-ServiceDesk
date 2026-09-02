export interface AvatarPreset {
  token: string;
  nombre: string;
  src: string;
}

interface RobotOptions {
  bg1: string;
  bg2: string;
  accent: string;
  eye: string;
  shape: 'dual' | 'single' | 'visor' | 'diamond' | 'stars' | 'horns';
}

function svgDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function robot(opts: RobotOptions): string {
  const { bg1, bg2, accent, eye, shape } = opts;

  const ojos =
    shape === 'diamond'
      ? `<rect x="40" y="41" width="20" height="18" rx="2" fill="${eye}" transform="rotate(45 50 50)"/><circle cx="50" cy="50" r="3" fill="#fff" fill-opacity="0.8"/>`
      : shape === 'single'
        ? `<circle cx="50" cy="50" r="10" fill="${eye}"/><circle cx="50" cy="46.5" r="3.5" fill="#fff" fill-opacity="0.75"/>`
        : shape === 'visor'
          ? `<rect x="24" y="41" width="52" height="20" rx="10" fill="${eye}" fill-opacity="0.9"/><rect x="32" y="46" width="10" height="7" rx="3.5" fill="#fff" fill-opacity="0.6"/><rect x="58" y="46" width="10" height="7" rx="3.5" fill="#fff" fill-opacity="0.6"/>`
          : shape === 'stars'
            ? `<polygon points="50,39 52.8,46.2 60.5,46.4 54.6,51 56.8,58.2 50,53.6 43.2,58.2 45.4,51 39.5,46.4 47.2,46.2" fill="${eye}"/><circle cx="50" cy="49" r="2.2" fill="#fff" fill-opacity="0.8"/>`
            : shape === 'horns'
              ? `<circle cx="38" cy="48" r="6.5" fill="${eye}"/><circle cx="62" cy="48" r="6.5" fill="${eye}"/><circle cx="38" cy="46" r="2.4" fill="#fff" fill-opacity="0.85"/><circle cx="62" cy="46" r="2.4" fill="#fff" fill-opacity="0.85"/><path d="M29 24 L21 6 M71 24 L79 6" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>`
              : `<rect x="34" y="42" width="13" height="14" rx="3" fill="${eye}"/><rect x="53" y="42" width="13" height="14" rx="3" fill="${eye}"/><circle cx="38.5" cy="46.5" r="2.6" fill="#fff" fill-opacity="0.85"/><circle cx="57.5" cy="46.5" r="2.6" fill="#fff" fill-opacity="0.85"/>`;

  const antena =
    shape === 'horns'
      ? ''
      : `<line x1="50" y1="18" x2="50" y2="8" stroke="${accent}" stroke-width="3" stroke-linecap="round"/><circle cx="50" cy="7" r="3" fill="${eye}"/>`;

  const boca = `<rect x="41" y="66" width="18" height="5" rx="2.5" fill="${accent}" fill-opacity="0.9"/>`;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${bg1}"/>
      <stop offset="1" stop-color="${bg2}"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="100" height="100" rx="50" fill="url(#g)"/>
  <circle cx="50" cy="50" r="37" fill="#0b1220" fill-opacity="0.55" stroke="${accent}" stroke-width="3"/>
  ${antena}
  <g>${ojos}</g>
  ${boca}
</svg>`;
}

export const AVATARES_PRESET: AvatarPreset[] = [
  { token: 'sd-avatar:cyber-1', nombre: 'Neon Bot', src: svgDataUri(robot({ bg1: '#312e81', bg2: '#701a75', accent: '#22d3ee', eye: '#e879f9', shape: 'dual' })) },
  { token: 'sd-avatar:cyber-2', nombre: 'Circuit', src: svgDataUri(robot({ bg1: '#0f172a', bg2: '#1e3a8a', accent: '#38bdf8', eye: '#38bdf8', shape: 'visor' })) },
  { token: 'sd-avatar:cyber-3', nombre: 'Sentinel', src: svgDataUri(robot({ bg1: '#431407', bg2: '#7c2d12', accent: '#fb923c', eye: '#fde047', shape: 'single' })) },
  { token: 'sd-avatar:cyber-4', nombre: 'Raptor', src: svgDataUri(robot({ bg1: '#581c87', bg2: '#9d174d', accent: '#c084fc', eye: '#f472b6', shape: 'dual' })) },
  { token: 'sd-avatar:cyber-5', nombre: 'Ghost', src: svgDataUri(robot({ bg1: '#134e4a', bg2: '#164e63', accent: '#2dd4bf', eye: '#5eead4', shape: 'visor' })) },
  { token: 'sd-avatar:cyber-6', nombre: 'Hologram', src: svgDataUri(robot({ bg1: '#172554', bg2: '#312e81', accent: '#818cf8', eye: '#60a5fa', shape: 'diamond' })) },
  { token: 'sd-avatar:cyber-7', nombre: 'Golem', src: svgDataUri(robot({ bg1: '#292524', bg2: '#57534e', accent: '#e7e5e4', eye: '#f97316', shape: 'horns' })) },
  { token: 'sd-avatar:cyber-8', nombre: 'Pyramid', src: svgDataUri(robot({ bg1: '#78350f', bg2: '#92400e', accent: '#fbbf24', eye: '#fb923c', shape: 'single' })) },
  { token: 'sd-avatar:cyber-9', nombre: 'Orb', src: svgDataUri(robot({ bg1: '#450a0a', bg2: '#7f1d1d', accent: '#f87171', eye: '#ef4444', shape: 'single' })) },
  { token: 'sd-avatar:cyber-10', nombre: 'Nova', src: svgDataUri(robot({ bg1: '#1e1b4b', bg2: '#4c1d95', accent: '#facc15', eye: '#fde047', shape: 'stars' })) },
];

export function resolverAvatar(avatarUrl: string | null | undefined): string | null {
  if (!avatarUrl) {
    return null;
  }
  const preset = AVATARES_PRESET.find((p) => p.token === avatarUrl);
  if (preset) {
    return preset.src;
  }
  return avatarUrl;
}
