// services/jikan_moe_service.ts
import axios from 'axios';
import { BaseResponse, Anime, RecommendationsResponse } from '../types/jikan';

const API_BASE = 'https://api.jikan.moe/v4';

// Fungsi untuk menambah delay
const delay = (ms: number) =>
  new Promise<void>(resolve => setTimeout(() => resolve(), ms));

// Axios instance dengan retry logic
const api = axios.create({
  baseURL: API_BASE,
});

// Cache untuk menyimpan response
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 menit

// Fungsi untuk mengambil data dengan cache
async function fetchWithCache<T>(url: string): Promise<T> {
  const now = Date.now();
  const cached = cache[url];

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await api.get<T>(url);
    cache[url] = {
      data: response.data,
      timestamp: now,
    };
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 429) {
      // Jika rate limited, tunggu 1 detik dan coba lagi
      await delay(1000);
      return fetchWithCache<T>(url);
    }
    throw error;
  }
}

export const getSeasonNow = async (): Promise<BaseResponse<Anime>> => {
  return fetchWithCache('/seasons/now');
};

export const getTopAnime = async (): Promise<BaseResponse<Anime>> => {
  return fetchWithCache('/top/anime');
};

export const getUpcomingAnime = async (): Promise<BaseResponse<Anime>> => {
  return fetchWithCache('/seasons/upcoming');
};

export const getRecommendations =
  async (): Promise<RecommendationsResponse> => {
    return fetchWithCache('/recommendations/anime');
  };

export const searchAnime = async (
  query: string,
): Promise<BaseResponse<Anime>> => {
  // Search tidak menggunakan cache karena query bisa berubah-ubah
  return (await api.get(`/anime?q=${encodeURIComponent(query)}`)).data;
};

export const getAnimeDetail = async (id: number): Promise<{ data: Anime }> => {
  return fetchWithCache(`/anime/${id}`);
};
