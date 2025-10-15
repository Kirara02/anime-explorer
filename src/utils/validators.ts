/**
 * Email validation
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Password validation (minimum 6 characters)
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

/**
 * Name validation (not empty and reasonable length)
 */
export const isValidName = (name: string): boolean => {
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 50;
};

/**
 * URL validation
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Anime score validation (0-10)
 */
export const isValidScore = (score: number): boolean => {
  return score >= 0 && score <= 10;
};

/**
 * Check if string is empty or only whitespace
 */
export const isEmpty = (str: string): boolean => {
  return !str || str.trim().length === 0;
};

/**
 * Validate anime search query
 */
export const isValidSearchQuery = (query: string): boolean => {
  const trimmed = query.trim();
  return trimmed.length >= 1 && trimmed.length <= 100;
};

/**
 * Validate anime ID (positive number)
 */
export const isValidAnimeId = (id: number): boolean => {
  return Number.isInteger(id) && id > 0;
};