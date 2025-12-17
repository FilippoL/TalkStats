import { useState } from 'react';
import axios from 'axios';
import { StatsResponse, WordFrequencyResponse, InsightResponse, UploadResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export function useStats() {
  const [cacheKey, setCacheKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<UploadResponse> => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post<UploadResponse>(`${API_BASE}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setCacheKey(response.data.cache_key);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to upload file';
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
    sentiment?: string;
    groupByAuthor?: boolean;
    groupBySentiment?: boolean;
  }): Promise<StatsResponse> => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (cacheKey) queryParams.append('key', cacheKey);
      if (params.authors && params.authors.length > 0) {
        queryParams.append('authors', params.authors.join(','));
      }
      if (params.startDate) queryParams.append('start_date', params.startDate);
      if (params.endDate) queryParams.append('end_date', params.endDate);
      if (params.timeGroup) queryParams.append('time_group', params.timeGroup);
      if (params.sentiment) queryParams.append('sentiment', params.sentiment);
      if (params.groupByAuthor) queryParams.append('group_by_author', 'true');
      if (params.groupBySentiment) queryParams.append('group_by_sentiment', 'true');
      
      const response = await axios.get<StatsResponse>(`${API_BASE}/api/stats?${queryParams.toString()}`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch stats';
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
    sentiment?: string;
    limit?: number;
    minLength?: number;
  }): Promise<WordFrequencyResponse> => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (cacheKey) queryParams.append('key', cacheKey);
      if (params.authors && params.authors.length > 0) {
        queryParams.append('authors', params.authors.join(','));
      }
      if (params.startDate) queryParams.append('start_date', params.startDate);
      if (params.endDate) queryParams.append('end_date', params.endDate);
      if (params.sentiment) queryParams.append('sentiment', params.sentiment);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.minLength) queryParams.append('min_length', params.minLength.toString());
      
      const response = await axios.get<WordFrequencyResponse>(`${API_BASE}/api/word-frequency?${queryParams.toString()}`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch word frequency';
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
      const queryParams = new URLSearchParams();
      if (cacheKey) queryParams.append('key', cacheKey);
      
      const response = await axios.get<InsightResponse>(`${API_BASE}/api/insights?${queryParams.toString()}`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch insights';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getAuthors = async (): Promise<string[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (cacheKey) queryParams.append('key', cacheKey);
      
      const response = await axios.get<{ authors: string[] }>(`${API_BASE}/api/authors?${queryParams.toString()}`);
      return response.data.authors;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch authors';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    cacheKey,
    loading,
    error,
    uploadFile,
    getStats,
    getWordFrequency,
    getInsights,
    getAuthors,
  };
}


