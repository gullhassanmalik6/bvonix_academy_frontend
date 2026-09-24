import React from 'react';
import { CARD_THEME } from './cardTheme';

/**
 * Text logo for cards — matches mockup (Bvonix + Academy with lines).
 * Light variant: white on navy back header.
 */
export default function CardBrandText({ variant = 'dark', academyName, className = '' }) {
  const name = academyName || CARD_THEME.academy.name;
  const parts = name.trim().split(/\s+/);
  const brandWord = parts[0] || 'Bvonix';
  const brandSuffix = parts.slice(1).join(' ') || 'Academy';
  const isLight = variant === 'light';

  const primaryColor = isLight ? '#FFFFFF' : '#0B0B22';
  const secondaryColor = isLight ? 'rgba(255,255,255,0.88)' : '#64748B';
  const lineColor = isLight ? 'rgba(255,255,255,0.35)' : '#CBD5E1';
  const diamondColor = isLight ? '#C4B5FD' : '#7C3AED';

  return (
    <div className={`flex flex-col items-center text-center w-full ${className}`}>
      <p
        className="font-extrabold tracking-tight leading-none"
        style={{ fontSize: isLight ? '9px' : '10px', color: primaryColor }}
      >
        {brandWord.split('').map((ch, i) =>
          ch.toLowerCase() === 'i' ? (
            <span key={i} className="relative inline-block">
              <span
                className="absolute left-1/2 -translate-x-1/2 rounded-[1px] rotate-45"
                style={{
                  width: '3px',
                  height: '3px',
                  background: diamondColor,
                  top: '-3px',
                }}
                aria-hidden
              />
              i
            </span>
          ) : (
            <span key={i}>{ch}</span>
          ),
        )}
      </p>
      <div
        className="flex items-center gap-1 mt-[2px] w-full max-w-[38mm] font-medium"
        style={{ fontSize: isLight ? '5px' : '5.5px', color: secondaryColor }}
      >
        <span className="flex-1 h-px" style={{ background: lineColor }} />
        <span>{brandSuffix}</span>
        <span className="flex-1 h-px" style={{ background: lineColor }} />
      </div>
    </div>
  );
}
