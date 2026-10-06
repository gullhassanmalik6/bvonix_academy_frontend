import React, { useState, useEffect } from 'react';
import { FiGrid, FiZap, FiSettings, FiFileText } from 'react-icons/fi';
import { siteSettingsService } from '../../services/siteSettingsService';

const DEFAULT_ICONS = [FiGrid, FiZap, FiSettings, FiFileText];

const CardIcon = ({ iconUrl, FallbackIcon }) => {
  const [imgError, setImgError] = useState(false);
  const fullUrl = iconUrl ? siteSettingsService.getHeroIconUrl(iconUrl) : null;
  if (fullUrl && !imgError) {
    return (
      <img
        src={fullUrl}
        alt=""
        className="w-8 h-8 object-contain filter brightness-0 invert"
        onError={() => setImgError(true)}
      />
    );
  }
  return <FallbackIcon className="w-8 h-8 text-white" />;
};

const BenefitsSection = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    siteSettingsService
      .getSiteSettings()
      .then((data) => setSettings(data))
      .catch(() => setSettings(siteSettingsService.BENEFITS_DEFAULTS));
  }, []);

  if (!settings) {
    return (
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 animate-pulse">
          <div className="h-8 w-48 mx-auto mb-4 bg-gray-200 rounded" />
          <div className="h-12 w-96 mx-auto mb-12 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const header = settings.benefits_header || 'WHY CHOOSE US';
  const title = settings.benefits_title || 'Benefits of online tutoring services with us';
  const items = settings.benefits_items || siteSettingsService.BENEFITS_DEFAULTS?.benefits_items || [];

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

        {/* Benefit cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => {
            const IconComponent = DEFAULT_ICONS[i % DEFAULT_ICONS.length];
            const bgColor = item.background_color || (i === 1 ? '#E53935' : '#3B82F6');

            return (
              <div
                key={i}
                className="rounded-3xl shadow-lg overflow-hidden flex flex-col"
                style={{ backgroundColor: bgColor }}
              >
                <div className="p-6 flex-1 flex flex-col">
                  {/* Icon - white/semi-transparent circle with white icon */}
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-4 shrink-0">
                    <CardIcon iconUrl={item.icon_url} FallbackIcon={IconComponent} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {item.title || 'Benefit'}
                  </h3>
                  <p className="text-white/90 text-sm leading-relaxed">
                    {item.description || ''}
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

export default BenefitsSection;
