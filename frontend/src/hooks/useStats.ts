import { useState } from 'react';
import axios from 'axios';
import { StatsResponse, WordFrequencyResponse, InsightResponse, UploadResponse, EmojiStatsResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || '';

// Helper to get/set cache key from sessionStorage for persistence across component remounts
const getCacheKey = (): string | null => sessionStorage.getItem('chatCacheKey');
const setCacheKeyStorage = (key: string) => sessionStorage.setItem('chatCacheKey', key);

// Helper to get/set language from sessionStorage
export const getLanguage = (): string | null => sessionStorage.getItem('chatLanguage');
const setLanguageStorage = (lang: string) => sessionStorage.setItem('chatLanguage', lang);

export function useStats() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File, language?: string): Promise<UploadResponse> => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Build URL with language param if provided
      let url = `${API_BASE}/api/upload`;
      if (language) {
        url += `?language=${encodeURIComponent(language)}`;
      }
      
      const response = await axios.post<UploadResponse>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Store cache key and language in sessionStorage for persistence
      setCacheKeyStorage(response.data.cache_key);
      setLanguageStorage(response.data.language);
      return response.data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStats = async (params: {
    authors?: string[];
    startDate?: string;
    endDate?: string;
    timeGroup?: string;
    groupByAuthor?: boolean;
  }): Promise<StatsResponse> => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = getCacheKey();
      const queryParams = new URLSearchParams();
      if (cacheKey) queryParams.append('key', cacheKey);
      if (params.authors && params.authors.length > 0) {
        queryParams.append('authors', params.authors.join(','));
      }
      if (params.startDate) queryParams.append('start_date', params.startDate);
      if (params.endDate) queryParams.append('end_date', params.endDate);
      if (params.timeGroup) queryParams.append('time_group', params.timeGroup);
      if (params.groupByAuthor) queryParams.append('group_by_author', 'true');
      
      const response = await axios.get<StatsResponse>(`${API_BASE}/api/stats?${queryParams.toString()}`);
      return response.data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stats';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getWordFrequency = async (params: {
    authors?: string[];
    startDate?: string;
    endDate?: string;
    limit?: number;
    minLength?: number;
  }): Promise<WordFrequencyResponse> => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = getCacheKey();
      const queryParams = new URLSearchParams();
      if (cacheKey) queryParams.append('key', cacheKey);
      if (params.authors && params.authors.length > 0) {
        queryParams.append('authors', params.authors.join(','));
      }
      if (params.startDate) queryParams.append('start_date', params.startDate);
      if (params.endDate) queryParams.append('end_date', params.endDate);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.minLength) queryParams.append('min_length', params.minLength.toString());
      
      const response = await axios.get<WordFrequencyResponse>(`${API_BASE}/api/word-frequency?${queryParams.toString()}`);
      return response.data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch word frequency';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getInsights = async (): Promise<InsightResponse> => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = getCacheKey();
      const queryParams = new URLSearchParams();
      if (cacheKey) queryParams.append('key', cacheKey);
      
      const response = await axios.get<InsightResponse>(`${API_BASE}/api/insights?${queryParams.toString()}`);
      return response.data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch insights';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getAuthors = async (): Promise<string[]> => {
    try {
      const cacheKey = getCacheKey();
      const queryParams = new URLSearchParams();
      if (cacheKey) queryParams.append('key', cacheKey);
      
      const response = await axios.get<{ authors: string[] }>(`${API_BASE}/api/authors?${queryParams.toString()}`);
      return response.data.authors;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch authors';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getEmojiStats = async (params: {
    authors?: string[];
    startDate?: string;
    endDate?: string;
  }): Promise<EmojiStatsResponse> => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = getCacheKey();
      const queryParams = new URLSearchParams();
      if (cacheKey) queryParams.append('key', cacheKey);
      if (params.authors && params.authors.length > 0) {
        queryParams.append('authors', params.authors.join(','));
      }
      if (params.startDate) queryParams.append('start_date', params.startDate);
      if (params.endDate) queryParams.append('end_date', params.endDate);
      
      const response = await axios.get<EmojiStatsResponse>(`${API_BASE}/api/emoji-stats?${queryParams.toString()}`);
      return response.data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch emoji stats';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    uploadFile,
    getStats,
    getWordFrequency,
    getInsights,
    getAuthors,
    getEmojiStats,
  };
}


