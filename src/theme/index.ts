/**
 * Design tokens do El Niño.
 * Centralizados para que todas as telas compartilhem a mesma identidade visual.
 */
export const colors = {
  bg: '#0f172a',
  surface: '#1e293b',
  surfaceAlt: '#273449',
  border: '#334155',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  primary: '#22c55e',
  primaryText: '#052e16',
  accent: '#38bdf8',
  danger: '#f87171',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const font = {
  title: 28,
  subtitle: 18,
  body: 15,
  small: 13,
} as const;
