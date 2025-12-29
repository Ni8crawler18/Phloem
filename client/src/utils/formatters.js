/**
 * Format date to locale string
 */
export const formatDate = (dateStr, options = {}) => {
  if (!dateStr) return '-';

  const defaultOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };

  return new Date(dateStr).toLocaleDateString('en-IN', defaultOptions);
};

/**
 * Format date to short format (no time)
 */
export const formatDateShort = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Parse JSON string safely
 */
export const parseJSON = (str, fallback = []) => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

/**
 * Truncate string with ellipsis
 */
export const truncate = (str, length = 50) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};

/**
 * Format action for display
 */
export const formatAction = (action) => {
  if (!action) return '';
  return action.replace(/_/g, ' ');
};
