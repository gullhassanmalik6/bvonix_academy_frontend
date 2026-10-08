import api, { getFileUrl } from './api';

const BRAND_DEFAULTS = {
  site_logo_url: '/logo.png',
  site_logo_display_height: 40,
  site_logo_type: 'image',
  site_logo_text: 'Bvonix\nAcademy',
};

const HERO_DEFAULTS = {
  hero_headline: 'Learn Skills.\nBuild Projects.\nStart Earning.',
  hero_description: 'Practical, Industry-Ready & Earning-Focused Tech Education',
  hero_cta_text: 'Enroll Now',
  hero_cta_link: '/register',
  hero_cta_subtext: 'From Learning to Earning — The Right Way.',
  hero_social_text: 'Admissions Open • Starting 1st Jan 2026',
  hero_icon_url: null,
  hero_image_alt: 'Students learning at Bvonix Academy',
};

const COMMUNITY_DEFAULTS = {
  community_header: 'INTERNSHIP & JOB PROGRAM',
  community_title: 'Industry-Ready Courses for Modern Careers',
  community_description: "We don't just teach — we train students to earn. Bvonix Academy provides practical, earning-oriented education focused on real-world skills, real client projects, and real income opportunities.",
  community_stat1_value: 'Internship',
  community_stat1_label: 'During the Course',
  community_stat2_value: 'Real',
  community_stat2_label: 'Software House Projects',
  community_stat3_value: 'Job',
  community_stat3_label: 'Offers for Skilled Students',
  community_image_url: null,
  community_image_alt: 'Students in a modern tech classroom',
};

const MILESTONES_DEFAULTS = {
  milestones_items: [
    { value: '80%', label: 'Practical Learning' },
    { value: '20%', label: 'Theory' },
    { value: '50%', label: 'Scholarship' },
    { value: '3,000', label: 'PKR / Month Fee' },
    { value: 'Jan 2026', label: 'Batch Start Date' },
  ],
};

const BENEFITS_DEFAULTS = {
  benefits_header: 'KEY HIGHLIGHTS',
  benefits_title: 'Why Bvonix Academy Stands Out',
  benefits_items: [
    { title: '80% Practical Learning', description: 'Learn by doing with hands-on exercises, labs, and real-world assignments.', icon_url: null, background_color: '#1a2b4e' },
    { title: 'Real-World Projects', description: 'Work on actual client projects from our software house during training.', icon_url: null, background_color: '#2563EB' },
    { title: 'Job After Course', description: 'Career placement support and job offers for skilled, consistent students.', icon_url: null, background_color: '#7C3AED' },
    { title: 'Internship During Course', description: 'Paid and unpaid internships based on your skill level and progress.', icon_url: null, background_color: '#0891B2' },
    { title: 'Freelancing & Job Guidance', description: 'Upwork, Fiverr, and remote work mentorship to start earning early.', icon_url: null, background_color: '#EA580C' },
    { title: 'Multiple Earning Opportunities', description: 'SaaS products, app monetization, freelancing, and remote career paths.', icon_url: null, background_color: '#059669' },
  ],
};

const TESTIMONIALS_DEFAULTS = {
  testimonials_header: 'OUR TESTIMONIALS',
  testimonials_title: 'What Our Students Say About Us',
  testimonials_items: [
    { testimonial_text: 'Bvonix Academy transformed my learning journey. The practical approach and real client projects helped me start earning while still in the course.', author_name: 'Student', author_title: 'Web Development', author_avatar_url: null },
    { testimonial_text: 'Best decision I ever made. Hands-on projects, internship during the course, and freelancing guidance made learning practical and rewarding.', author_name: 'Student', author_title: 'Full Stack Development', author_avatar_url: null },
    { testimonial_text: "We don't just learn theory — we build real projects. The mentors guide you from learning to earning the right way.", author_name: 'Student', author_title: 'AI Development', author_avatar_url: null },
    { testimonial_text: 'Outstanding curriculum with industry-ready skills. The internship program gave me confidence to apply for jobs and freelancing gigs.', author_name: 'Student', author_title: 'Android Development', author_avatar_url: null },
  ],
};

