/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiClientError extends Error {
  public status: number;
  public data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('nexvyra_token');
  }
  return null;
};

export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nexvyra_token', token);
  }
};

export const clearAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('nexvyra_token');
  }
};

const handleResponse = async (response: Response) => {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    if (response.status === 401) {
      // 401 handling is primarily managed by the AuthProvider, 
      // but we throw so the caller knows it failed.
      clearAuthToken();
      // Dispatch a custom event so the UI can redirect if needed globally, 
      // or just let AuthProvider catch it via error boundary / context refresh.
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    const message = data?.message || 'Unable to connect to NEXVYRA. Please check your connection and try again.';
    throw new ApiClientError(response.status, message, data);
  }

  return data;
};

const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
  const token = getAuthToken();
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    // Network error
    throw new ApiClientError(0, 'Unable to connect to NEXVYRA. Please check your connection and try again.');
  }
};

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: any) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body?: any) => request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
