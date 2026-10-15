import { createRoot } from 'react-dom/client';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import CardWrapper from '../components/cards/CardWrapper';
import cardService from '../services/cardService';
import { fetchPrivateObjectUrl, getFileUrl, privateUploadKind } from '../services/api';

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function inlineCrossOriginImage(url) {
  if (!url || String(url).startsWith('data:') || String(url).startsWith('blob:')) {
    return url;
  }
  if (privateUploadKind(url)) {
    try {
      const objectUrl = await fetchPrivateObjectUrl(url);
      if (!objectUrl) return url;
      const response = await fetch(objectUrl);
      const dataUrl = await blobToDataUrl(await response.blob());
      window.URL.revokeObjectURL(objectUrl);
      return dataUrl;
    } catch {
      return url;
    }
  }
  const absolute = String(url).startsWith('http') ? url : getFileUrl(url);
  if (!absolute || absolute.startsWith(window.location.origin)) {
    return url;
  }
  try {
    const response = await fetch(absolute, { mode: 'cors', credentials: 'omit' });
    if (!response.ok) return url;
    return blobToDataUrl(await response.blob());
  } catch {
    return url;
  }
}

export function mapPreviewToCardData(data) {
  return {
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
  };
}

async function waitForCard(host) {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
  const deadline = Date.now() + 3000;
  while (Date.now() < deadline) {
    const images = [...host.querySelectorAll('.card-preview-inner img')];
    const ready = images.every((img) => img.complete && (img.naturalWidth > 0 || img.src.startsWith('data:')));
    const qr = host.querySelector('img[alt="Verify"]');
    if (qr?.src && ready) return;
    await sleep(50);
  }
}

async function renderCardNode(cardData) {
  const profileImageUrl = await inlineCrossOriginImage(cardData.profileImageUrl);
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = 'position:fixed;left:-10000px;top:0;pointer-events:none;background:#f1f5f9;';
  document.body.appendChild(host);

  const root = createRoot(host);
  root.render(
    <CardWrapper
      data={{ ...cardData, profileImageUrl }}
      scale={1}
      layout="horizontal"
      showBothSides
      fitContent
    />
  );

  await new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
  await waitForCard(host);

  const node = host.querySelector('.card-preview-inner');
  if (!node) {
    root.unmount();
    host.remove();
    throw new Error('Card preview could not be drawn');
  }
  return { host, root, node };
}

export async function renderCardPreviewPdfBlob(cardData) {
  const { host, root, node } = await renderCardNode(cardData);
  try {
    const pngOptions = {
      pixelRatio: 3,
      backgroundColor: '#f1f5f9',
      cacheBust: true,
    };
    let dataUrl;
    try {
      dataUrl = await toPng(node, pngOptions);
    } catch {
      dataUrl = await toPng(node, { ...pngOptions, skipFonts: true });
    }
    const rect = node.getBoundingClientRect();
    const widthMm = (rect.width * 25.4) / 96;
    const heightMm = (rect.height * 25.4) / 96;
    const pdf = new jsPDF({
      orientation: widthMm >= heightMm ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [widthMm, heightMm],
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(dataUrl, 'PNG', 0, 0, pageWidth, pageHeight);
    return pdf.output('blob');
  } finally {
    root.unmount();
    host.remove();
  }
}

export async function downloadCardPreviewPdf(cardData, filename) {
  const blob = await renderCardPreviewPdfBlob(cardData);
  cardService.downloadBlob(blob, filename);
}

export async function openCardPreviewPdf(cardData) {
  const blob = await renderCardPreviewPdfBlob(cardData);
  const url = window.URL.createObjectURL(blob);
  const opened = window.open(url, '_blank', 'noopener,noreferrer');
  if (!opened) {
    window.URL.revokeObjectURL(url);
    throw new Error('Pop-up blocked. Please allow pop-ups to view your enrollment card.');
  }
  window.setTimeout(() => window.URL.revokeObjectURL(url), 120000);
}

export async function fetchPreviewCardData(enrollmentId) {
  const data = await cardService.getPreviewData(enrollmentId);
  return mapPreviewToCardData(data);
}
