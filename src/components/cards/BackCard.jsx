import React from 'react';
import {
  FiUsers,
  FiCalendar,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiHome,
} from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import AcademyLogo from './AcademyLogo';
import CardFieldRow from './CardFieldRow';
import { CARD_THEME } from './cardTheme';

const SOCIAL_ICONS = {
  facebook: FaFacebookF,
  instagram: FaInstagram,
  linkedin: FaLinkedinIn,
  youtube: FaYoutube,
};

export default function BackCard({ data, className = '' }) {
  const d = { ...CARD_THEME.academy, ...data };
  const rules = d.rules || CARD_THEME.rules;

  const leftFields = [
    { icon: FiUsers, label: 'Father / Guardian Name', value: d.fatherName },
    { icon: FiCalendar, label: 'Date of Birth', value: d.dateOfBirth },
    { icon: FiUser, label: 'Gender', value: d.gender },
    { icon: FiPhone, label: 'Phone', value: d.phone },
    { icon: FiMail, label: 'Email', value: d.email },
    { icon: FiMapPin, label: 'Campus', value: d.campus },
    { icon: FiHome, label: 'Address', value: d.address },
  ];

  return (
    <article
      className={`relative bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col flex-shrink-0 box-border ${className}`}
      style={{
        width: `${CARD_THEME.dimensions.widthMm}mm`,
        height: `${CARD_THEME.dimensions.heightMm}mm`,
        fontFamily: CARD_THEME.typography.fontFamily,
        overflow: 'hidden',
      }}
      data-card-side="back"
    >
      <header className="relative flex-shrink-0 pt-1.5 pb-3 px-1" style={{ background: '#0B0B22' }}>
        <AcademyLogo variant="light" academyName={d.academyName} logoUrl={d.logoUrl} />
        <svg className="absolute bottom-0 left-0 w-full h-2.5" viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden>
          <path d="M0,0 L0,6 Q50,14 100,8 T200,5 L200,14 L0,14 Z" fill="white" />
          <path d="M0,6 Q50,14 100,8 T200,5" fill="none" stroke="#8B5CF6" strokeWidth="0.5" />
        </svg>
      </header>

      <div
        className="flex-1 min-h-0 px-1.5 py-1"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 0.2mm minmax(0, 1fr)',
          columnGap: '1mm',
        }}
      >
        <div className="min-w-0 overflow-hidden">
          {leftFields.map((f, i) => (
            <CardFieldRow
              key={f.label}
              icon={f.icon}
              label={f.label}
              value={f.value || '—'}
              showDivider={i < leftFields.length - 1}
              compact
            />
          ))}
        </div>
        <div className="bg-slate-200 w-full min-h-full" />
        <div className="min-w-0 overflow-hidden relative">
          <span
            className="absolute right-0 top-2 font-black leading-none text-violet-600/10 pointer-events-none select-none"
            style={{ fontSize: '14mm' }}
            aria-hidden
          >
            B
          </span>
          <h3 className="text-[6px] font-extrabold uppercase tracking-wide text-violet-600 relative z-10">
            Academy Rules
          </h3>
          <div className="h-0.5 w-7 bg-violet-600 rounded mt-0.5 mb-0.5 relative z-10" />
          <ul className="space-y-0.5 relative z-10">
            {rules.map((rule) => (
              <li key={rule} className="flex gap-0.5 text-[5px] text-slate-700 leading-snug font-medium">
                <span className="w-0.8 h-0.8 rounded-full bg-violet-600 mt-0.5 flex-shrink-0" style={{ minWidth: '2px', minHeight: '2px' }} />
                <span className="break-words">{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex-shrink-0">
        <svg className="w-full h-1.5 block" viewBox="0 0 200 10" preserveAspectRatio="none" aria-hidden>
          <path d="M0,10 Q60,0 120,5 T200,8 L200,0 L0,0 Z" fill="url(#backFootGrad)" />
          <defs>
            <linearGradient id="backFootGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4C1D95" />
              <stop offset="50%" stopColor="#6D28D9" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
        </svg>
        <footer
          className="flex items-center justify-between gap-0.5 px-1.5 py-1 text-white"
          style={{ background: CARD_THEME.colors.gradientFooter, fontSize: '4.5px' }}
        >
          <div className="flex items-center gap-0.5 min-w-0 flex-shrink">
            <span className="w-3 h-3 rounded-full bg-white flex items-center justify-center flex-shrink-0">
              <FiPhone className="w-1.5 h-1.5 text-violet-700" />
            </span>
            <span className="leading-tight break-words">
              <strong>Need Help?</strong>
              <br />
              {d.supportPhone}
            </span>
          </div>
          <span className="w-px h-3 bg-white/30 flex-shrink-0" />
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <span className="whitespace-nowrap">Follow Us</span>
            {(d.social || CARD_THEME.social).map((s) => {
              const Icon = SOCIAL_ICONS[s.id];
              if (!Icon) return null;
              return (
                <span key={s.id} className="w-2.5 h-2.5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-1.5 h-1.5" />
                </span>
              );
            })}
          </div>
        </footer>
      </div>
    </article>
  );
}
