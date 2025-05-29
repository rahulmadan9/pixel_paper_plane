/**
 * Design tokens for Pixel Paper Plane
 * Centralized color, spacing, and typography definitions
 */

export const colors = {
  skyTop: '#92E2FF',
  skyBottom: '#EAF9FF',
  primary: '#377DFF',
  accent: '#FFD447',
  uiBg: '#111A',  // 70% opacity
  white: '#FFFFFF',
  black: '#000000'
} as const

export const typography = {
  primary: '"Press Start 2P", monospace',
  fallback: 'monospace'
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
} as const

export const radius = {
  default: 12
} as const

export type Colors = typeof colors
export type Typography = typeof typography
export type Spacing = typeof spacing
export type Radius = typeof radius 