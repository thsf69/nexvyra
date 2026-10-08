'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';

/* eslint-disable @next/next/no-img-element */

const navPaths: Record<string, React.ReactNode> = {
  Dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
  Projects: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 5V3h8v2"/></>,
  Tasks: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8 9 2 2 4-4M8 16h8"/></>,
  Account: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
};
const NavIcon = ({ name }: { name: string }) => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{navPaths[name]}</svg>;
const Avatar = ({ name }: { name: string }) => <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white shadow-sm">{name.trim().charAt(0).toUpperCase() || 'N'}</span>;

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
  else if (pathname.startsWith('/account')) pageTitle = 'Account';

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setMobileMenuOpen(false)}
            aria-current={isActive ? 'page' : undefined}
            className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isActive
                ? 'bg-primary/10 text-primary ring-1 ring-primary/20 shadow-sm'
                : 'text-text-secondary hover:bg-primary/5 hover:text-text'
            }`}
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${isActive ? "bg-primary/15 text-primary" : "bg-background/50 text-text-secondary group-hover:text-primary"}`}><NavIcon name={item.name} /></span>
            <span className="flex-1">{item.name}</span>
            {isActive && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-primary" />}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen flex bg-background text-text">
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
              <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-[.22em] text-text-secondary/70">Workspace</p>
              <NavLinks />
              <div className="my-5 border-t border-border/70" />
              <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-[.22em] text-text-secondary/70">Preferences</p>
              <Link href="/account" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${pathname.startsWith("/account") ? "bg-primary/10 text-primary" : "text-text-secondary hover:bg-primary/5 hover:text-text"}`}><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/50"><NavIcon name="Account" /></span>Account</Link>
            </nav>
            <div className="p-4 border-t border-border bg-background/20">
              <p className="text-sm font-semibold text-text truncate">{user.fullName}</p>
              <p className="text-xs text-text-secondary truncate mb-4">{user.email}</p>
              <button
                onClick={logout}
                className="w-full text-left px-3 py-2 rounded-xl border border-border text-sm font-medium text-text-secondary hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5 transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 md:flex-col bg-surface border-r border-border shadow-[8px_0_32px_rgba(0,0,0,0.025)] dark:shadow-[8px_0_32px_rgba(0,0,0,0.12)] md:sticky md:top-0 md:h-screen">
        <div className="px-6 pt-7 pb-5 border-b border-border/70">
          <img src="/branding/nexvyra-wordmark-light.svg" alt="NEXVYRA" className="h-10 dark:hidden" />
          <img src="/branding/nexvyra-wordmark-dark.svg" alt="NEXVYRA" className="h-10 hidden dark:block" />
          <p className="text-xs text-text-secondary mt-2 opacity-80">Connected Work, Clearly Managed.</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-[.22em] text-text-secondary/70">Workspace</p>
          <NavLinks />
          <div className="my-6 border-t border-border/70" />
          <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-[.22em] text-text-secondary/70">Preferences</p>
          <Link href="/account" aria-current={pathname.startsWith("/account") ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${pathname.startsWith("/account") ? "bg-primary/10 text-primary ring-1 ring-primary/20" : "text-text-secondary hover:bg-primary/5 hover:text-text"}`}><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/50"><NavIcon name="Account" /></span>Account</Link>
        </nav>

        <div className="p-4 border-t border-border bg-background/20">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <Avatar name={user.fullName} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text">{user.fullName}</p>
              <p className="truncate text-xs text-text-secondary">{user.email}</p>
            </div>
          </div>
          <button onClick={logout} className="mt-3 w-full rounded-xl border border-border px-3 py-2.5 text-left text-sm font-medium text-text-secondary transition-colors hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-500">
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-surface/95 border-b border-border px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between z-10 backdrop-blur-xl">
          <div className="flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="mr-3 md:hidden p-1 text-text-secondary hover:text-text rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <MenuIcon />
            </button>
            <div><p className="text-[10px] uppercase tracking-[.2em] text-text-secondary">NEXVYRA / Workspace</p><h2 className="text-lg font-bold tracking-tight text-text">{pageTitle}</h2></div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeSwitcher />
            <div className="hidden sm:block text-sm text-text-secondary">
              <span className="font-medium">{user.fullName}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8 xl:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
