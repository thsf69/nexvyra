'use client';

// The AuthProvider handles redirecting from '/' to '/dashboard' or '/login'
// This is just a fallback loading state.
export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-text-secondary animate-pulse">Loading NEXVYRA...</div>
    </div>
  );
}
