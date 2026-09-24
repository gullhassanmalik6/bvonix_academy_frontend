import React from 'react';
import AcademyLogo from './AcademyLogo';

/**
 * Front card top — matches brand mockup: centered logo image, purple pill banner.
 */
export default function CardFrontHeader({ academyName, logoUrl }) {
  return (
    <div className="relative z-10 flex-shrink-0 bg-white w-full">
      <header className="px-2.5 pt-2.5 pb-2">
        <AcademyLogo academyName={academyName} logoUrl={logoUrl} />
      </header>

      <div
        className="text-center"
        style={{
          marginLeft: '2mm',
          marginRight: 0,
          width: 'calc(100% - 2mm)',
          padding: '1.6mm 2mm',
          background: 'linear-gradient(90deg, #5B21B6 0%, #7B3FBB 42%, #9333EA 100%)',
          borderRadius: '1px 3.6mm 3.6mm 1px',
          boxShadow: 'inset 4px 0 8px -3px rgba(59, 20, 120, 0.55)',
        }}
      >
        <p
          className="font-bold text-white uppercase"
          style={{
            fontSize: '6px',
            letterSpacing: '0.22em',
            lineHeight: 1.25,
          }}
        >
          Student Enrollment Card
        </p>
      </div>
    </div>
  );
}
