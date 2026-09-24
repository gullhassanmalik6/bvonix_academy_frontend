import React, { useState, useEffect } from 'react';
import { siteSettingsService } from '../../services/siteSettingsService';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';

const TestimonialsSection = () => {
  const [settings, setSettings] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    siteSettingsService
      .getSiteSettings()
      .then((data) => setSettings(data))
      .catch(() => setSettings(siteSettingsService.TESTIMONIALS_DEFAULTS));
  }, []);

  if (!settings) {
    return (
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 animate-pulse">
          <div className="h-8 w-48 mx-auto mb-4 bg-gray-200 rounded" />
          <div className="h-12 w-96 mx-auto mb-12 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded-xl max-w-2xl mx-auto" />
        </div>
      </section>
    );
  }

  const header = settings.testimonials_header || 'OUR TESTIMONIALS';
  const title = settings.testimonials_title || 'What Our Student Say About US';
  const items = settings.testimonials_items || siteSettingsService.TESTIMONIALS_DEFAULTS?.testimonials_items || [];
  const active = items[activeIndex] || items[0];

  const getAvatarUrl = (url) => {
    if (!url) return DEFAULT_AVATAR;
    return siteSettingsService.getHeroIconUrl(url);
  };

  if (!items.length) {
    return null;
  }

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

        {/* Main testimonial with surrounding avatars */}
        <div className="relative max-w-3xl mx-auto">
          {/* Large quotation marks - left */}
          <div className="absolute left-0 top-0 -translate-x-4 lg:-translate-x-8 text-gray-200 select-none pointer-events-none" style={{ fontSize: 'clamp(80px, 15vw, 180px)', lineHeight: 1, fontFamily: 'Georgia, serif' }}>
            &ldquo;
          </div>

          {/* Central content */}
          <div className="relative z-10 flex flex-col items-center text-center px-6 lg:px-12 pt-8">
            {/* Central avatar */}
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg mb-6 shrink-0">
              <img
                src={getAvatarUrl(active?.author_avatar_url)}
                alt={active?.author_name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
              />
            </div>
            {/* Testimonial text */}
            <p className="text-[#1F1F1F] text-base sm:text-lg leading-relaxed mb-6 max-w-2xl">
              {active?.testimonial_text || ''}
            </p>
            {/* Author details */}
            <p className="font-bold text-[#1F1F1F] text-lg">{active?.author_name || ''}</p>
            <p className="text-[#1F1F1F]/80 text-sm">{active?.author_title || ''}</p>
          </div>

          {/* Surrounding smaller avatars - semicircle/oval */}
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            {items.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 transition-all shrink-0 ${
                  i === activeIndex ? 'border-primary-500 ring-2 ring-primary-200 scale-110' : 'border-gray-200 hover:border-primary-300'
                }`}
                aria-label={`View testimonial from ${item.author_name}`}
              >
                <img
                  src={getAvatarUrl(item.author_avatar_url)}
                  alt={item.author_name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
