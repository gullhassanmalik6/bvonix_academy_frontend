import React, { useRef } from 'react';
import { FiCheck, FiPhone } from 'react-icons/fi';
import EnrollButton from '../common/EnrollButton';

const LEARNING_POINTS = [
  '80% Practical • 20% Theory',
  'Hands-on Real Client Projects',
  'Internship During the Course',
  'Career Building & Earning Guidance',
];

function DepthCard({ children }) {
  const ref = useRef(null);

  const onMove = (event) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.transition = 'transform 0.12s ease-out, box-shadow 0.12s ease-out';
    el.style.transform = `translateY(-14px) rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 10).toFixed(2)}deg) scale(1.04)`;
    el.style.boxShadow = '0 28px 40px rgba(0, 0, 0, 0.35)';
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = 'transform 0.45s ease, box-shadow 0.45s ease';
    el.style.transform = '';
    el.style.boxShadow = '';
  };

  return (
    <div className="depth-scene">
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="depth-slab"
      >
        <span className="depth-slab-side" aria-hidden="true" />
        <div className="depth-slab-face">
          <span className="depth-slab-highlight" aria-hidden="true" />
          {children}
        </div>
      </div>
    </div>
  );
}

const AdmissionsSection = () => {
  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0A1628] to-[#1a2b4e] px-6 py-12 text-white shadow-[0_18px_40px_rgba(10,22,40,0.22),inset_0_1px_0_rgba(255,255,255,0.12)] sm:px-10 lg:px-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-primary-400 font-bold uppercase tracking-wider text-sm mb-3">
              Admissions Are Open
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
              Scholarship &amp; Fee Benefits
            </h2>
            <div className="space-y-6 mb-8">
              <DepthCard>
                <p className="text-xl font-bold text-primary-300">50% Scholarship</p>
                <p className="text-white/80 text-sm mt-1">For students who pass the entry test</p>
              </DepthCard>
              <DepthCard>
                <p className="text-lg font-semibold">Special Discount for First 100 Students</p>
                <p className="text-white/70 text-sm line-through mt-1">5,000 PKR / month</p>
                <p className="text-2xl font-bold text-primary-300 mt-1">Pay Only 3,000 PKR / month</p>
                <p className="text-white/60 text-xs mt-1">2,000 PKR OFF • Limited seats available</p>
              </DepthCard>
            </div>
            <div className="inline-block bg-primary-500 rounded-lg px-6 py-3 font-bold text-lg mb-6">
              Starting From 1st Jan 2026
            </div>
            <div className="benefit-controls flex flex-wrap items-center gap-4">
              <EnrollButton to="/register" size="md" className="benefit-control" />
              <a href="tel:03081166897" className="benefit-control inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/30 bg-white/5 hover:bg-white/10">
                <FiPhone />
                Contact Now
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-6">Our Learning Approach</h3>
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6 shadow-[0_16px_36px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.12)]">
              <div className="flex items-center gap-5 mb-6">
                <div
                  className="relative h-28 w-28 shrink-0 rounded-full shadow-[0_10px_24px_rgba(0,0,0,0.25)]"
                  style={{ background: 'conic-gradient(#E53935 0 80%, rgba(255,255,255,0.2) 80% 100%)' }}
                  aria-hidden="true"
                >
                  <div className="absolute inset-[10px] flex flex-col items-center justify-center rounded-full bg-[#0A1628]">
                    <span className="text-xl font-bold text-primary-300">80%</span>
                    <span className="text-[10px] uppercase tracking-wide text-white/70">Practical</span>
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">20%</p>
                  <p className="text-sm text-white/70">Theory</p>
                </div>
              </div>
              <ul className="space-y-3">
                {LEARNING_POINTS.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-[0_8px_18px_rgba(0,0,0,0.16)]"
                  >
                    <span className="mt-0.5 shrink-0 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                      <FiCheck className="w-4 h-4" />
                    </span>
                    <span className="text-white/90">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-8 text-white/70 italic border-l-4 border-primary-500 pl-4">
              From Learning to Earning — The Right Way.
            </p>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
};

export default AdmissionsSection;
