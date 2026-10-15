import React, { useEffect, useMemo, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import FrontCard from './FrontCard';
import BackCard from './BackCard';
import { CARD_PREVIEW_SCALE, CARD_THEME, defaultCardData } from './cardTheme';
import { fetchPrivateObjectUrl, getFileUrl, privateUploadKind } from '../../services/api';

const GAP_MM = 6;

/**
 * Renders front + back enrollment cards.
 * @param {'horizontal'|'vertical'} layout - horizontal = side-by-side (preview mockup)
 */
export default function CardWrapper({
  data,
  scale = CARD_PREVIEW_SCALE,
  showBothSides = true,
  layout = 'horizontal',
  className = '',
  generateQr = true,
  fitContent = false,
}) {
  const qrRef = useRef(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [privateProfileUrl, setPrivateProfileUrl] = useState(null);

  useEffect(() => {
    const source = data?.profileImageUrl;
    if (!source || String(source).startsWith('data:') || !privateUploadKind(source)) {
      setPrivateProfileUrl(null);
      return undefined;
    }
    let cancelled = false;
    let objectUrl = null;
    fetchPrivateObjectUrl(source)
      .then((url) => {
        if (cancelled) {
          if (url) window.URL.revokeObjectURL(url);
          return;
        }
        objectUrl = url;
        setPrivateProfileUrl(url);
      })
      .catch(() => {
        if (!cancelled) setPrivateProfileUrl(null);
      });
    return () => {
      cancelled = true;
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    };
  }, [data?.profileImageUrl]);

  const merged = useMemo(() => {
    const base = { ...defaultCardData, ...data };
    if (
      base.profileImageUrl
      && !String(base.profileImageUrl).startsWith('data:')
      && !String(base.profileImageUrl).startsWith('blob:')
      && !privateUploadKind(base.profileImageUrl)
    ) {
      base.profileImageUrl = getFileUrl(base.profileImageUrl);
    }
    // Logo lives in Vite public/ — only resolve API upload paths
    if (
      base.logoUrl &&
      !String(base.logoUrl).startsWith('data:') &&
      !String(base.logoUrl).startsWith('/bvonix-academy-logo') &&
      !String(base.logoUrl).startsWith('/logo.png') &&
      String(base.logoUrl).startsWith('/uploads')
    ) {
      base.logoUrl = getFileUrl(base.logoUrl);
    }
    return base;
  }, [data]);

  const verifyUrl =
    merged.verifyUrl ||
    (merged.studentId
      ? `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${merged.studentId}`
      : '');

  useEffect(() => {
    if (merged.qrDataUrl) {
      setQrDataUrl(merged.qrDataUrl);
      return;
    }
    if (!generateQr || !verifyUrl) return;
    const t = requestAnimationFrame(() => {
      const canvas = qrRef.current?.querySelector('canvas');
      if (canvas) {
        setQrDataUrl(canvas.toDataURL('image/png'));
      }
    });
    return () => cancelAnimationFrame(t);
  }, [merged.qrDataUrl, verifyUrl, generateQr]);

  const cardData = {
    ...merged,
    profileImageUrl: privateUploadKind(data?.profileImageUrl)
      ? privateProfileUrl
      : merged.profileImageUrl,
    qrDataUrl: merged.qrDataUrl || qrDataUrl,
    verifyUrl,
  };

  const { widthMm, heightMm } = CARD_THEME.dimensions;
  const isHorizontal = layout === 'horizontal' && showBothSides;

  const innerWidthMm = isHorizontal ? widthMm * 2 + GAP_MM : widthMm;
  const innerHeightMm = isHorizontal
    ? heightMm
    : showBothSides
      ? heightMm * 2 + GAP_MM
      : heightMm;

  const outerWidthMm = innerWidthMm * scale;
  const outerHeightMm = innerHeightMm * scale;

  return (
    <div className={`w-full flex justify-center ${className}`}>
      {generateQr && verifyUrl && !merged.qrDataUrl && (
        <div ref={qrRef} className="sr-only" aria-hidden>
          <QRCodeCanvas value={verifyUrl} size={128} level="M" bgColor="#ffffff" fgColor="#0A1628" />
        </div>
      )}

      {/* Spacer reserves layout space so scale() does not clip content */}
      <div
        className="card-preview-spacer flex-shrink-0"
        style={{
          width: fitContent ? 'max-content' : `${outerWidthMm}mm`,
          height: fitContent ? 'auto' : `${outerHeightMm}mm`,
          position: 'relative',
        }}
      >
        <div
          className={`card-preview-inner ${
            fitContent ? 'relative' : 'absolute top-0 left-0'
          } ${isHorizontal ? 'flex flex-row items-start' : 'flex flex-col items-center'}`}
          style={{
            gap: `${GAP_MM}mm`,
            width: fitContent ? 'max-content' : `${innerWidthMm}mm`,
            height: fitContent ? 'auto' : `${innerHeightMm}mm`,
            transform: fitContent ? 'none' : `scale(${scale})`,
            transformOrigin: 'top left',
            padding: fitContent ? '6mm' : undefined,
            background: fitContent ? '#f1f5f9' : undefined,
          }}
        >
          <div className="flex flex-col items-center flex-shrink-0">
            {isHorizontal && (
              <span className="text-xs font-semibold text-slate-500 mb-1 tracking-wide uppercase no-print-label">
                Front
              </span>
            )}
            <FrontCard data={cardData} />
          </div>
          {showBothSides && (
            <div className="flex flex-col items-center flex-shrink-0">
              {isHorizontal && (
                <span className="text-xs font-semibold text-slate-500 mb-1 tracking-wide uppercase no-print-label">
                  Back
                </span>
              )}
              <BackCard data={cardData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
