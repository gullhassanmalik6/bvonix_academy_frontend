/**
 * Shared enrollment card theme — keep in sync with backend card_theme.json
 */
export const CARD_THEME = {
  dimensions: {
    widthMm: 53.98,
    heightMm: 85.6,
    dpi: 300,
    orientation: 'portrait',
  },
  colors: {
    navy: '#0A1628',
    navyLight: '#132337',
    purple: '#7C3AED',
    purpleMid: '#8B5CF6',
    purpleLight: '#A78BFA',
    gradientPurple: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 45%, #7C3AED 100%)',
    gradientNavy: 'linear-gradient(180deg, #0F2744 0%, #0A1628 100%)',
    gradientFooter: 'linear-gradient(90deg, #6366F1 0%, #7C3AED 50%, #6D28D9 100%)',
    white: '#FFFFFF',
    textDark: '#0F172A',
    textMuted: '#64748B',
    border: '#E2E8F0',
    watermark: 'rgba(124, 58, 237, 0.06)',
  },
  typography: {
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    logoTitle: 'font-bold tracking-tight',
    bannerTitle: 'text-[7px] font-bold tracking-[0.12em] uppercase',
    fieldLabel: 'text-[5.5px] font-medium uppercase tracking-wide text-slate-500',
    fieldValue: 'text-[7px] font-bold text-slate-900 leading-tight',
    rulesTitle: 'text-[6.5px] font-bold uppercase tracking-wide text-violet-600',
    rulesBody: 'text-[5.5px] text-slate-700 leading-snug',
    footer: 'text-[5px] text-white',
  },
  academy: {
    name: 'Bvonix Academy',
    website: 'www.bvonixacademy.com',
    email: 'info@bvonixacademy.com',
    phone: '+92 300 1234567',
    authorizedSignatureName: 'Gul Hassan',
  },
  rules: [
    'This card must be carried during classes.',
    'Card is non-transferable.',
    'Lost cards must be reported immediately.',
    'Fees must be paid on time.',
    'Misconduct may result in suspension.',
  ],
  social: [
    { id: 'facebook', label: 'Facebook' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'youtube', label: 'YouTube' },
  ],
};

/** Preview scale for screen (CR80 is small at 1:1) */
export const CARD_PREVIEW_SCALE = 3.2;

export const defaultCardData = {
  academyName: CARD_THEME.academy.name,
  studentName: 'MUHAMMAD ALI',
  studentId: 'ENR-0000000000000000',
  fatherName: '—',
  course: 'Web Development',
  batch: 'Batch – January 2026',
  enrollmentDate: '01 January 2026',
  validUntil: 'Until Course Completion',
  dateOfBirth: '—',
  gender: '—',
  phone: '—',
  email: 'student@example.com',
  campus: 'Main Campus',
  address: '—',
  profileImageUrl: null,
  logoUrl: '/bvonix-academy-logo.png',
  qrDataUrl: null,
  verifyUrl: '',
  website: CARD_THEME.academy.website,
  supportEmail: CARD_THEME.academy.email,
  supportPhone: CARD_THEME.academy.phone,
  authorizedSignatureName: CARD_THEME.academy.authorizedSignatureName,
};
