/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api, setAuthToken } from '@/lib/api/client';
import { useAuth } from '@/components/auth/AuthProvider';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refreshUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await api.post<{ token: string }>('/auth/register', { fullName, email, password });
      if (res.success && res.data?.token) {
        setAuthToken(res.data.token);
        await refreshUser(); // AuthProvider will redirect to dashboard
      }
    } catch (err: any) {
      if (err.data?.errors?.length > 0) {
        setError(err.data.errors.map((e: any) => e.message).join(' | '));
      } else {
        setError(err.message || 'An error occurred during registration');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-surface p-8 rounded-xl shadow-sm border border-border">
        <div className="flex flex-col items-center">
          <img src="/branding/nexvyra-wordmark-light.svg" alt="NEXVYRA" className="h-12 dark:hidden" />
          <img src="/branding/nexvyra-wordmark-dark.svg" alt="NEXVYRA" className="h-12 hidden dark:block" />
          <p className="mt-4 text-center text-sm text-text-secondary">
            Create an account to manage your connected work.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 rounded-md border border-red-100">
              {error}
            </div>
          )}
          
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="full-name" className="block text-sm font-medium text-text">Full Name</label>
              <input
                id="full-name"
                name="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-border rounded-md placeholder:text-text-secondary text-text focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-text">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-border rounded-md placeholder:text-text-secondary text-text focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-border rounded-md placeholder:text-text-secondary text-text focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="••••••••"
              />
              <p className="text-xs text-text-secondary mt-1">Must be at least 8 characters, containing uppercase, lowercase, and numbers.</p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70"
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </div>
          
          <div className="text-sm text-center">
            <Link href="/login" className="font-medium text-primary hover:text-primary">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
