// services/jikan_moe_service.ts
import { BaseResponse, Anime, RecommendationsResponse } from '../types/jikan';
import { apiClient } from './api/base';
import { ApiResponse } from '../types/api';

// Fungsi untuk menambah delay
const delay = (ms: number) =>
  new Promise<void>(resolve => setTimeout(() => resolve(), ms));

// Cache untuk menyimpan response
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 10 * 60 * 1000; // 10 menit (lebih lama untuk mengurangi API calls)

// Fungsi untuk mengambil data dengan cache
async function fetchWithCache<T>(url: string): Promise<T> {
  const now = Date.now();
  const cached = cache[url];

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await apiClient.get<T>(url);
    cache[url] = {
      data: response,
      timestamp: now,
    };
    return response;
  } catch (error: any) {
    // Rate limiting sudah ditangani di apiClient interceptor
    // Jadi kita tidak perlu handle lagi di sini
    throw error;
  }
}

export const getSeasonNow = async (page: number = 1): Promise<BaseResponse<Anime>> => {
  return fetchWithCache(`/seasons/now?page=${page}`);
};

export const getTopAnime = async (page: number = 1): Promise<BaseResponse<Anime>> => {
  return fetchWithCache(`/top/anime?page=${page}`);
};

export const getUpcomingAnime = async (page: number = 1): Promise<BaseResponse<Anime>> => {
  return fetchWithCache(`/seasons/upcoming?page=${page}`);
};

export const getRecommendations =
  async (): Promise<RecommendationsResponse> => {
    return fetchWithCache('/recommendations/anime');
  };

export const searchAnime = async (
  query: string,
  page: number = 1,
): Promise<BaseResponse<Anime>> => {
  // Search tidak menggunakan cache karena query bisa berubah-ubah
  return await apiClient.get(`/anime?q=${encodeURIComponent(query)}&page=${page}`);
};

export const getAnimeDetail = async (id: number): Promise<{ data: Anime }> => {
  return fetchWithCache(`/anime/${id}`);
};