const DASHBOARD_DEFAULTS = {
  dashboard_banner_title: 'Sharpen Your Skills With Professional Online Courses',
  dashboard_banner_cta_text: 'Join Now',
  dashboard_banner_cta_link: '/courses',
  dashboard_youtube_url: '',
  dashboard_greeting_prefix: 'Good Morning',
  dashboard_motivational_text: 'Continue Your Journey And Achieve Your Target',
  dashboard_search_placeholder: 'Search your course here...',
  dashboard_friends_items: [],
};

/**
 * Parse YouTube URL to get embed URL for video or playlist
 * Supports: youtu.be/xxx, watch?v=, embed/, playlist?list=
 */
export function parseYoutubeEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    // Playlist: must have list= and prefer playlist over video
    const playlistMatch = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    if (playlistMatch) {
      return `https://www.youtube.com/embed/videoseries?list=${playlistMatch[1]}`;
    }
    // Video: youtu.be/VIDEO_ID (handle first - common sharing format)
    const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{10,})/);
    if (shortMatch) {
      return `https://www.youtube.com/embed/${shortMatch[1]}`;
    }
    // Video: youtube.com/watch?v=xxx or youtube.com/embed/xxx
    const videoMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/)([a-zA-Z0-9_-]{10,})/);
    if (videoMatch) {
      return `https://www.youtube.com/embed/${videoMatch[1]}`;
    }
    return null;
  } catch {
    return null;
  }
}

const FOOTER_DEFAULTS = {
  footer_brand_name: 'Bvonix Academy',
  footer_contact_label: 'Contact Bvonix Academy',
  footer_contact_type: 'phone',
  footer_contact_value: '0308-1166897',
  footer_address: 'Sonara Bazar, Near Gurdwara Sahib, Daharki',
  footer_contacts: [
    { type: 'phone', value: '0308-1166897' },
    { type: 'phone', value: '0309-5061251' },
    { type: 'whatsapp', value: '923081166897' },
  ],
  footer_social_links: [
    { platform: 'whatsapp', url: 'https://wa.me/923081166897' },
    { platform: 'facebook', url: '' },
    { platform: 'twitter', url: '' },
    { platform: 'email', url: '' },
    { platform: 'youtube', url: '' },
    { platform: 'instagram', url: '' },
  ],
  footer_legal_links: [
    { label: 'Cookie Policy', url: '/cookie-policy' },
    { label: 'Privacy Policy', url: '/privacy-policy' },
    { label: 'Terms and Conditions', url: '/terms' },
    { label: 'Contact Us', url: '/contact' },
    { label: 'About', url: '/about' },
  ],
  footer_copyright_text: '© 2025 Bvonix Academy. All rights reserved.',
};

const SUBJECTS_DEFAULTS = {
  subjects_header: 'COURSES WE OFFER',
  subjects_title: 'Industry-Ready Programs for Modern Careers',
  subjects_items: [
    { title: 'Python Development', subtitle: 'Fundamentals, Backend Frameworks, APIs & Database Integration', icon_url: null, background_color: '#3776AB' },
    { title: 'Web Development', subtitle: 'HTML, CSS, JavaScript, Frontend, Backend & Deployment', icon_url: null, background_color: '#E44D26' },
    { title: 'Full Stack Development', subtitle: 'End-to-end web applications from frontend to backend', icon_url: null, background_color: '#6366F1' },
    { title: 'Android App Development', subtitle: 'App development, Play Store publishing & monetization', icon_url: null, background_color: '#3DDC84' },
    { title: 'AI Development', subtitle: 'AI applications, chatbots & intelligent integrations', icon_url: null, background_color: '#8B5CF6' },
    { title: 'AI Chatbot & Agent Dev', subtitle: 'Build AI agents and automation workflows with modern tools', icon_url: null, background_color: '#A855F7' },
    { title: 'Automation & Workflow', subtitle: 'n8n and workflow automation for business processes', icon_url: null, background_color: '#0EA5E9' },
    { title: 'Digital Marketing', subtitle: 'Grow brands online with modern marketing strategies', icon_url: null, background_color: '#F97316' },
    { title: 'Freelancing Course', subtitle: 'Upwork, Fiverr & remote client acquisition skills', icon_url: null, background_color: '#14B8A6' },
    { title: 'Remote Work Mastery', subtitle: 'Build a sustainable remote career and income stream', icon_url: null, background_color: '#64748B' },
    { title: 'SaaS & App Monetization', subtitle: 'Product development, ads & in-app purchase strategies', icon_url: null, background_color: '#EC4899' },
    { title: 'AI & Automation Programs', subtitle: 'AI tools, integrations & agent development with n8n', icon_url: null, background_color: '#4F46E5' },
  ],
};

