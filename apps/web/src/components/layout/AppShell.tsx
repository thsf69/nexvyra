'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';

/* eslint-disable @next/next/no-img-element */

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-text-secondary animate-pulse">Loading...</div>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Projects', href: '/projects' },
    { name: 'Tasks', href: '/tasks' },
  ];

  let pageTitle = 'NEXVYRA';
  if (pathname.startsWith('/dashboard')) pageTitle = 'Dashboard';
  else if (pathname.startsWith('/projects')) pageTitle = 'Projects';
  else if (pathname.startsWith('/tasks')) pageTitle = 'Tasks';

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setMobileMenuOpen(false)}
            aria-current={isActive ? 'page' : undefined}
            className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-text-secondary hover:bg-background hover:text-text'
            }`}
          >
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex flex-col w-64 max-w-sm bg-surface h-full border-r border-border shadow-xl">
            <div className="p-4 flex items-center justify-between border-b border-border">
              <img src="/branding/nexvyra-wordmark-light.svg" alt="NEXVYRA" className="h-8 dark:hidden" />
              <img src="/branding/nexvyra-wordmark-dark.svg" alt="NEXVYRA" className="h-8 hidden dark:block" />
              <button onClick={() => setMobileMenuOpen(false)} className="text-text-secondary hover:text-text p-1">
                <CloseIcon />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
              <NavLinks />
            </nav>
            <div className="p-4 border-t border-border">
              <p className="text-sm font-medium text-text truncate">{user.fullName}</p>
              <p className="text-xs text-text-secondary truncate mb-4">{user.email}</p>
              <button
                onClick={logout}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-surface border-r border-border">
        <div className="p-6">
          <img src="/branding/nexvyra-wordmark-light.svg" alt="NEXVYRA" className="h-10 dark:hidden" />
          <img src="/branding/nexvyra-wordmark-dark.svg" alt="NEXVYRA" className="h-10 hidden dark:block" />
          <p className="text-xs text-text-secondary mt-2 opacity-80">Connected Work, Clearly Managed.</p>
        </div>
        
        <nav className="flex-1 px-4 py-2 space-y-2">
          <NavLinks />
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex flex-col space-y-4">
            <div>
              <p className="text-sm font-medium text-text truncate">{user.fullName}</p>
              <p className="text-xs text-text-secondary truncate">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-surface border-b border-border px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="mr-3 md:hidden p-1 text-text-secondary hover:text-text rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <MenuIcon />
            </button>
            <h2 className="text-lg font-semibold text-text">{pageTitle}</h2>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeSwitcher />
            <div className="hidden sm:block text-sm text-text-secondary">
              <span className="font-medium">{user.fullName}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
