import React, { useState, useEffect } from 'react';
import {
  FiZap,
  FiLayers,
  FiCode,
  FiBook,
  FiUser,
  FiEye,
  FiGrid,
  FiTrendingUp,
  FiSettings,
} from 'react-icons/fi';
import { siteSettingsService } from '../../services/siteSettingsService';

const DEFAULT_ICONS = [
  FiZap,
  FiLayers,
  FiCode,
  FiBook,
  FiUser,
  FiEye,
  FiGrid,
  FiTrendingUp,
  FiSettings,
];

const SubjectCardIcon = ({ iconUrl, FallbackIcon, color }) => {
  const [imgError, setImgError] = useState(false);
  const fullUrl = iconUrl ? siteSettingsService.getHeroIconUrl(iconUrl) : null;
  if (fullUrl && !imgError) {
    return (
      <img
        src={fullUrl}
        alt=""
        className="w-8 h-8 object-contain"
        style={{ color }}
        onError={() => setImgError(true)}
      />
    );
  }
  return <FallbackIcon className="w-8 h-8" style={{ color }} />;
};

const SubjectsSection = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    siteSettingsService
      .getSiteSettings()
      .then((data) => setSettings(data))
      .catch(() => setSettings(siteSettingsService.SUBJECTS_DEFAULTS));
  }, []);

  if (!settings) {
    return (
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 animate-pulse">
          <div className="h-8 w-48 mx-auto mb-4 bg-gray-200 rounded" />
          <div className="h-12 w-96 mx-auto mb-12 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const header = settings.subjects_header || 'WHY CHOOSE US';
  const title = settings.subjects_title || 'Benefits of online tutoring services with us';
  const items = settings.subjects_items || siteSettingsService.SUBJECTS_DEFAULTS?.subjects_items || [];

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-primary-500 font-bold uppercase tracking-wider text-sm mb-4">
            {header}
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1F1F1F] leading-tight max-w-2xl mx-auto">
            {title}
          </h2>
        </div>

        {/* Subject cards - 3x3 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => {
            const IconComponent = DEFAULT_ICONS[i % DEFAULT_ICONS.length];
            const bgColor = item.background_color || '#E53935';

            return (
              <div
                key={i}
                className="relative flex items-center rounded-xl shadow-md min-h-[100px] overflow-visible"
                style={{ backgroundColor: bgColor }}
              >
                {/* White circle with icon - overlaps left edge */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center shrink-0 z-10 border border-gray-100">
                  <SubjectCardIcon
                    iconUrl={item.icon_url}
                    FallbackIcon={IconComponent}
                    color={bgColor}
                  />
                </div>
                {/* Text content - padded left to make room for icon */}
                <div className="pl-10 pr-6 py-5 flex-1">
                  <h3 className="text-base font-bold text-white mb-1">
                    {item.title || 'Subject'}
                  </h3>
                  <p className="text-white/90 text-sm leading-relaxed">
                    {item.subtitle || ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SubjectsSection;
