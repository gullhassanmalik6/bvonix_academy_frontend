import React, { useState } from 'react';
import { getFileUrl } from '../../services/api';
import { CARD_THEME } from './cardTheme';
import CardBrandText from './CardBrandText';

/** Served from Vite `public/` — do not pass through API getFileUrl */
export const CARD_LOGO_PATHS = ['/bvonix-academy-logo.png', '/logo.png'];

function resolveLogoSrc(logoUrl) {
  if (!logoUrl) return CARD_LOGO_PATHS[0];
  if (logoUrl.startsWith('http') || logoUrl.startsWith('data:') || logoUrl.startsWith('blob:')) {
    return logoUrl;
  }
  if (logoUrl.startsWith('/uploads')) {
    return getFileUrl(logoUrl);
  }
  if (logoUrl.startsWith('/')) {
    return logoUrl;
  }
  return CARD_LOGO_PATHS[0];
}

/**
 * Official Bvonix Academy logo (front: image, back: white text brand).
 */
export default function AcademyLogo({ variant = 'dark', className = '', academyName, logoUrl }) {
  const isLight = variant === 'light';

  if (isLight) {
    return (
      <CardBrandText
        variant="light"
        academyName={academyName}
        className={className}
      />
    );
  }

  const primary = resolveLogoSrc(logoUrl);
  const [src, setSrc] = useState(primary);
  const [useText, setUseText] = useState(false);

  const handleError = () => {
    const fallback = CARD_LOGO_PATHS.find((p) => p !== src) || '/logo.png';
    if (src !== fallback) {
      setSrc(fallback);
      return;
    }
    setUseText(true);
  };

  if (useText) {
    return <CardBrandText variant="dark" academyName={academyName} className={className} />;
  }

  return (
    <div className={`flex flex-col items-center justify-center w-full ${className}`}>
      <img
        src={src}
        alt=""
        role="presentation"
        crossOrigin="anonymous"
        onError={handleError}
        className="block mx-auto object-contain"
        style={{
          width: '100%',
          maxWidth: '46mm',
          height: 'auto',
          maxHeight: '10.5mm',
        }}
      />
      <span className="sr-only">{academyName || CARD_THEME.academy.name}</span>
    </div>
  );
}
