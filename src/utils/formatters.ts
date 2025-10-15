/**
 * Format date to readable string
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return 'Invalid date';
  }

  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format anime score with one decimal place
 */
export const formatScore = (score: number | null | undefined): string => {
  if (score == null) return 'N/A';
  return score.toFixed(1);
};

/**
 * Format episode count
 */
export const formatEpisodes = (episodes: number | null | undefined): string => {
  if (episodes == null) return 'Unknown';
  return episodes.toString();
};

/**
 * Format duration string
 */
export const formatDuration = (duration: string | null | undefined): string => {
  if (!duration) return 'Unknown';
  return duration;
};

/**
 * Format anime status
 */
export const formatStatus = (status: string | null | undefined): string => {
  if (!status) return 'Unknown';

  const statusMap: Record<string, string> = {
    'Currently Airing': 'Airing',
    'Finished Airing': 'Finished',
    'Not yet aired': 'Upcoming',
  };

  return statusMap[status] || status;
};

/**
 * Format anime type
 */
export const formatType = (type: string | null | undefined): string => {
  if (!type) return 'Unknown';
  return type;
};

/**
 * Format number with commas
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Capitalize first letter
 */
export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Format file size in bytes to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};