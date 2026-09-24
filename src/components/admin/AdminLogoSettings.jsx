import React, { useState, useEffect, useCallback } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { siteSettingsService } from '../../services/siteSettingsService';
import { useToast } from '../../context/ToastContext';
import {
  prepareLogoForUpload,
  createImagePreviewUrl,
  LOGO_DISPLAY_HEIGHT,
} from '../../utils/resizeImage';
import { FiUpload, FiRotateCcw, FiSave, FiType, FiImage } from 'react-icons/fi';

const notifyLogoUpdated = () => window.dispatchEvent(new Event('site-logo-updated'));

const AdminLogoSettings = () => {
  const toast = useToast();
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoType, setLogoType] = useState('image');
  const [logoText, setLogoText] = useState('Bvonix Academy');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewKey, setPreviewKey] = useState(0);

  const loadLogoSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await siteSettingsService.getSiteSettings();
      const url = siteSettingsService.getLogoUrl(data?.site_logo_url);
      setLogoUrl(url ? `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}` : '/logo.png');
      setLogoType(data?.site_logo_type === 'text' ? 'text' : 'image');
      setLogoText(data?.site_logo_text || 'Bvonix Academy');
      setPreviewKey((k) => k + 1);
    } catch {
      setLogoUrl('/logo.png');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogoSettings();
  }, [loadLogoSettings]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return undefined;
    }
    const url = createImagePreviewUrl(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.warning('Please select an image file (JPEG, PNG, or WebP)');
      return;
    }
    setSelectedFile(file);
  };

  const handleSaveLogoSettings = async () => {
    if (logoType === 'text' && !logoText.trim()) {
      toast.warning('Please enter logo text');
      return;
    }
    try {
      setSaving(true);
      await siteSettingsService.updateBrandSettings({
        site_logo_type: logoType,
        site_logo_text: logoText.trim(),
      });
      toast.success('Logo settings saved');
      setPreviewKey((k) => k + 1);
      notifyLogoUpdated();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save logo settings');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.warning('Please select a logo image first');
      return;
    }
    try {
      setUploading(true);
      const fileToUpload = await prepareLogoForUpload(selectedFile);
      const data = await siteSettingsService.uploadLogo(fileToUpload);
      const newUrl = siteSettingsService.getLogoUrl(data?.site_logo_url);
      setLogoUrl(newUrl ? `${newUrl}?v=${Date.now()}` : '/logo.png');
      setSelectedFile(null);
      setPreviewUrl(null);
      const input = document.getElementById('site-logo-input');
      if (input) input.value = '';
      if (logoType !== 'image') {
        setLogoType('image');
        await siteSettingsService.updateBrandSettings({ site_logo_type: 'image' });
      }
      toast.success('Logo image uploaded');
      setPreviewKey((k) => k + 1);
      notifyLogoUpdated();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleResetToDefault = async () => {
    try {
      setResetting(true);
      await siteSettingsService.updateBrandSettings({
        site_logo_url: '/logo.png',
        site_logo_type: 'image',
      });
      setLogoUrl('/logo.png');
      setLogoType('image');
      toast.success('Logo reset to default');
      setPreviewKey((k) => k + 1);
      notifyLogoUpdated();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to reset logo');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="py-8 text-center text-gray-500">Loading logo settings...</div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold text-[#1F1F1F] mb-2">Site Logo</h2>
      <p className="text-gray-600 mb-6">
        Choose an image logo or text logo for the header, footer, and dashboard.
      </p>

      {/* Logo type toggle */}
      <div className="mb-8">
        <p className="text-sm font-medium text-gray-700 mb-3">Logo Type</p>
        <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50">
          <button
            type="button"
            onClick={() => setLogoType('image')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              logoType === 'image' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiImage className="w-4 h-4" />
            Image Logo
          </button>
          <button
            type="button"
            onClick={() => setLogoType('text')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              logoType === 'text' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiType className="w-4 h-4" />
            Text Logo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Preview</p>
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg bg-white">
              <p className="text-xs text-gray-500 mb-2">Header / Dashboard</p>
              <LogoPreview logoType={logoType} logoText={logoText} logoUrl={logoUrl} previewKey={previewKey} variant="light" />
            </div>
            <div className="p-4 border border-gray-200 rounded-lg bg-[#0A1628]">
              <p className="text-xs text-white/50 mb-2">Footer</p>
              <LogoPreview logoType={logoType} logoText={logoText} logoUrl={logoUrl} previewKey={previewKey} variant="dark" />
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetToDefault}
            disabled={resetting}
            className="mt-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600"
          >
            <FiRotateCcw className="w-4 h-4" />
            Reset to default image logo
          </button>
        </div>

        <div>
          {logoType === 'text' ? (
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-700">Logo Text</p>
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Enter your brand name. Use a new line for a two-line logo (e.g. Bvonix on line 1, Academy on line 2).
                </label>
                <textarea
                  value={logoText}
                  onChange={(e) => setLogoText(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={'Bvonix\nAcademy'}
                />
              </div>
              <Button
                onClick={handleSaveLogoSettings}
                disabled={saving}
                className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-700 text-white"
              >
                <FiSave className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Text Logo'}
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Upload Logo Image</p>
              <p className="text-sm text-gray-500 mb-4">
                Images are optimized automatically and shown at {LOGO_DISPLAY_HEIGHT}px height.
              </p>
              <input
                id="site-logo-input"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="site-logo-input"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 mb-4"
              >
                <FiUpload className="w-4 h-4" />
                {selectedFile ? selectedFile.name : 'Choose logo image'}
              </label>

              {previewUrl && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Upload preview</p>
                  <div className="inline-block p-3 border border-gray-200 rounded-lg bg-white">
                    <img
                      src={previewUrl}
                      alt="Logo preview"
                      style={{ height: LOGO_DISPLAY_HEIGHT }}
                      className="w-auto object-contain"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="bg-primary-500 hover:bg-primary-700 text-white"
                >
                  {uploading ? 'Uploading...' : 'Upload Logo'}
                </Button>
                <Button
                  onClick={handleSaveLogoSettings}
                  disabled={saving}
                  variant="secondary"
                  className="inline-flex items-center gap-2"
                >
                  <FiSave className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Apply Image Logo'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

/** Inline preview using local state (not live hook) for admin form */
const LogoPreview = ({ logoType, logoText, logoUrl, previewKey, variant }) => {
  const isDark = variant === 'dark';

  if (logoType === 'text') {
    const lines = (logoText || 'Bvonix Academy').split('\n').map((l) => l.trim()).filter(Boolean);
    const primary = lines[0] || 'Bvonix Academy';
    const secondary = lines[1] || '';

    if (secondary) {
      return (
        <div className="leading-tight">
          <span className={`block font-bold text-xl tracking-tight ${isDark ? 'text-white' : 'text-[#0A1628]'}`}>{primary}</span>
          <span className={`block text-sm font-medium ${isDark ? 'text-white/75' : 'text-gray-600'}`}>{secondary}</span>
        </div>
      );
    }
    return (
      <span className={`font-bold text-xl tracking-tight ${isDark ? 'text-white' : 'text-[#0A1628]'}`}>{primary}</span>
    );
  }

  return (
    <img
      key={previewKey}
      src={logoUrl || '/logo.png'}
      alt="Logo preview"
      style={{ height: LOGO_DISPLAY_HEIGHT }}
      className={`w-auto object-contain ${isDark ? 'brightness-0 invert' : ''}`}
    />
  );
};

export default AdminLogoSettings;
