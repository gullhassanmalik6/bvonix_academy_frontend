import { useState, useEffect } from 'react';
import { siteSettingsService } from '../services/siteSettingsService';
import { LOGO_DISPLAY_HEIGHT } from '../utils/resizeImage';

const DEFAULT_LOGO = '/logo.png';

export function useSiteLogo() {
  const [logoUrl, setLogoUrl] = useState(DEFAULT_LOGO);
  const [logoType, setLogoType] = useState('image');
  const [logoText, setLogoText] = useState('Bvonix Academy');
  const [brandName, setBrandName] = useState('Bvonix Academy');

  useEffect(() => {
    const refresh = () => {
      siteSettingsService
        .getSiteSettings()
        .then((data) => {
          const base = siteSettingsService.getLogoUrl(data?.site_logo_url);
          setLogoUrl(base ? `${base}${base.includes('?') ? '&' : '?'}v=${Date.now()}` : DEFAULT_LOGO);
          setLogoType(data?.site_logo_type === 'text' ? 'text' : 'image');
          setLogoText(data?.site_logo_text || data?.footer_brand_name || 'Bvonix Academy');
          setBrandName(data?.footer_brand_name || 'Bvonix Academy');
        })
        .catch(() => {});
    };

    refresh();
    window.addEventListener('site-logo-updated', refresh);
    return () => window.removeEventListener('site-logo-updated', refresh);
  }, []);

  return { logoUrl, logoType, logoText, displayHeight: LOGO_DISPLAY_HEIGHT, brandName };
}
