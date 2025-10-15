/**
 * Generic API Response interface
 */
export interface ApiResponse<T> {
  data: T;
  pagination?: {
    current_page: number;
    has_next_page: boolean;
    items: {
      count: number;
      total: number;
      per_page: number;
    };
  };
}

/**
 * API Error interface
 */
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * Generic API Result type
 */
export type ApiResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: ApiError;
};

/**
 * Loading state interface
 */
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Search parameters
 */
export interface SearchParams {
  q: string;
  page?: number;
  limit?: number;
}

/**
 * Sort options
 */
export type SortOrder = 'asc' | 'desc';

export interface SortParams {
  sort_by?: string;
  sort_order?: SortOrder;
}

/**
 * Filter parameters
 */
export interface FilterParams {
  type?: string;
  status?: string;
  genre?: string;
  score?: number;
  year?: number;
}