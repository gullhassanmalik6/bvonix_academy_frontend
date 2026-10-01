import React from 'react';
import {
  FiUser,
  FiHash,
  FiBook,
  FiLayers,
  FiCalendar,
  FiClock,
  FiGlobe,
  FiMail,
} from 'react-icons/fi';
import CardFrontHeader from './CardFrontHeader';
import CardFieldRow from './CardFieldRow';
import CardQrBlock from './CardQrBlock';
import CardSignatureBlock from './CardSignatureBlock';
import { CARD_THEME } from './cardTheme';

export default function FrontCard({ data, className = '' }) {
  const d = { ...CARD_THEME.academy, ...data };
  const signatureName = d.authorizedSignatureName || CARD_THEME.academy.authorizedSignatureName || 'Gul Hassan';

  const fields = [
    { icon: FiUser, label: 'Student Name', value: d.studentName },
    { icon: FiHash, label: 'Student ID', value: d.studentId, valueClass: 'text-[#7C3AED]' },
    { icon: FiBook, label: 'Course', value: d.course },
    { icon: FiLayers, label: 'Batch', value: d.batch },
    { icon: FiCalendar, label: 'Enrollment Date', value: d.enrollmentDate },
    { icon: FiClock, label: 'Valid Until', value: d.validUntil },
  ];

  return (
    <article
      className={`relative bg-white rounded-2xl shadow-xl border border-slate-200/80 flex flex-col flex-shrink-0 box-border ${className}`}
      style={{
        width: `${CARD_THEME.dimensions.widthMm}mm`,
        height: `${CARD_THEME.dimensions.heightMm}mm`,
        fontFamily: CARD_THEME.typography.fontFamily,
        overflow: 'hidden',
      }}
      data-card-side="front"
    >
      <CardFrontHeader academyName={d.academyName} logoUrl={d.logoUrl} />

      <div className="relative z-10 flex-1 min-h-0 flex flex-col px-[2mm] pt-[0.5mm] pb-0">
        {/* Middle: photo + all 6 fields (original layout) */}
        <div
          className="flex-shrink-0"
          style={{
            display: 'grid',
            gridTemplateColumns: '20mm minmax(0, 1fr)',
            columnGap: '2mm',
          }}
        >
          <div
            className="w-full overflow-hidden bg-slate-100 self-stretch"
            style={{
              minHeight: '32mm',
              borderRadius: '3px',
              border: '1.5px solid #7B3FBB',
            }}
          >
            {d.profileImageUrl ? (
              <img
                src={d.profileImageUrl}
                alt=""
                crossOrigin="anonymous"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full min-h-[32mm] flex items-center justify-center text-[7px] text-slate-400 font-medium">
                Photo
              </div>
            )}
          </div>

          <div className="min-w-0 flex flex-col justify-start">
            {fields.map((f, i) => (
              <CardFieldRow
                key={f.label}
                icon={f.icon}
                label={f.label}
                value={f.value || '—'}
                valueClassName={f.valueClass || ''}
                showDivider={i < fields.length - 1}
                compact
              />
            ))}
          </div>
        </div>

        {/* Bottom band: signature wave (left) + QR only (right) */}
        <div className="relative flex-1 min-h-[15mm] mt-[1mm]">
          <div
            className="absolute opacity-[0.12] rotate-[18deg] pointer-events-none"
            style={{
              right: '1mm',
              bottom: '2mm',
              width: '9mm',
              height: '5mm',
              background: 'linear-gradient(135deg, #A78BFA, #7C3AED)',
              borderRadius: '1px',
            }}
            aria-hidden
          />
          <div
            className="absolute opacity-[0.08] -rotate-[8deg] pointer-events-none"
            style={{
              right: '4mm',
              bottom: '6mm',
              width: '7mm',
              height: '4mm',
              background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
              borderRadius: '1px',
            }}
            aria-hidden
          />

          <CardSignatureBlock signatureName={signatureName} />

          <div className="absolute right-0 bottom-[1mm] z-10">
            <CardQrBlock qrDataUrl={d.qrDataUrl} />
          </div>
        </div>
      </div>

      <footer
        className="relative z-10 flex-shrink-0 flex items-center justify-between gap-1 px-2.5 py-[3px] text-white rounded-b-2xl"
        style={{ background: '#0B0B22', fontSize: '5px' }}
      >
        <span className="flex items-center gap-1 min-w-0 flex-1">
          <FiGlobe className="w-[7px] h-[7px] flex-shrink-0" />
          <span className="truncate font-medium">{d.website}</span>
        </span>
        <span className="w-px h-[8px] bg-white/40 flex-shrink-0" />
        <span className="flex items-center gap-1 min-w-0 flex-1 justify-end">
          <FiMail className="w-[7px] h-[7px] flex-shrink-0" />
          <span className="truncate font-medium text-right">{d.supportEmail}</span>
        </span>
      </footer>
    </article>
  );
}
