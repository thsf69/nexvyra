import { getToken, removeToken } from '../storage/authStorage';
import { ApiResponse } from '../types';
import { Platform } from 'react-native';

// For Android emulator, localhost is 10.0.2.2. For iOS it's localhost.
const defaultLocalhost = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api';
export const API_URL = process.env.EXPO_PUBLIC_API_URL || defaultLocalhost;

export class ApiClientError extends Error {
  public status: number;
  public data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiClientError';
  }
}

// Global emitter for unauthorized events so the context can respond
export const unauthorizedEmitter = {
  listeners: [] as (() => void)[],
  emit() {
    this.listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  },
};

const handleResponse = async (response: Response) => {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    if (response.status === 401) {
      await removeToken();
      unauthorizedEmitter.emit();
    }
    const message = data?.message || 'Unable to connect to NEXVYRA. Please check your connection and try again.';
    throw new ApiClientError(response.status, message, data);
  }

  return data;
};

const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
  const token = await getToken();
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
