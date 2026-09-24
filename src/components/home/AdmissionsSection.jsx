import React from 'react';
import { FiCheck, FiPhone } from 'react-icons/fi';
import EnrollButton from '../common/EnrollButton';

const LEARNING_POINTS = [
  '80% Practical • 20% Theory',
  'Hands-on Real Client Projects',
  'Internship During the Course',
  'Career Building & Earning Guidance',
];

const AdmissionsSection = () => {
  return (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-[#0A1628] to-[#1a2b4e] text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-primary-400 font-bold uppercase tracking-wider text-sm mb-3">
              Admissions Are Open
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
              Scholarship &amp; Fee Benefits
            </h2>
            <div className="space-y-4 mb-8">
              <div className="bg-white/10 rounded-xl px-5 py-4 border border-white/10">
                <p className="text-xl font-bold text-primary-300">50% Scholarship</p>
                <p className="text-white/80 text-sm mt-1">For students who pass the entry test</p>
              </div>
              <div className="bg-white/10 rounded-xl px-5 py-4 border border-white/10">
                <p className="text-lg font-semibold">Special Discount for First 100 Students</p>
                <p className="text-white/70 text-sm line-through mt-1">5,000 PKR / month</p>
                <p className="text-2xl font-bold text-primary-300 mt-1">Pay Only 3,000 PKR / month</p>
                <p className="text-white/60 text-xs mt-1">2,000 PKR OFF • Limited seats available</p>
              </div>
            </div>
            <div className="inline-block bg-primary-500 rounded-lg px-6 py-3 font-bold text-lg mb-6">
              Starting From 1st Jan 2026
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <EnrollButton to="/register" size="md" />
              <a href="tel:03081166897" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/30 hover:bg-white/10 transition-colors">
                <FiPhone />
                Contact Now
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-6">Our Learning Approach</h3>
            <ul className="space-y-4">
              {LEARNING_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-1 shrink-0 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                    <FiCheck className="w-4 h-4" />
                  </span>
                  <span className="text-white/90 text-lg">{point}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-white/70 italic border-l-4 border-primary-500 pl-4">
              From Learning to Earning — The Right Way.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdmissionsSection;
