import React from 'react';

/** QR code with purple frame + integrated SCAN TO VERIFY bar (mockup style). */
export default function CardQrBlock({ qrDataUrl }) {
  return (
    <div
      className="overflow-hidden flex flex-col bg-white"
      style={{
        border: '1.5px solid #7B3FBB',
        borderRadius: '4px',
        width: '13.5mm',
      }}
    >
      <div className="flex justify-center p-[1px] bg-white">
        {qrDataUrl ? (
          <img src={qrDataUrl} alt="Verify" className="block" style={{ width: '11.5mm', height: '11.5mm' }} />
        ) : (
          <div
            className="bg-slate-50 flex items-center justify-center text-slate-400 font-medium"
            style={{ width: '11.5mm', height: '11.5mm', fontSize: '5px' }}
          >
            QR
          </div>
        )}
      </div>
      <div
        className="text-center text-white font-bold uppercase tracking-wider"
        style={{
          background: '#7B3FBB',
          fontSize: '4.5px',
          padding: '1px 2px',
          letterSpacing: '0.1em',
        }}
      >
        SCAN TO VERIFY
      </div>
    </div>
  );
}
