import React, { useState, useEffect } from 'react';
import { siteSettingsService } from '../../services/siteSettingsService';

const CommunitySection = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    siteSettingsService.getSiteSettings()
      .then((data) => setSettings(data))
      .catch(() => setSettings(siteSettingsService.COMMUNITY_DEFAULTS));
  }, []);

  if (!settings) {
    return (
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 animate-pulse">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1 h-80 bg-gray-200 rounded-2xl" />
            <div className="flex-1 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-12 bg-gray-200 rounded w-full" />
              <div className="h-24 bg-gray-200 rounded w-full" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const imageUrl = settings.community_image_url
    ? siteSettingsService.getHeroIconUrl(settings.community_image_url)
    : 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&q=80';

  const stats = [
    { value: settings.community_stat1_value || '12 k', label: settings.community_stat1_label || 'Success Journey' },
    { value: settings.community_stat2_value || '98 +', label: settings.community_stat2_label || 'Best Mentor' },
    { value: settings.community_stat3_value || '21 +', label: settings.community_stat3_label || 'Years Experience' },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left - Image with blob/circular background (screenshot style) */}
          <div className="flex-1 w-full lg:max-w-[50%] flex justify-center lg:justify-start order-2 lg:order-1">
            <div className="relative w-full max-w-md">
              <div className="relative w-full aspect-[4/5] max-h-[450px]">
                <div className="absolute inset-0 bg-primary-500 rounded-[45%_55%_60%_40%/50%_45%_55%_50%] scale-110 -translate-x-4" />
                <div className="absolute inset-0 flex items-center justify-center pl-4">
                  <img
                    src={imageUrl}
                    alt={settings.community_image_alt || 'Community member with laptop'}
                    className="relative z-10 w-[85%] h-[90%] object-cover object-top rounded-2xl shadow-xl"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&q=80';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right - Text and stats */}
          <div className="flex-1 max-w-xl order-1 lg:order-2">
            {settings.community_header && (
              <p className="text-primary-500 font-bold uppercase tracking-wider text-sm mb-4">
                {settings.community_header}
              </p>
            )}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1F1F1F] leading-tight mb-6">
              {settings.community_title || 'Discussion Forum for Sharing, Learning, and Helping'}
            </h2>
            <p className="text-[#1F1F1F]/80 text-base sm:text-lg leading-relaxed mb-10">
              {settings.community_description || 'Dive into our dynamic Community Hub – a central space for rich discussions, shared experiences, and mutual support.'}
            </p>

            {/* Stat cards */}
            <div className="space-y-4">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-xl px-6 py-4 shadow-sm"
                >
                  <p className="text-primary-500 font-bold text-2xl sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="text-[#1F1F1F] font-medium mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
