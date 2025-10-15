import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '../../constants';

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 15000, // Increased timeout
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AnimeExplorer/1.0.0', // Add user agent
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      config => {
        console.log('API Request:', config.method?.toUpperCase(), config.url);
        return config;
      },
      error => {
        console.error('Request error:', error);
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log('API Response:', response.status, response.config.url);
        return response;
      },
      async error => {
        console.error('API Error:', error.response?.status, error.message);

        // Handle rate limiting (429)
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'] || '2';
          const delayMs = parseInt(retryAfter) * 1000 || 2000;

          console.log(`Rate limited. Retrying in ${delayMs}ms...`);

          // Wait before retrying
          await new Promise<void>(resolve => setTimeout(resolve, delayMs));

          // Retry the request
          const config = error.config;
          if (config) {
            return this.client.request(config);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete(url, config);
    return response.data;
  }

  // Direct access to axios instance for advanced usage
  get instance(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
