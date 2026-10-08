'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { AppShell } from '@/components/layout/AppShell';
import { useTheme } from 'next-themes';

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!user) return null;

  const initials = user.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  const renderThemeButton = (mode: string, label: string, icon: React.ReactNode) => {
    const isActive = mounted && theme === mode;
    return (
      <button
        onClick={() => setTheme(mode)}
        className={`flex-1 flex flex-col items-center justify-center p-4 border rounded-xl transition-all ${
          isActive
            ? 'border-primary bg-primary/10 text-primary shadow-sm'
            : 'border-border bg-surface text-text-secondary hover:bg-background hover:text-text'
        }`}
      >
        <div className="mb-2 text-xl">{icon}</div>
        <span className="text-sm font-medium">{label}</span>
      </button>
    );
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-text">Account Settings</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage your profile, preferences, and session.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="md:col-span-2 space-y-8">
            <section className="bg-surface rounded-xl shadow-sm border border-border p-6 sm:p-8">
              <h2 className="text-lg font-bold text-text mb-6">Profile Information</h2>
              <div className="flex items-center space-x-6 mb-6">
                <div className="flex-shrink-0 h-20 w-20 rounded-full bg-gradient-to-br from-primary to-iris flex items-center justify-center text-white text-3xl font-bold shadow-md">
                  {initials}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text">{user.fullName}</h3>
                  <p className="text-text-secondary">{user.email}</p>
                  <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success border border-success/30">
                    Active Member
                  </div>
                </div>
              </div>
              <div className="border-t border-border pt-6">
                <p className="text-sm text-text-secondary">
                  Profile information is managed securely by NEXVYRA. To update your details, please contact your workspace administrator.
                </p>
              </div>
            </section>

            {/* Theme Preferences */}
            <section className="bg-surface rounded-xl shadow-sm border border-border p-6 sm:p-8">
              <h2 className="text-lg font-bold text-text mb-2">Appearance</h2>
              <p className="text-sm text-text-secondary mb-6">Customize how NEXVYRA looks on this device.</p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {renderThemeButton('light', 'Light', '☀️')}
                {renderThemeButton('system', 'System', '🖥️')}
                {renderThemeButton('dark', 'Dark', '🌙')}
              </div>
            </section>
          </div>

          {/* Account Actions Section */}
          <div className="space-y-8">
            <section className="bg-surface rounded-xl shadow-sm border border-border p-6 sm:p-8">
              <h2 className="text-lg font-bold text-red-600 mb-2">Session</h2>
              <p className="text-sm text-text-secondary mb-6">Log out of your current session.</p>
              <button
                onClick={logout}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Log out
              </button>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
