import React, { useState, useEffect } from 'react';
import { siteSettingsService } from '../../services/siteSettingsService';

const JOURNEY = [
  { label: 'Learn', detail: 'Build the skill' },
  { label: 'Practice', detail: 'Real projects' },
  { label: 'Internship', detail: 'Apply it live' },
  { label: 'Career', detail: 'Start earning' },
];

function CareerJourney() {
  return (
    <div className="relative w-full max-w-md aspect-[4/5] max-h-[450px] overflow-hidden rounded-[2rem] bg-[#0A1628] shadow-[0_18px_40px_rgba(10,22,40,0.18)]" aria-hidden="true">
      <div className="absolute left-8 top-14 h-14 w-14 rounded-full border border-primary-500/40" />
      <div className="absolute right-6 bottom-10 h-14 w-14 rounded-full bg-primary-500/15" />
      <div className="absolute right-10 top-14 h-8 w-8 rotate-45 border border-white/20" />
      <div className="absolute left-1/2 top-10 bottom-10 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-primary-400 to-transparent" />
      <div className="relative z-10 flex h-full flex-col justify-center gap-4 px-8 py-10">
        {JOURNEY.map((step, index) => (
          <div
            key={step.label}
            className={`journey-float flex items-center gap-3 ${index % 2 === 0 ? 'self-start' : 'self-end'}`}
            style={{ animationDelay: `${index * 0.45}s` }}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white shadow-[0_8px_16px_rgba(229,57,53,0.35)]">
              {index + 1}
            </span>
            <span className="rounded-2xl border border-white/10 bg-white px-4 py-2.5 shadow-[0_10px_24px_rgba(10,22,40,0.16)]">
              <span className="block text-sm font-bold text-[#0A1628]">{step.label}</span>
              <span className="block text-xs text-[#1F1F1F]/70">{step.detail}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

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

  const stats = [
    { value: settings.community_stat1_value || '12 k', label: settings.community_stat1_label || 'Success Journey' },
    { value: settings.community_stat2_value || '98 +', label: settings.community_stat2_label || 'Best Mentor' },
    { value: settings.community_stat3_value || '21 +', label: settings.community_stat3_label || 'Years Experience' },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 w-full lg:max-w-[50%] flex justify-center lg:justify-start order-2 lg:order-1">
            <CareerJourney />
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
