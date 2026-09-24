/** Standard max dimensions for uploaded site logos (aspect ratio preserved). */
export const LOGO_MAX_WIDTH = 400;
export const LOGO_MAX_HEIGHT = 120;

/** Fixed display height (px) used in header, footer, and dashboard. */
export const LOGO_DISPLAY_HEIGHT = 40;

/**
 * Resize an image file using canvas. Preserves aspect ratio within max bounds.
 * Only downscales — smaller images are kept as-is.
 * @returns {Promise<File>}
 */
export async function resizeImageFile(file, maxWidth, maxHeight, quality = 0.92) {
  if (!file || !maxWidth || !maxHeight) {
    throw new Error('Invalid resize parameters');
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      const scale = Math.min(maxWidth / width, maxHeight / height, 1);
      width = Math.max(1, Math.round(width * scale));
      height = Math.max(1, Math.round(height * scale));

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const outputType = file.type === 'image/jpeg' || file.type === 'image/jpg' ? 'image/jpeg' : 'image/png';
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to resize image'));
            return;
          }
          const ext = outputType === 'image/jpeg' ? '.jpg' : '.png';
          const baseName = (file.name || 'logo').replace(/\.[^.]+$/, '');
          resolve(new File([blob], `${baseName}${ext}`, { type: outputType }));
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    img.src = objectUrl;
  });
}

/** Resize a file to standard website logo dimensions before upload. */
export async function prepareLogoForUpload(file) {
  return resizeImageFile(file, LOGO_MAX_WIDTH, LOGO_MAX_HEIGHT);
}

/**
 * Create a preview object URL for a file (caller should revoke when done).
 */
export function createImagePreviewUrl(file) {
  return URL.createObjectURL(file);
}
