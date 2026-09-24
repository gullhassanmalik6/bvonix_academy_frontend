import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaWhatsapp, FaFacebookF, FaTwitter, FaEnvelope, FaYoutube, FaInstagram } from 'react-icons/fa';
import { FiChevronDown, FiPhone, FiMapPin } from 'react-icons/fi';
import { siteSettingsService } from '../../services/siteSettingsService';
import SiteLogo from './SiteLogo';

const SOCIAL_ICONS = {
  whatsapp: FaWhatsapp,
  facebook: FaFacebookF,
  twitter: FaTwitter,
  email: FaEnvelope,
  youtube: FaYoutube,
  instagram: FaInstagram,
};

const CONTACT_ICONS = {
  whatsapp: FaWhatsapp,
  email: FaEnvelope,
  phone: FiPhone,
};

const getContactHref = (type, value) => {
  if (!value?.trim()) return null;
  const v = value.trim();
  if (type === 'whatsapp') return `https://wa.me/${v.replace(/\D/g, '')}`;
  if (type === 'email') return `mailto:${v}`;
  if (type === 'phone') return `tel:${v.replace(/\D/g, '')}`;
  return null;
};

const getContactLabel = (type, value) => {
  if (value?.trim()) return value.trim();
  if (type === 'whatsapp') return 'WhatsApp';
  if (type === 'email') return 'Email';
  if (type === 'phone') return 'Phone';
  return type;
};

const ContactDropdown = ({ contactLabel, validContacts, defaultContact }) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(defaultContact);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const displayContact = selected?.value ? selected : defaultContact;
  const displayText = displayContact?.value
    ? getContactLabel(displayContact.type, displayContact.value)
    : 'Select contact';
  const IconComp = CONTACT_ICONS[displayContact?.type] || FaWhatsapp;

  const handleSelect = (c) => {
    setSelected(c);
    setOpen(false);
    const href = getContactHref(c.type, c.value);
    if (href) {
      window.open(href, c.type === 'email' ? '_self' : '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div ref={ref} className="relative">
      <p className="text-white mb-4">{contactLabel}</p>
      <button
        type="button"
        onClick={() => validContacts.length > 0 && setOpen((o) => !o)}
        className={`inline-flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors min-w-[180px] justify-between ${
          validContacts.length === 0 ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
        }`}
      >
        <span className="flex items-center gap-2">
          <IconComp className={`w-5 h-5 ${displayContact?.type === 'whatsapp' ? 'text-[#25D366]' : 'text-[#0A1628]'}`} />
          <span className="text-[#0A1628]">{displayText}</span>
        </span>
        <FiChevronDown className={`w-4 h-4 text-[#0A1628] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && validContacts.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg border border-gray-200 shadow-lg z-50 py-1 max-h-48 overflow-auto">
          {validContacts.map((c, i) => {
            const CIcon = CONTACT_ICONS[c.type] || FaWhatsapp;
            const label = getContactLabel(c.type, c.value);
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(c)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-[#0A1628] hover:bg-gray-100 transition-colors"
              >
                <CIcon className={`w-5 h-5 shrink-0 ${c.type === 'whatsapp' ? 'text-[#25D366]' : ''}`} />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Footer = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    siteSettingsService
      .getSiteSettings()
      .then((data) => setSettings(data))
      .catch(() => setSettings(siteSettingsService.FOOTER_DEFAULTS));
  }, []);

  if (!settings) {
    return (
      <footer className="bg-[#0A1628] text-white mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="h-24" />
        </div>
      </footer>
    );
  }

  const brandName = settings.footer_brand_name || 'Bvonix Academy';
  const contactLabel = settings.footer_contact_label || 'Contact Bvonix Academy';
  const rawContacts = settings.footer_contacts || siteSettingsService.FOOTER_DEFAULTS?.footer_contacts || [];
  const legacyType = settings.footer_contact_type || 'whatsapp';
  const legacyValue = settings.footer_contact_value || '';
  const socialLinks = settings.footer_social_links || siteSettingsService.FOOTER_DEFAULTS?.footer_social_links || [];
  const legalLinks = settings.footer_legal_links || siteSettingsService.FOOTER_DEFAULTS?.footer_legal_links || [];
  const copyrightText = settings.footer_copyright_text || `© ${new Date().getFullYear()} Bvonix Academy. All rights reserved.`;
  const address = settings.footer_address || '';

  const contacts = Array.isArray(rawContacts) && rawContacts.length > 0
    ? rawContacts
    : [{ type: legacyType, value: legacyValue }];
  const validContacts = contacts
    .map((c) => ({ type: c.type || 'whatsapp', value: (c.value || '').trim() }))
    .filter((c) => c.value);
  const defaultContact = validContacts[0] || { type: 'whatsapp', value: '' };

  return (
    <footer className="bg-[#0A1628] text-white mt-auto">
      {/* Upper section */}
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          {/* Left: Brand + Social */}
          <div>
            <div className="mb-4">
              <SiteLogo variant="dark" />
            </div>
            {address && (
              <p className="flex items-start gap-2 text-white/70 text-sm max-w-xs mb-4">
                <FiMapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{address}</span>
              </p>
            )}
            <div className="flex gap-4">
              {socialLinks.map((item, i) => {
                const IconComponent = SOCIAL_ICONS[item.platform?.toLowerCase()];
                if (!IconComponent) return null;
                const url = item.url?.trim();
                const content = <IconComponent className="w-6 h-6 text-white hover:opacity-80 transition-opacity" />;
                return (
                  <span key={i}>
                    {url ? (
                      <a href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noopener noreferrer" aria-label={item.platform}>
                        {content}
                      </a>
                    ) : (
                      <span className="opacity-60 cursor-default">{content}</span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Right: Contact label + dropdown */}
          <ContactDropdown
            contactLabel={contactLabel}
            validContacts={validContacts}
            defaultContact={defaultContact}
          />
        </div>

        {/* Legal links with vertical separators */}
        {legalLinks.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-8 pt-8 border-t border-white/20">
            {legalLinks.map((link, i) => {
              const url = link.url || '#';
              const isExternal = url.startsWith('http://') || url.startsWith('https://');
              const href = isExternal ? url : (url.startsWith('/') ? url : `/${url}`);
              return (
                <React.Fragment key={i}>
                  {i > 0 && <span className="text-white/40">|</span>}
                  {isExternal ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-white hover:underline text-sm">
                      {link.label || 'Link'}
                    </a>
                  ) : (
                    <Link to={href} className="text-white hover:underline text-sm">
                      {link.label || 'Link'}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Lower section - copyright */}
      <div className="border-t border-white/20 py-6">
        <div className="container mx-auto px-4">
          <p className="text-white/80 text-sm text-center max-w-3xl mx-auto leading-relaxed">
            {copyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
