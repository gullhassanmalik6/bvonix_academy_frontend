import React from 'react';
import { FiPlay } from 'react-icons/fi';
import { parseYoutubeEmbedUrl } from '../../services/siteSettingsService';

/**
 * YouTube video section - displays in course content area below header,
 * in a card style matching the Continue Watching course cards (second screenshot).
 */
const DashboardYouTubeSection = ({ youtubeUrl, title = 'Featured Course Video' }) => {
  const embedUrl = parseYoutubeEmbedUrl(youtubeUrl);

  if (!embedUrl) return null;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Video</h3>
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative aspect-video bg-black">
            <iframe
              src={embedUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
          <div className="p-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <FiPlay className="w-4 h-4 text-primary-500" />
            </div>
            <span className="text-sm font-medium text-gray-900 truncate">{title}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardYouTubeSection;