export const siteSettingsService = {
  BRAND_DEFAULTS,
  HERO_DEFAULTS,
  COMMUNITY_DEFAULTS,
  MILESTONES_DEFAULTS,
  BENEFITS_DEFAULTS,
  SUBJECTS_DEFAULTS,
  TESTIMONIALS_DEFAULTS,
  DASHBOARD_DEFAULTS,
  FOOTER_DEFAULTS,

  /**
   * Get site settings (public, no auth required)
   */
  async getSiteSettings() {
    const response = await api.get('/site-settings');
    return { ...BRAND_DEFAULTS, ...HERO_DEFAULTS, ...COMMUNITY_DEFAULTS, ...MILESTONES_DEFAULTS, ...BENEFITS_DEFAULTS, ...SUBJECTS_DEFAULTS, ...TESTIMONIALS_DEFAULTS, ...DASHBOARD_DEFAULTS, ...FOOTER_DEFAULTS, ...response.data };
  },

  /**
   * Update student dashboard section (admin only)
   */
  async updateDashboardSettings(dashboardData) {
    const response = await api.patch('/site-settings/dashboard', dashboardData);
    return response.data;
  },

  /**
   * Update hero section text, links, etc. (admin only)
   */
  async updateHeroSettings(heroData) {
    const response = await api.patch('/site-settings/hero', heroData);
    return response.data;
  },

  /**
   * Update community section (admin only)
   */
  async updateCommunitySettings(communityData) {
    const response = await api.patch('/site-settings/community', communityData);
    return response.data;
  },

  /**
   * Update milestones section (admin only)
   */
  async updateMilestonesSettings(milestonesData) {
    const response = await api.patch('/site-settings/milestones', milestonesData);
    return response.data;
  },

  /**
   * Update benefits section (admin only)
   */
  async updateBenefitsSettings(benefitsData) {
    const response = await api.patch('/site-settings/benefits', benefitsData);
    return response.data;
  },

  /**
   * Upload benefit card icon (admin only). index = card position (0-based).
   */
  async uploadBenefitIcon(file, index = 0) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/site-settings/benefit-icon?index=${index}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Update subjects section (admin only)
   */
  async updateSubjectsSettings(subjectsData) {
    const response = await api.patch('/site-settings/subjects', subjectsData);
    return response.data;
  },

  /**
   * Upload subject card icon (admin only). index = card position (0-based).
   */
  async uploadSubjectIcon(file, index = 0) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/site-settings/subject-icon?index=${index}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Update testimonials section (admin only)
   */
  async updateTestimonialsSettings(testimonialsData) {
    const response = await api.patch('/site-settings/testimonials', testimonialsData);
    return response.data;
  },

  /**
   * Update footer (admin only)
   */
  async updateFooterSettings(footerData) {
    const response = await api.patch('/site-settings/footer', footerData);
    return response.data;
  },

  /**
   * Upload testimonial avatar (admin only). index = testimonial position (0-based).
   */
  async uploadTestimonialAvatar(file, index = 0) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/site-settings/testimonial-avatar?index=${index}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Upload community section image (admin only)
   */
  async uploadCommunityImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/site-settings/community-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Update brand / logo display settings (admin only)
   */
  async updateBrandSettings(brandData) {
    const response = await api.patch('/site-settings/brand', brandData);
    return response.data;
  },

  /**
   * Upload site logo (admin only)
   */
  async uploadLogo(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/site-settings/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Upload hero section icon (admin only)
   */
  async uploadHeroIcon(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/site-settings/hero-icon', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get full URL for hero icon
   */
  getHeroIconUrl(relativeUrl) {
    if (!relativeUrl) return null;
    return getFileUrl(relativeUrl);
  },

  /**
   * Get full URL for site logo (supports frontend static and backend uploads)
   */
  getLogoUrl(relativeUrl) {
    if (!relativeUrl) return '/logo.png';
    if (relativeUrl.startsWith('http')) return relativeUrl;
    if (relativeUrl.startsWith('/uploads/')) return getFileUrl(relativeUrl);
    return relativeUrl;
  },
};
