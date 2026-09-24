import React from 'react';
import { CARD_THEME } from './cardTheme';

const SIG_GRAD_ID = 'sigGradFront';

/** Original mockup: smooth convex purple wave, white script + labels. */
export default function CardSignatureBlock({ signatureName, className = '' }) {
  const name =
    signatureName || CARD_THEME.academy.authorizedSignatureName || 'Gul Hassan';

  return (
    <div
      className={`absolute bottom-0 overflow-hidden ${className}`}
      style={{
        left: '-2mm',
        width: 'calc(58% + 2mm)',
        height: '100%',
        minHeight: '15mm',
      }}
    >
      <svg
        className="absolute bottom-0 left-0 w-full h-full block"
        viewBox="0 0 180 95"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id={SIG_GRAD_ID} x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#4C1D95" />
            <stop offset="45%" stopColor="#6D28D9" />
            <stop offset="100%" stopColor="#9333EA" />
          </linearGradient>
        </defs>
        {/* Single smooth convex curve — matches original (not multi-peak wave) */}
        <path
          d="M0,95 L0,36 C14,10 52,6 92,22 C118,32 148,28 180,46 L180,95 Z"
          fill={`url(#${SIG_GRAD_ID})`}
        />
      </svg>

      <div
        className="absolute inset-0 z-[2] flex flex-col items-center text-white text-center"
        style={{
          justifyContent: 'flex-end',
          paddingBottom: '18%',
          paddingLeft: '8%',
          paddingRight: '14%',
        }}
      >
        <p
          className="text-white leading-none mb-[3px]"
          style={{
            fontFamily: "'Great Vibes', 'Segoe Script', cursive",
            fontSize: '14px',
            fontWeight: 400,
          }}
        >
          {name}
        </p>
        <div
          className="bg-white"
          style={{
            width: '68%',
            height: '1.5px',
            marginBottom: '3px',
          }}
        />
        <p
          className="text-white leading-tight"
          style={{ fontSize: '5.5px', fontWeight: 600, letterSpacing: '0.02em' }}
        >
          Authorized Signature
        </p>
        <p
          className="text-white leading-tight"
          style={{ fontSize: '4.5px', fontWeight: 500, opacity: 0.92, marginTop: '1px' }}
        >
          Director / Admin
        </p>
      </div>
    </div>
  );
}
