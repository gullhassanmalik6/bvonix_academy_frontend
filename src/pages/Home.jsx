import React from 'react';
import { useAuth } from '../context/AuthContext';
import EnrollButton from '../components/common/EnrollButton';
import { FiPhone } from 'react-icons/fi';
import HeroSection from '../components/home/HeroSection';
import AdmissionsSection from '../components/home/AdmissionsSection';
import CommunitySection from '../components/home/CommunitySection';
import MilestonesSection from '../components/home/MilestonesSection';
import BenefitsSection from '../components/home/BenefitsSection';
import SubjectsSection from '../components/home/SubjectsSection';
import TestimonialsSection from '../components/home/TestimonialsSection';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <HeroSection />
      <AdmissionsSection />
      <CommunitySection />
      <MilestonesSection />
      <BenefitsSection />
      <SubjectsSection />
      <TestimonialsSection />

      <section className="py-16 bg-[#0A1628] text-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-primary-400 font-bold uppercase tracking-wider text-sm mb-3">
            Admissions Are Open
          </p>
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Tech Career?</h2>
          <p className="text-white/80 mb-2 max-w-2xl mx-auto">
            Join Bvonix Academy — practical, industry-ready education with internship, job guidance, and earning opportunities.
          </p>
          <p className="text-primary-300 font-semibold mb-8">Starting From 1st Jan 2026</p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <EnrollButton
              to={isAuthenticated ? '/courses' : '/register'}
              text={isAuthenticated ? 'Browse Courses' : 'Enroll Now'}
              icon={isAuthenticated ? 'arrow' : 'zap'}
              size="md"
            />
            <a
              href="tel:03081166897"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-white/30 hover:bg-white/10 transition-colors"
            >
              <FiPhone />
              0308-1166897
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
