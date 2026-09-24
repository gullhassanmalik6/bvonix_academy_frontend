import React from 'react';
import { useSiteLogo } from '../../hooks/useSiteLogo';

/**
 * Renders site logo as image or text based on admin settings.
 * @param {'light' | 'dark'} variant - light = header/dashboard (dark text), dark = footer (white text)
 */
const SiteLogo = ({ variant = 'light', className = '' }) => {
  const { logoType, logoText, logoUrl, displayHeight, brandName } = useSiteLogo();
  const isDark = variant === 'dark';

  if (logoType === 'text') {
    const lines = (logoText || brandName || 'Bvonix Academy').split('\n').map((l) => l.trim()).filter(Boolean);
    const primary = lines[0] || 'Bvonix Academy';
    const secondary = lines[1] || '';

    if (secondary) {
      return (
        <div className={`leading-tight ${className}`}>
          <span className={`block font-bold text-xl sm:text-2xl tracking-tight ${isDark ? 'text-white' : 'text-[#0A1628]'}`}>
            {primary}
          </span>
          <span className={`block text-sm font-medium tracking-wide ${isDark ? 'text-white/75' : 'text-gray-600'}`}>
            {secondary}
          </span>
        </div>
      );
    }

    return (
      <span className={`font-bold text-xl sm:text-2xl tracking-tight ${isDark ? 'text-white' : 'text-[#0A1628]'} ${className}`}>
        {primary}
      </span>
    );
  }

  const height = variant === 'dark' ? Math.min(displayHeight, 48) : displayHeight;

  return (
    <img
      src={logoUrl}
      alt={brandName}
      style={{ height: variant === 'dark' ? height : Math.min(displayHeight, 40) }}
      className={`w-auto object-contain ${isDark ? 'brightness-0 invert' : ''} ${className}`}
    />
  );
};

export default SiteLogo;
