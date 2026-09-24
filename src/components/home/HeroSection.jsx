import React, { useState, useEffect } from 'react';
import { siteSettingsService } from '../../services/siteSettingsService';
import EnrollButton from '../common/EnrollButton';

const HeroSection = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    siteSettingsService.getSiteSettings()
      .then((data) => setSettings(data))
      .catch(() => setSettings(siteSettingsService.HERO_DEFAULTS));
  }, []);

  if (!settings) {
    return (
      <section className="bg-white py-16 lg:py-24 overflow-hidden">
        <div className="container mx-auto px-4 animate-pulse">
          <div className="h-16 bg-gray-200 rounded mb-6 max-w-xl" />
          <div className="h-6 bg-gray-200 rounded mb-8 max-w-2xl" />
        </div>
      </section>
    );
  }

  const headline = (settings.hero_headline || '').split('\n').filter(Boolean);
  const ctaLink = settings.hero_cta_link || '/register';
  const isExternal = ctaLink.startsWith('http');
  const ctaText = settings.hero_cta_text || 'Enroll Now';

  return (
    <section className="bg-white py-16 lg:py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 max-w-xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1F1F1F] leading-tight mb-6">
              {headline.length > 0
                ? headline.map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < headline.length - 1 && <br />}
                    </React.Fragment>
                  ))
                : 'Find Your Perfect Tutor Today'}
            </h1>
            <p className="text-[#1F1F1F]/80 text-base sm:text-lg mb-8 leading-relaxed">
              {settings.hero_description || 'We help you find the perfect tutor for 1-on-1 lessons. It is completely free and private.'}
            </p>

            <EnrollButton
              text={ctaText}
              {...(isExternal ? { href: ctaLink, external: true } : { to: ctaLink })}
              size="lg"
            />

            {settings.hero_cta_subtext && (
              <p className="text-sm text-[#1F1F1F]/55 mt-4 font-medium">
                {settings.hero_cta_subtext}
              </p>
            )}

            <div className="flex items-center gap-3 mt-10">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200 shrink-0"
                  >
                    <img
                      src={`https://i.pravatar.cc/80?img=${50 + i}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              {settings.hero_social_text && (
                <p className="text-sm text-[#1F1F1F]/80">
                  {settings.hero_social_text}
                </p>
              )}
            </div>
          </div>

          <div className="flex-1 flex justify-center lg:justify-end">
            <img
              src={
                settings.hero_icon_url
                  ? siteSettingsService.getHeroIconUrl(settings.hero_icon_url)
                  : '/hero_section_icon.png'
              }
              alt={settings.hero_image_alt || 'Students learning at Bvonix Academy'}
              className="max-w-full w-[320px] sm:w-[400px] lg:w-[480px] h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
