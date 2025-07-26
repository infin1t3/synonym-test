// API Constants
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://randomuser.me/api';

// Status Display Types
export const STATUS_DISPLAY_TYPES = {
  ERROR: 'error',
  OFFLINE: 'offline', 
  EMPTY: 'empty'
} as const;

export type StatusDisplayType = typeof STATUS_DISPLAY_TYPES[keyof typeof STATUS_DISPLAY_TYPES]; 