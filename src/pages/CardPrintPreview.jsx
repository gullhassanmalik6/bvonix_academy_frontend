import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CardWrapper from '../components/cards/CardWrapper';
import Button from '../components/common/Button';
import { cardService } from '../services/cardService';
import { getApiErrorMessage } from '../services/api';
import { CARD_PREVIEW_SCALE, defaultCardData } from '../components/cards/cardTheme';
import { useToast } from '../context/ToastContext';

export default function CardPrintPreview() {
  const { enrollmentId } = useParams();
  const { showToast } = useToast();
  const [cardData, setCardData] = useState(defaultCardData);
  const [loading, setLoading] = useState(Boolean(enrollmentId));
  const [downloading, setDownloading] = useState(false);
  const [scale, setScale] = useState(CARD_PREVIEW_SCALE);

  useEffect(() => {
    const updateScale = () => {
      const cardW = 53.98;
      const cardH = 85.6;
      const gap = 6;
      const totalW = cardW * 2 + gap;
      const mmToPx = 3.7795275591;
      const available = window.innerWidth - 48;
      const fitScale = available / (totalW * mmToPx);
      setScale(Math.min(CARD_PREVIEW_SCALE, Math.max(1.4, fitScale)));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  useEffect(() => {
    if (!enrollmentId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await cardService.getPreviewData(enrollmentId);
        if (!cancelled) {
          setCardData({
            academyName: data.academyName,
            studentName: data.studentName,
            studentId: data.studentId,
            fatherName: data.fatherName,
            course: data.course,
            batch: data.batch,
            enrollmentDate: data.enrollmentDate,
            validUntil: data.validUntil,
            dateOfBirth: data.dateOfBirth,
            gender: data.gender,
            phone: data.phone,
            email: data.email,
            campus: data.campus,
            address: data.address,
            profileImageUrl: data.profileImageUrl,
            verifyUrl: data.verifyUrl,
            website: data.website,
            supportEmail: data.supportEmail,
            supportPhone: data.supportPhone,
            authorizedSignatureName: data.authorizedSignatureName,
          });
        }
      } catch (err) {
        if (!cancelled) {
          showToast(await getApiErrorMessage(err, 'Failed to load card preview'), 'error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enrollmentId, showToast]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownloadPdf = useCallback(async () => {
    if (!enrollmentId) {
      showToast('Enrollment ID required for PDF download', 'error');
      return;
    }
    try {
      setDownloading(true);
      const blob = await cardService.downloadEnrollmentCard(enrollmentId);
      cardService.downloadBlob(blob, `enrollment_card_${cardData.studentId || enrollmentId}.pdf`);
      showToast('Card PDF downloaded', 'success');
    } catch (err) {
      showToast(await getApiErrorMessage(err, 'PDF download failed'), 'error');
    } finally {
      setDownloading(false);
    }
  }, [enrollmentId, cardData.studentId, showToast]);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="no-print sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[100vw] mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Enrollment Card Preview</h1>
            <p className="text-sm text-slate-500">Front &amp; back — side by side (matches print layout)</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={enrollmentId ? '/lms' : '/'}>
              <Button variant="secondary">Back</Button>
            </Link>
            <Button variant="secondary" onClick={handlePrint}>
              Print Preview
            </Button>
            {enrollmentId && (
              <Button onClick={handleDownloadPdf} disabled={downloading || loading}>
                {downloading ? 'Generating…' : 'Download PDF'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <main className="print-area w-full overflow-x-auto px-4 py-10 flex justify-center">
        {loading ? (
          <p className="text-slate-500">Loading card…</p>
        ) : (
          <CardWrapper data={cardData} scale={scale} layout="horizontal" showBothSides />
        )}
      </main>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          .print-area {
            padding: 8mm !important;
            overflow: visible !important;
          }
          .card-preview-spacer {
            width: auto !important;
            height: auto !important;
          }
          .card-preview-inner {
            position: static !important;
            transform: none !important;
            flex-direction: row !important;
            gap: 6mm !important;
          }
        }
      `}</style>
    </div>
  );
}
