import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { siteSettingsService } from '../../services/siteSettingsService';
import { useToast } from '../../context/ToastContext';
import { FiUpload, FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';
import AdminLogoSettings from './AdminLogoSettings';

const AdminSiteSettings = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingCommunity, setSavingCommunity] = useState(false);
  const [savingMilestones, setSavingMilestones] = useState(false);
  const [savingBenefits, setSavingBenefits] = useState(false);
  const [savingSubjects, setSavingSubjects] = useState(false);
  const [savingTestimonials, setSavingTestimonials] = useState(false);
  const [savingFooter, setSavingFooter] = useState(false);
  const [savingDashboard, setSavingDashboard] = useState(false);
  const [uploadingBenefitIcon, setUploadingBenefitIcon] = useState(null);
  const [uploadingSubjectIcon, setUploadingSubjectIcon] = useState(null);
  const [uploadingTestimonialAvatar, setUploadingTestimonialAvatar] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingCommunity, setUploadingCommunity] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCommunityFile, setSelectedCommunityFile] = useState(null);
  const [form, setForm] = useState({
    hero_headline: '',
    hero_description: '',
    hero_cta_text: '',
    hero_cta_link: '',
    hero_cta_subtext: '',
    hero_social_text: '',
    hero_image_alt: '',
  });
  const [communityForm, setCommunityForm] = useState({
    community_header: '',
    community_title: '',
    community_description: '',
    community_stat1_value: '',
    community_stat1_label: '',
    community_stat2_value: '',
    community_stat2_label: '',
    community_stat3_value: '',
    community_stat3_label: '',
    community_image_alt: '',
  });
  const [heroIconUrl, setHeroIconUrl] = useState(null);
  const [communityImageUrl, setCommunityImageUrl] = useState(null);
  const [milestonesItems, setMilestonesItems] = useState([]);
  const [benefitsHeader, setBenefitsHeader] = useState('');
  const [benefitsTitle, setBenefitsTitle] = useState('');
  const [benefitsItems, setBenefitsItems] = useState([]);
  const [subjectsHeader, setSubjectsHeader] = useState('');
  const [subjectsTitle, setSubjectsTitle] = useState('');
  const [subjectsItems, setSubjectsItems] = useState([]);
  const [testimonialsHeader, setTestimonialsHeader] = useState('');
  const [testimonialsTitle, setTestimonialsTitle] = useState('');
  const [testimonialsItems, setTestimonialsItems] = useState([]);
  const [footerBrandName, setFooterBrandName] = useState('');
  const [footerContactLabel, setFooterContactLabel] = useState('');
  const [footerContacts, setFooterContacts] = useState([]);
  const [footerSocialLinks, setFooterSocialLinks] = useState([]);
  const [footerLegalLinks, setFooterLegalLinks] = useState([]);
  const [footerCopyrightText, setFooterCopyrightText] = useState('');
  const [dashboardBannerTitle, setDashboardBannerTitle] = useState('');
  const [dashboardBannerCtaText, setDashboardBannerCtaText] = useState('');
  const [dashboardBannerCtaLink, setDashboardBannerCtaLink] = useState('');
  const [dashboardYoutubeUrl, setDashboardYoutubeUrl] = useState('');
  const [dashboardGreetingPrefix, setDashboardGreetingPrefix] = useState('');
  const [dashboardMotivationalText, setDashboardMotivationalText] = useState('');
  const [dashboardSearchPlaceholder, setDashboardSearchPlaceholder] = useState('');
  const [dashboardFriendsItems, setDashboardFriendsItems] = useState([]);

  useEffect(() => {
    loadSiteSettings();
  }, []);

  const loadSiteSettings = async () => {
    try {
      setLoading(true);
      const data = await siteSettingsService.getSiteSettings();
      setForm({
        hero_headline: data.hero_headline || '',
        hero_description: data.hero_description || '',
        hero_cta_text: data.hero_cta_text || '',
        hero_cta_link: data.hero_cta_link || '',
        hero_cta_subtext: data.hero_cta_subtext || '',
        hero_social_text: data.hero_social_text || '',
        hero_image_alt: data.hero_image_alt || '',
      });
      setHeroIconUrl(siteSettingsService.getHeroIconUrl(data?.hero_icon_url));
      setCommunityForm({
        community_header: data.community_header || '',
        community_title: data.community_title || '',
        community_description: data.community_description || '',
        community_stat1_value: data.community_stat1_value || '',
        community_stat1_label: data.community_stat1_label || '',
        community_stat2_value: data.community_stat2_value || '',
        community_stat2_label: data.community_stat2_label || '',
        community_stat3_value: data.community_stat3_value || '',
        community_stat3_label: data.community_stat3_label || '',
        community_image_alt: data.community_image_alt || '',
      });
      const communityImg = data?.community_image_url;
      if (communityImg) setCommunityImageUrl(siteSettingsService.getHeroIconUrl(communityImg));
      const items = data?.milestones_items || siteSettingsService.MILESTONES_DEFAULTS?.milestones_items || [];
      setMilestonesItems(Array.isArray(items) ? items.map((i) => ({ value: i?.value ?? '', label: i?.label ?? '' })) : []);
      setBenefitsHeader(data?.benefits_header ?? '');
      setBenefitsTitle(data?.benefits_title ?? '');
      const bItems = data?.benefits_items || siteSettingsService.BENEFITS_DEFAULTS?.benefits_items || [];
      setBenefitsItems(Array.isArray(bItems) ? bItems.map((i) => ({
        title: i?.title ?? '',
        description: i?.description ?? '',
        background_color: i?.background_color ?? '#E53935',
        icon_url: i?.icon_url ?? null,
      })) : []);
      setSubjectsHeader(data?.subjects_header ?? '');
      setSubjectsTitle(data?.subjects_title ?? '');
      const sItems = data?.subjects_items || siteSettingsService.SUBJECTS_DEFAULTS?.subjects_items || [];
      setSubjectsItems(Array.isArray(sItems) ? sItems.map((i) => ({
        title: i?.title ?? '',
        subtitle: i?.subtitle ?? '',
        background_color: i?.background_color ?? '#E53935',
        icon_url: i?.icon_url ?? null,
      })) : []);
      setTestimonialsHeader(data?.testimonials_header ?? '');
      setTestimonialsTitle(data?.testimonials_title ?? '');
      const tItems = data?.testimonials_items || siteSettingsService.TESTIMONIALS_DEFAULTS?.testimonials_items || [];
      setTestimonialsItems(Array.isArray(tItems) ? tItems.map((i) => ({
        testimonial_text: i?.testimonial_text ?? '',
        author_name: i?.author_name ?? '',
        author_title: i?.author_title ?? '',
        author_avatar_url: i?.author_avatar_url ?? null,
      })) : []);
      setFooterBrandName(data?.footer_brand_name ?? '');
      setFooterContactLabel(data?.footer_contact_label ?? '');
      const cItems = data?.footer_contacts || siteSettingsService.FOOTER_DEFAULTS?.footer_contacts || [];
      setFooterContacts(Array.isArray(cItems) ? cItems.map((i) => ({ type: i?.type ?? 'whatsapp', value: i?.value ?? '' })) : []);
      const socLinks = data?.footer_social_links || siteSettingsService.FOOTER_DEFAULTS?.footer_social_links || [];
      setFooterSocialLinks(Array.isArray(socLinks) ? socLinks.map((i) => ({ platform: i?.platform ?? '', url: i?.url ?? '' })) : []);
      const legLinks = data?.footer_legal_links || siteSettingsService.FOOTER_DEFAULTS?.footer_legal_links || [];
      setFooterLegalLinks(Array.isArray(legLinks) ? legLinks.map((i) => ({ label: i?.label ?? '', url: i?.url ?? '' })) : []);
      setFooterCopyrightText(data?.footer_copyright_text ?? '');
      setDashboardBannerTitle(data?.dashboard_banner_title ?? '');
      setDashboardBannerCtaText(data?.dashboard_banner_cta_text ?? '');
      setDashboardBannerCtaLink(data?.dashboard_banner_cta_link ?? '');
      setDashboardYoutubeUrl(data?.dashboard_youtube_url ?? '');
      setDashboardGreetingPrefix(data?.dashboard_greeting_prefix ?? '');
      setDashboardMotivationalText(data?.dashboard_motivational_text ?? '');
      setDashboardSearchPlaceholder(data?.dashboard_search_placeholder ?? '');
      const fItems = data?.dashboard_friends_items || siteSettingsService.DASHBOARD_DEFAULTS?.dashboard_friends_items || [];
      setDashboardFriendsItems(Array.isArray(fItems) ? fItems.map((i) => ({ name: i?.name ?? '', role: i?.role ?? '', avatar_url: i?.avatar_url ?? null })) : []);
    } catch (err) {
      toast.error('Failed to load site settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCommunityChange = (field, value) => {
    setCommunityForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = Object.fromEntries(
        Object.entries(form).filter(([, v]) => v !== undefined && v !== '')
      );
      await siteSettingsService.updateHeroSettings(payload);
      toast.success('Hero section updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error('Invalid file type. Use JPEG, PNG, or WebP.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File too large. Maximum 5MB.');
        return;
      }
      setSelectedFile(file);
      toast.info(`Selected: ${file.name}`);
    }
  };

  const handleCommunityFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error('Invalid file type. Use JPEG, PNG, or WebP.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File too large. Maximum 5MB.');
        return;
      }
      setSelectedCommunityFile(file);
      toast.info(`Selected: ${file.name}`);
    }
  };

  const handleSaveCommunity = async () => {
    try {
      setSavingCommunity(true);
      const payload = Object.fromEntries(
        Object.entries(communityForm).filter(([, v]) => v !== undefined && v !== '')
      );
      await siteSettingsService.updateCommunitySettings(payload);
      toast.success('Community section updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save');
    } finally {
      setSavingCommunity(false);
    }
  };

  const handleUploadCommunity = async () => {
    if (!selectedCommunityFile) {
      toast.warning('Please select an image first');
      return;
    }
    try {
      setUploadingCommunity(true);
      const data = await siteSettingsService.uploadCommunityImage(selectedCommunityFile);
      setCommunityImageUrl(siteSettingsService.getHeroIconUrl(data?.community_image_url));
      setSelectedCommunityFile(null);
      document.getElementById('community-image-input').value = '';
      toast.success('Community image updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to upload image');
    } finally {
      setUploadingCommunity(false);
    }
  };

  const handleMilestoneChange = (index, field, value) => {
    setMilestonesItems((prev) => {
      const next = [...prev];
      if (!next[index]) next[index] = { value: '', label: '' };
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddMilestone = () => {
    setMilestonesItems((prev) => [...prev, { value: '', label: '' }]);
  };

  const handleRemoveMilestone = (index) => {
    setMilestonesItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBenefitChange = (index, field, value) => {
    setBenefitsItems((prev) => {
      const next = [...prev];
      if (!next[index]) next[index] = { title: '', description: '', background_color: '#E53935', icon_url: null };
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddBenefit = () => {
    setBenefitsItems((prev) => [...prev, { title: '', description: '', background_color: '#E53935', icon_url: null }]);
  };

  const handleRemoveBenefit = (index) => {
    setBenefitsItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveBenefits = async () => {
    const valid = benefitsItems.filter((i) => i.title?.trim() || i.description?.trim());
    if (valid.length === 0) {
      toast.warning('Add at least one benefit card');
      return;
    }
    try {
      setSavingBenefits(true);
      await siteSettingsService.updateBenefitsSettings({
        benefits_header: benefitsHeader,
        benefits_title: benefitsTitle,
        benefits_items: valid.map((i) => ({
          title: i.title?.trim() || '',
          description: i.description?.trim() || '',
          background_color: i.background_color || '#E53935',
          icon_url: i.icon_url || null,
        })),
      });
      toast.success('Benefits section updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save benefits');
    } finally {
      setSavingBenefits(false);
    }
  };

  const handleBenefitIconUpload = async (index, file) => {
    if (!file) return;
    try {
      setUploadingBenefitIcon(index);
      const data = await siteSettingsService.uploadBenefitIcon(file, index);
      setBenefitsItems((prev) => {
        const next = [...prev];
        if (next[index]) next[index] = { ...next[index], icon_url: data.icon_url };
        return next;
      });
      toast.success('Benefit icon updated');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to upload icon');
    } finally {
      setUploadingBenefitIcon(null);
    }
  };

  const handleSubjectChange = (index, field, value) => {
    setSubjectsItems((prev) => {
      const next = [...prev];
      if (!next[index]) next[index] = { title: '', subtitle: '', background_color: '#E53935', icon_url: null };
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddSubject = () => {
    setSubjectsItems((prev) => [...prev, { title: '', subtitle: '', background_color: '#E53935', icon_url: null }]);
  };

  const handleRemoveSubject = (index) => {
    setSubjectsItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveSubjects = async () => {
    const valid = subjectsItems.filter((i) => i.title?.trim() || i.subtitle?.trim());
    if (valid.length === 0) {
      toast.warning('Add at least one subject card');
      return;
    }
    try {
      setSavingSubjects(true);
      await siteSettingsService.updateSubjectsSettings({
        subjects_header: subjectsHeader,
        subjects_title: subjectsTitle,
        subjects_items: valid.map((i) => ({
          title: i.title?.trim() || '',
          subtitle: i.subtitle?.trim() || '',
          background_color: i.background_color || '#E53935',
          icon_url: i.icon_url || null,
        })),
      });
      toast.success('Subjects section updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save subjects');
    } finally {
      setSavingSubjects(false);
    }
  };

  const handleSubjectIconUpload = async (index, file) => {
    if (!file) return;
    try {
      setUploadingSubjectIcon(index);
      const data = await siteSettingsService.uploadSubjectIcon(file, index);
      setSubjectsItems((prev) => {
        const next = [...prev];
        if (next[index]) next[index] = { ...next[index], icon_url: data.icon_url };
        return next;
      });
      toast.success('Subject icon updated');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to upload icon');
    } finally {
      setUploadingSubjectIcon(null);
    }
  };

  const handleTestimonialChange = (index, field, value) => {
    setTestimonialsItems((prev) => {
      const next = [...prev];
      if (!next[index]) next[index] = { testimonial_text: '', author_name: '', author_title: '', author_avatar_url: null };
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddTestimonial = () => {
    setTestimonialsItems((prev) => [...prev, { testimonial_text: '', author_name: '', author_title: '', author_avatar_url: null }]);
  };

  const handleRemoveTestimonial = (index) => {
    setTestimonialsItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveTestimonials = async () => {
    const valid = testimonialsItems.filter((i) => i.testimonial_text?.trim() || i.author_name?.trim());
    if (valid.length === 0) {
      toast.warning('Add at least one testimonial');
      return;
    }
    try {
      setSavingTestimonials(true);
      await siteSettingsService.updateTestimonialsSettings({
        testimonials_header: testimonialsHeader,
        testimonials_title: testimonialsTitle,
        testimonials_items: valid.map((i) => ({
          testimonial_text: i.testimonial_text?.trim() || '',
          author_name: i.author_name?.trim() || '',
          author_title: i.author_title?.trim() || '',
          author_avatar_url: i.author_avatar_url || null,
        })),
      });
      toast.success('Testimonials section updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save testimonials');
    } finally {
      setSavingTestimonials(false);
    }
  };

  const handleTestimonialAvatarUpload = async (index, file) => {
    if (!file) return;
    try {
      setUploadingTestimonialAvatar(index);
      const data = await siteSettingsService.uploadTestimonialAvatar(file, index);
      setTestimonialsItems((prev) => {
        const next = [...prev];
        if (next[index]) next[index] = { ...next[index], author_avatar_url: data.author_avatar_url };
        return next;
      });
      toast.success('Testimonial avatar updated');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to upload avatar');
    } finally {
      setUploadingTestimonialAvatar(null);
    }
  };

  const handleFooterSocialChange = (index, field, value) => {
    setFooterSocialLinks((prev) => {
      const next = [...prev];
      if (!next[index]) next[index] = { platform: '', url: '' };
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleFooterLegalChange = (index, field, value) => {
    setFooterLegalLinks((prev) => {
      const next = [...prev];
      if (!next[index]) next[index] = { label: '', url: '' };
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleFooterContactChange = (index, field, value) => {
    setFooterContacts((prev) => {
      const next = [...prev];
      if (!next[index]) next[index] = { type: 'whatsapp', value: '' };
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };
  const handleDashboardFriendChange = (index, field, value) => {
    setDashboardFriendsItems((prev) => {
      const next = [...prev];
      if (!next[index]) next[index] = { name: '', role: '', avatar_url: null };
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };
  const handleAddDashboardFriend = () => setDashboardFriendsItems((prev) => [...prev, { name: '', role: '', avatar_url: null }]);
  const handleRemoveDashboardFriend = (i) => setDashboardFriendsItems((prev) => prev.filter((_, idx) => idx !== i));

  const handleSaveDashboard = async () => {
    try {
      setSavingDashboard(true);
      await siteSettingsService.updateDashboardSettings({
        dashboard_banner_title: dashboardBannerTitle,
        dashboard_banner_cta_text: dashboardBannerCtaText,
        dashboard_banner_cta_link: dashboardBannerCtaLink,
        dashboard_youtube_url: dashboardYoutubeUrl,
        dashboard_greeting_prefix: dashboardGreetingPrefix,
        dashboard_motivational_text: dashboardMotivationalText,
        dashboard_search_placeholder: dashboardSearchPlaceholder,
        dashboard_friends_items: dashboardFriendsItems.filter((i) => i.name?.trim() || i.role?.trim()),
      });
      toast.success('Student dashboard section updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save dashboard settings');
    } finally {
      setSavingDashboard(false);
    }
  };

  const handleAddFooterContact = () => setFooterContacts((prev) => [...prev, { type: 'whatsapp', value: '' }]);
  const handleRemoveFooterContact = (i) => setFooterContacts((prev) => prev.filter((_, idx) => idx !== i));

  const handleAddFooterSocial = () => setFooterSocialLinks((prev) => [...prev, { platform: 'facebook', url: '' }]);
  const handleRemoveFooterSocial = (i) => setFooterSocialLinks((prev) => prev.filter((_, idx) => idx !== i));
  const handleAddFooterLegal = () => setFooterLegalLinks((prev) => [...prev, { label: '', url: '' }]);
  const handleRemoveFooterLegal = (i) => setFooterLegalLinks((prev) => prev.filter((_, idx) => idx !== i));

  const handleSaveFooter = async () => {
    try {
      setSavingFooter(true);
      await siteSettingsService.updateFooterSettings({
        footer_brand_name: footerBrandName,
        footer_contact_label: footerContactLabel,
        footer_contacts: footerContacts,
        footer_social_links: footerSocialLinks.filter((i) => i.platform || i.url),
        footer_legal_links: footerLegalLinks.filter((i) => i.label || i.url),
        footer_copyright_text: footerCopyrightText,
      });
      toast.success('Footer updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save footer');
    } finally {
      setSavingFooter(false);
    }
  };

  const handleSaveMilestones = async () => {
    const valid = milestonesItems.filter((i) => (i.value?.trim() || i.label?.trim()));
    if (valid.length === 0) {
      toast.warning('Add at least one milestone (value or label)');
      return;
    }
    try {
      setSavingMilestones(true);
      await siteSettingsService.updateMilestonesSettings({
        milestones_items: valid.map((i) => ({ value: i.value?.trim() || '', label: i.label?.trim() || '' })),
      });
      setMilestonesItems(valid);
      toast.success('Milestones section updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save milestones');
    } finally {
      setSavingMilestones(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.warning('Please select an image first');
      return;
    }
    try {
      setUploading(true);
      const data = await siteSettingsService.uploadHeroIcon(selectedFile);
      setHeroIconUrl(siteSettingsService.getHeroIconUrl(data?.hero_icon_url));
      setSelectedFile(null);
      document.getElementById('hero-icon-input').value = '';
      toast.success('Hero icon updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to upload hero icon');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="py-12 text-center text-gray-500">Loading site settings...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <AdminLogoSettings />

      <Card>
        <h2 className="text-xl font-semibold text-[#1F1F1F] mb-6">Hero Section – Full Customization</h2>
        <p className="text-gray-600 mb-6">
          Customize the hero section on your homepage. All fields are optional – leave blank to use defaults.
        </p>

        <div className="space-y-6">
          {/* Headline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Headline (use new lines for multiple lines)</label>
            <textarea
              value={form.hero_headline}
              onChange={(e) => handleChange('hero_headline', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Find Your&#10;Perfect Tutor&#10;Today"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={form.hero_description}
              onChange={(e) => handleChange('hero_description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="We help you find the perfect tutor for 1-on-1 lessons. It is completely free and private."
            />
          </div>

          {/* CTA Button */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
              <Input
                value={form.hero_cta_text}
                onChange={(e) => handleChange('hero_cta_text', e.target.value)}
                placeholder="Get The App"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Button Link (e.g. /courses or https://...)</label>
              <Input
                value={form.hero_cta_link}
                onChange={(e) => handleChange('hero_cta_link', e.target.value)}
                placeholder="/courses"
              />
            </div>
          </div>

          {/* CTA Subtext */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Text Below Button</label>
            <Input
              value={form.hero_cta_subtext}
              onChange={(e) => handleChange('hero_cta_subtext', e.target.value)}
              placeholder="It is completely free and private"
            />
          </div>

          {/* Social Proof */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Social Proof Text</label>
            <Input
              value={form.hero_social_text}
              onChange={(e) => handleChange('hero_social_text', e.target.value)}
              placeholder="More than 23,000+ mentors"
            />
          </div>

          {/* Hero Image */}
          <div className="border-t border-gray-200 pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Hero Image Alt Text</label>
            <Input
              value={form.hero_image_alt}
              onChange={(e) => handleChange('hero_image_alt', e.target.value)}
              placeholder="Students learning at Bvonix Academy"
              className="mb-4"
            />

            <p className="text-sm font-medium text-gray-700 mb-2">Hero Image</p>
            {heroIconUrl && (
              <div className="mb-4 inline-block border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                <img
                  src={heroIconUrl}
                  alt="Current hero"
                  className="w-48 h-48 object-contain"
                />
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <input
                id="hero-icon-input"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="hero-icon-input"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
              >
                <FiUpload className="w-4 h-4" />
                {selectedFile ? selectedFile.name : 'Choose image'}
              </label>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="bg-primary-500 hover:bg-primary-700 text-white"
              >
                {uploading ? 'Uploading...' : 'Update Image'}
              </Button>
            </div>
            {!heroIconUrl && (
              <p className="mt-2 text-sm text-gray-500">
                No custom image. Using default. Upload to replace.
              </p>
            )}
          </div>
        </div>

        {/* Save button */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-700 text-white"
          >
            <FiSave className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Hero Section'}
          </Button>
        </div>
      </Card>

      {/* Student Dashboard Section */}
      <Card className="mt-6">
        <h2 className="text-xl font-semibold text-[#1F1F1F] mb-6">Student Dashboard – Full Customization</h2>
        <p className="text-sm text-gray-600 mb-4">Customize the enrolled student dashboard banner, greeting, search placeholder, and friends list.</p>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Banner Title</label>
            <Input
              value={dashboardBannerTitle}
              onChange={(e) => setDashboardBannerTitle(e.target.value)}
              placeholder="Sharpen Your Skills With Professional Online Courses"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Banner CTA Text</label>
              <Input
                value={dashboardBannerCtaText}
                onChange={(e) => setDashboardBannerCtaText(e.target.value)}
                placeholder="Join Now"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Banner CTA Link</label>
              <Input
                value={dashboardBannerCtaLink}
                onChange={(e) => setDashboardBannerCtaLink(e.target.value)}
                placeholder="/courses"
              />
            </div>
          </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">YouTube Video or Playlist URL</label>
              <Input
                value={dashboardYoutubeUrl}
                onChange={(e) => setDashboardYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or https://youtube.com/playlist?list=..."
              />
              <p className="text-xs text-gray-500 mt-1">Add a YouTube video or playlist to embed in the dashboard banner. Leave empty to hide.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Greeting Prefix</label>
            <Input
              value={dashboardGreetingPrefix}
              onChange={(e) => setDashboardGreetingPrefix(e.target.value)}
              placeholder="Good Morning"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Motivational Text</label>
            <Input
              value={dashboardMotivationalText}
              onChange={(e) => setDashboardMotivationalText(e.target.value)}
              placeholder="Continue Your Journey And Achieve Your Target"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Placeholder</label>
            <Input
              value={dashboardSearchPlaceholder}
              onChange={(e) => setDashboardSearchPlaceholder(e.target.value)}
              placeholder="Search your course here..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Friends (sidebar list)</label>
            {dashboardFriendsItems.map((item, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleDashboardFriendChange(i, 'name', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Name"
                />
                <input
                  type="text"
                  value={item.role}
                  onChange={(e) => handleDashboardFriendChange(i, 'role', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Role"
                />
                <button type="button" onClick={() => handleRemoveDashboardFriend(i)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={handleAddDashboardFriend} className="mt-2 border border-gray-300 hover:bg-gray-50">
              <FiPlus className="inline w-4 h-4 mr-1" /> Add Friend
            </Button>
          </div>
        </div>
        <Button onClick={handleSaveDashboard} disabled={savingDashboard} className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-700 text-white">
          <FiSave className="w-4 h-4" />
          {savingDashboard ? 'Saving...' : 'Save Dashboard Section'}
        </Button>
      </Card>

      {/* Community Section */}
      <Card className="mt-6">
        <h2 className="text-xl font-semibold text-[#1F1F1F] mb-6">Community Section – Full Customization</h2>
        <p className="text-gray-600 mb-6">
          Customize the community/discussion forum section below the hero. All fields are optional.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Header (uppercase label)</label>
            <Input
              value={communityForm.community_header}
              onChange={(e) => handleCommunityChange('community_header', e.target.value)}
              placeholder="COMMUNITY HUB DISCUSSION FORUM"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <Input
              value={communityForm.community_title}
              onChange={(e) => handleCommunityChange('community_title', e.target.value)}
              placeholder="Discussion Forum for Sharing, Learning, and Helping"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={communityForm.community_description}
              onChange={(e) => handleCommunityChange('community_description', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Dive into our dynamic Community Hub..."
            />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm font-medium text-gray-700 mb-4">Statistic Cards (3 cards)</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Card 1 Value</label>
                <Input
                  value={communityForm.community_stat1_value}
                  onChange={(e) => handleCommunityChange('community_stat1_value', e.target.value)}
                  placeholder="12 k"
                />
                <label className="block text-xs text-gray-500 mb-1 mt-2">Card 1 Label</label>
                <Input
                  value={communityForm.community_stat1_label}
                  onChange={(e) => handleCommunityChange('community_stat1_label', e.target.value)}
                  placeholder="Success Journey"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Card 2 Value</label>
                <Input
                  value={communityForm.community_stat2_value}
                  onChange={(e) => handleCommunityChange('community_stat2_value', e.target.value)}
                  placeholder="98 +"
                />
                <label className="block text-xs text-gray-500 mb-1 mt-2">Card 2 Label</label>
                <Input
                  value={communityForm.community_stat2_label}
                  onChange={(e) => handleCommunityChange('community_stat2_label', e.target.value)}
                  placeholder="Best Mentor"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Card 3 Value</label>
                <Input
                  value={communityForm.community_stat3_value}
                  onChange={(e) => handleCommunityChange('community_stat3_value', e.target.value)}
                  placeholder="21 +"
                />
                <label className="block text-xs text-gray-500 mb-1 mt-2">Card 3 Label</label>
                <Input
                  value={communityForm.community_stat3_label}
                  onChange={(e) => handleCommunityChange('community_stat3_label', e.target.value)}
                  placeholder="Years Experience"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Community Image Alt Text</label>
            <Input
              value={communityForm.community_image_alt}
              onChange={(e) => handleCommunityChange('community_image_alt', e.target.value)}
              placeholder="Community member with laptop"
              className="mb-4"
            />
            <p className="text-sm font-medium text-gray-700 mb-2">Community Image (person with laptop)</p>
            {communityImageUrl && (
              <div className="mb-4 inline-block border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                <img src={communityImageUrl} alt="Current" className="w-48 h-48 object-contain" />
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <input
                id="community-image-input"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleCommunityFileChange}
                className="hidden"
              />
              <label
                htmlFor="community-image-input"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm font-medium text-gray-700"
              >
                <FiUpload className="w-4 h-4" />
                {selectedCommunityFile ? selectedCommunityFile.name : 'Choose image'}
              </label>
              <Button
                onClick={handleUploadCommunity}
                disabled={!selectedCommunityFile || uploadingCommunity}
                className="bg-primary-500 hover:bg-primary-700 text-white"
              >
                {uploadingCommunity ? 'Uploading...' : 'Update Image'}
              </Button>
            </div>
            {!communityImageUrl && (
              <p className="mt-2 text-sm text-gray-500">No custom image. Uses placeholder. Upload to replace.</p>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Button
            onClick={handleSaveCommunity}
            disabled={savingCommunity}
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-700 text-white"
          >
            <FiSave className="w-4 h-4" />
            {savingCommunity ? 'Saving...' : 'Save Community Section'}
          </Button>
        </div>
      </Card>

      {/* Milestones Section */}
      <Card>
        <h2 className="text-xl font-semibold text-[#1F1F1F] mb-6">Milestones Section – Full Customization</h2>
        <p className="text-gray-600 mb-6">
          Customize the milestones/statistics section (wavy line with stats). Add, edit, or remove items. Each item shows a value (e.g. 1k+, 50+) and a label (e.g. Students, Courses).
        </p>

        <div className="space-y-4">
          {milestonesItems.map((item, index) => (
            <div
              key={index}
              className="flex flex-wrap items-center gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50/50"
            >
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs text-gray-500 mb-1">Value (e.g. 1k+, 50+)</label>
                <Input
                  value={item.value}
                  onChange={(e) => handleMilestoneChange(index, 'value', e.target.value)}
                  placeholder="1k+"
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs text-gray-500 mb-1">Label (e.g. Students)</label>
                <Input
                  value={item.label}
                  onChange={(e) => handleMilestoneChange(index, 'label', e.target.value)}
                  placeholder="Students"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveMilestone(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove"
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddMilestone}
            className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50"
          >
            <FiPlus className="w-4 h-4" />
            Add Milestone
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Button
            onClick={handleSaveMilestones}
            disabled={savingMilestones}
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-700 text-white"
          >
            <FiSave className="w-4 h-4" />
            {savingMilestones ? 'Saving...' : 'Save Milestones Section'}
          </Button>
        </div>
      </Card>

      {/* Benefits Section */}
      <Card>
        <h2 className="text-xl font-semibold text-[#1F1F1F] mb-6">Benefits Section – Full Customization</h2>
        <p className="text-gray-600 mb-6">
          Customize the &quot;Why Choose Us&quot; section with colored cards. Each card has a title, description, background color, and optional icon.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pre-header (uppercase label)</label>
            <Input
              value={benefitsHeader}
              onChange={(e) => setBenefitsHeader(e.target.value)}
              placeholder="WHY CHOOSE US"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Main Title</label>
            <Input
              value={benefitsTitle}
              onChange={(e) => setBenefitsTitle(e.target.value)}
              placeholder="Benefits of online tutoring services with us"
            />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm font-medium text-gray-700 mb-4">Benefit Cards</p>
            {benefitsItems.map((item, index) => (
              <div
                key={index}
                className="mb-6 p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-4"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Title</label>
                      <Input
                        value={item.title}
                        onChange={(e) => handleBenefitChange(index, 'title', e.target.value)}
                        placeholder="One-on-one Teaching"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Background Color (hex)</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={item.background_color || '#E53935'}
                          onChange={(e) => handleBenefitChange(index, 'background_color', e.target.value)}
                          className="w-10 h-10 rounded border border-gray-300 cursor-pointer p-0"
                        />
                        <Input
                          value={item.background_color || ''}
                          onChange={(e) => handleBenefitChange(index, 'background_color', e.target.value)}
                          placeholder="#E53935"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveBenefit(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    title="Remove"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Description</label>
                  <textarea
                    value={item.description}
                    onChange={(e) => handleBenefitChange(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="All of our special education experts have a degree in special education"
                  />
                </div>
                <div className="flex items-center gap-4">
                  {item.icon_url && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-gray-200">
                      <img
                        src={siteSettingsService.getHeroIconUrl(item.icon_url)}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      id={`benefit-icon-${index}`}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      disabled={uploadingBenefitIcon === index}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(f.type)) {
                            toast.error('Invalid file type.');
                            return;
                          }
                          handleBenefitIconUpload(index, f);
                          e.target.value = '';
                        }
                      }}
                    />
                    <label
                      htmlFor={`benefit-icon-${index}`}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm font-medium text-gray-700"
                    >
                      <FiUpload className="w-4 h-4" />
                      {uploadingBenefitIcon === index ? 'Uploading...' : 'Upload Icon'}
                    </label>
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddBenefit}
              className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50"
            >
              <FiPlus className="w-4 h-4" />
              Add Benefit Card
            </Button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Button
            onClick={handleSaveBenefits}
            disabled={savingBenefits}
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-700 text-white"
          >
            <FiSave className="w-4 h-4" />
            {savingBenefits ? 'Saving...' : 'Save Benefits Section'}
          </Button>
        </div>
      </Card>

      {/* Subjects Section */}
      <Card>
        <h2 className="text-xl font-semibold text-[#1F1F1F] mb-6">Subjects Section – Full Customization</h2>
        <p className="text-gray-600 mb-6">
          Customize the subjects/course categories grid (3x3 layout). Each card has a white circle icon on the left, title, subtitle, and background color.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pre-header (uppercase label)</label>
            <Input
              value={subjectsHeader}
              onChange={(e) => setSubjectsHeader(e.target.value)}
              placeholder="WHY CHOOSE US"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Main Title</label>
            <Input
              value={subjectsTitle}
              onChange={(e) => setSubjectsTitle(e.target.value)}
              placeholder="Benefits of online tutoring services with us"
            />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm font-medium text-gray-700 mb-4">Subject Cards</p>
            {subjectsItems.map((item, index) => (
              <div
                key={index}
                className="mb-6 p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-4"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Title</label>
                      <Input
                        value={item.title}
                        onChange={(e) => handleSubjectChange(index, 'title', e.target.value)}
                        placeholder="Computer Science"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Background Color (hex)</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={item.background_color || '#E53935'}
                          onChange={(e) => handleSubjectChange(index, 'background_color', e.target.value)}
                          className="w-10 h-10 rounded border border-gray-300 cursor-pointer p-0"
                        />
                        <Input
                          value={item.background_color || ''}
                          onChange={(e) => handleSubjectChange(index, 'background_color', e.target.value)}
                          placeholder="#FF3B30"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    title="Remove"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Subtitle</label>
                  <Input
                    value={item.subtitle}
                    onChange={(e) => handleSubjectChange(index, 'subtitle', e.target.value)}
                    placeholder="Dive into our dynamic Community Hub"
                  />
                </div>
                <div className="flex items-center gap-4">
                  {item.icon_url && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-gray-200">
                      <img
                        src={siteSettingsService.getHeroIconUrl(item.icon_url)}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      id={`subject-icon-${index}`}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      disabled={uploadingSubjectIcon === index}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(f.type)) {
                            toast.error('Invalid file type.');
                            return;
                          }
                          handleSubjectIconUpload(index, f);
                          e.target.value = '';
                        }
                      }}
                    />
                    <label
                      htmlFor={`subject-icon-${index}`}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm font-medium text-gray-700"
                    >
                      <FiUpload className="w-4 h-4" />
                      {uploadingSubjectIcon === index ? 'Uploading...' : 'Upload Icon'}
                    </label>
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddSubject}
              className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50"
            >
              <FiPlus className="w-4 h-4" />
              Add Subject Card
            </Button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Button
            onClick={handleSaveSubjects}
            disabled={savingSubjects}
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-700 text-white"
          >
            <FiSave className="w-4 h-4" />
            {savingSubjects ? 'Saving...' : 'Save Subjects Section'}
          </Button>
        </div>
      </Card>

      {/* Testimonials Section */}
      <Card>
        <h2 className="text-xl font-semibold text-[#1F1F1F] mb-6">Testimonials Section – Full Customization</h2>
        <p className="text-gray-600 mb-6">
          Customize the testimonials carousel. Each testimonial has text, author name, title/location, and avatar image.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pre-header (uppercase label)</label>
            <Input
              value={testimonialsHeader}
              onChange={(e) => setTestimonialsHeader(e.target.value)}
              placeholder="OUR TESTIMONIALS"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Main Title</label>
            <Input
              value={testimonialsTitle}
              onChange={(e) => setTestimonialsTitle(e.target.value)}
              placeholder="What Our Student Say About US"
            />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm font-medium text-gray-700 mb-4">Testimonials</p>
            {testimonialsItems.map((item, index) => (
              <div
                key={index}
                className="mb-6 p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-4"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Testimonial Text</label>
                      <textarea
                        value={item.testimonial_text}
                        onChange={(e) => handleTestimonialChange(index, 'testimonial_text', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Lost in the mesmerizing allure of Bali's rice terraces! I am rave about the enchanting beauty..."
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Author Name</label>
                        <Input
                          value={item.author_name}
                          onChange={(e) => handleTestimonialChange(index, 'author_name', e.target.value)}
                          placeholder="Haliza Asyifa"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Author Title / Location</label>
                        <Input
                          value={item.author_title}
                          onChange={(e) => handleTestimonialChange(index, 'author_title', e.target.value)}
                          placeholder="Designer - Bali"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTestimonial(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    title="Remove"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  {item.author_avatar_url && (
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-white border border-gray-200">
                      <img
                        src={siteSettingsService.getHeroIconUrl(item.author_avatar_url)}
                        alt={item.author_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      id={`testimonial-avatar-${index}`}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      disabled={uploadingTestimonialAvatar === index}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(f.type)) {
                            toast.error('Invalid file type.');
                            return;
                          }
                          handleTestimonialAvatarUpload(index, f);
                          e.target.value = '';
                        }
                      }}
                    />
                    <label
                      htmlFor={`testimonial-avatar-${index}`}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm font-medium text-gray-700"
                    >
                      <FiUpload className="w-4 h-4" />
                      {uploadingTestimonialAvatar === index ? 'Uploading...' : 'Upload Avatar'}
                    </label>
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddTestimonial}
              className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50"
            >
              <FiPlus className="w-4 h-4" />
              Add Testimonial
            </Button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Button
            onClick={handleSaveTestimonials}
            disabled={savingTestimonials}
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-700 text-white"
          >
            <FiSave className="w-4 h-4" />
            {savingTestimonials ? 'Saving...' : 'Save Testimonials Section'}
          </Button>
        </div>
      </Card>

      {/* Footer */}
      <Card>
        <h2 className="text-xl font-semibold text-[#1F1F1F] mb-6">Footer – Full Customization</h2>
        <p className="text-gray-600 mb-6">
          Customize the site footer: brand name, contact button, social links, legal links, and copyright text.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name</label>
            <Input
              value={footerBrandName}
              onChange={(e) => setFooterBrandName(e.target.value)}
              placeholder="Bvonix Academy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Label</label>
            <Input
              value={footerContactLabel}
              onChange={(e) => setFooterContactLabel(e.target.value)}
              placeholder="Contact Bvonix Academy"
            />
          </div>
          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm font-medium text-gray-700 mb-4">Contact Dropdown Options</p>
            <p className="text-xs text-gray-500 mb-3">Add WhatsApp, Email, or Phone. Each option with a value will appear in the footer contact dropdown.</p>
            {footerContacts.map((item, i) => (
              <div key={i} className="flex gap-4 mb-3">
                <select
                  value={item.type}
                  onChange={(e) => handleFooterContactChange(i, 'type', e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                </select>
                <Input
                  value={item.value}
                  onChange={(e) => handleFooterContactChange(i, 'value', e.target.value)}
                  placeholder={item.type === 'whatsapp' ? '+1234567890' : item.type === 'email' ? 'email@example.com' : '+1234567890'}
                  className="flex-1"
                />
                <button type="button" onClick={() => handleRemoveFooterContact(i)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={handleAddFooterContact} className="mt-2 border border-gray-300 hover:bg-gray-50">
              <FiPlus className="w-4 h-4 inline mr-1" /> Add Contact Option
            </Button>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm font-medium text-gray-700 mb-4">Social Links</p>
            {footerSocialLinks.map((item, i) => (
              <div key={i} className="flex gap-4 mb-3">
                <select
                  value={item.platform}
                  onChange={(e) => handleFooterSocialChange(i, 'platform', e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="facebook">Facebook</option>
                  <option value="twitter">Twitter</option>
                  <option value="email">Email</option>
                  <option value="youtube">YouTube</option>
                  <option value="instagram">Instagram</option>
                </select>
                <Input
                  value={item.url}
                  onChange={(e) => handleFooterSocialChange(i, 'url', e.target.value)}
                  placeholder="https://..."
                  className="flex-1"
                />
                <button type="button" onClick={() => handleRemoveFooterSocial(i)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={handleAddFooterSocial} className="mt-2 border border-gray-300 hover:bg-gray-50">
              <FiPlus className="w-4 h-4 inline mr-1" /> Add Social Link
            </Button>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm font-medium text-gray-700 mb-4">Legal / Navigation Links</p>
            {footerLegalLinks.map((item, i) => (
              <div key={i} className="flex gap-4 mb-3">
                <Input
                  value={item.label}
                  onChange={(e) => handleFooterLegalChange(i, 'label', e.target.value)}
                  placeholder="Label"
                  className="w-40"
                />
                <Input
                  value={item.url}
                  onChange={(e) => handleFooterLegalChange(i, 'url', e.target.value)}
                  placeholder="/privacy-policy or https://..."
                  className="flex-1"
                />
                <button type="button" onClick={() => handleRemoveFooterLegal(i)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={handleAddFooterLegal} className="mt-2 border border-gray-300 hover:bg-gray-50">
              <FiPlus className="w-4 h-4 inline mr-1" /> Add Link
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Copyright / Bottom Text</label>
            <textarea
              value={footerCopyrightText}
              onChange={(e) => setFooterCopyrightText(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="© 2025 Bvonix Academy. All rights reserved."
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Button
            onClick={handleSaveFooter}
            disabled={savingFooter}
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-700 text-white"
          >
            <FiSave className="w-4 h-4" />
            {savingFooter ? 'Saving...' : 'Save Footer'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminSiteSettings;
