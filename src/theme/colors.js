/**
 * Design tokens for Bvonix Academy
 * Brand: 70% White, 25% Red, 5% Dark text
 * Use these for consistent styling across components.
 */
export const colors = {
  primary: {
    50: '#FFEBEE',   /* Soft red - background accents */
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#E53935',  /* Main red - branding, buttons, highlights */
    600: '#D32F2F',
    700: '#B71C1C',  /* Dark red */
    800: '#8B0000',
    900: '#5D0000',
  },
  white: '#FFFFFF',
  neutral: {
    50: '#F5F5F5',   /* Light gray - optional neutral */
    900: '#1F1F1F',  /* Text dark - headings, body */
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
  },
};

/** Badge/status variant classes */
export const badgeVariants = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
  primary: 'bg-[#FFEBEE] text-[#B71C1C]',
  neutral: 'bg-[#F5F5F5] text-[#1F1F1F]',
};
