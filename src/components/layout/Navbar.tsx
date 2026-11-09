'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Sparkles, User, LogOut, Shield, Key } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { AuthModal } from '../auth/AuthModal';
import { ApiKeyModal } from '../auth/ApiKeyModal';
import { UserSession } from '@/lib/types';

interface NavbarProps {
  theme?: 'dark' | 'light';
}

export function Navbar({ theme = 'light' }: NavbarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserSession | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));

    if (typeof window !== 'undefined') {
      const key = localStorage.getItem('roamly_gemini_api_key');
      setHasApiKey(!!key);
    }
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/';
  };

  return (
    <>
      <header className="w-full bg-white/95 border-b border-slate-200/90 text-slate-800 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-violet-600 flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tight bg-gradient-to-r from-purple-700 via-purple-900 to-slate-900 bg-clip-text text-transparent">
                  Roamly
                </span>
                <span className="text-[10px] tracking-wider uppercase font-extrabold text-purple-600 -mt-1">
                  Trip Planner
                </span>
              </div>
            </Link>

            {/* Main Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
              <Link
                href="/destinations"
                className={`transition-colors hover:text-purple-600 ${
                  pathname?.startsWith('/destinations')
                    ? 'text-purple-600 font-bold'
                    : 'text-slate-600'
                }`}
              >
                Destinations
              </Link>
              <Link
                href="/templates"
                className={`transition-colors hover:text-purple-600 ${
                  pathname?.startsWith('/templates')
                    ? 'text-purple-600 font-bold'
                    : 'text-slate-600'
                }`}
              >
                Curated Trips
              </Link>
              <Link
                href="/plan"
                className={`flex items-center gap-1.5 transition-colors hover:text-purple-600 ${
                  pathname === '/plan'
                    ? 'text-purple-600 font-bold'
                    : 'text-slate-600'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <span>Plan With AI</span>
              </Link>
              <Link
                href="/trips"
                className={`transition-colors hover:text-purple-600 ${
                  pathname === '/trips'
                    ? 'text-purple-600 font-bold'
                    : 'text-slate-600'
                }`}
              >
                My Trips
              </Link>
              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 transition-colors"
                >
                  <Shield className="w-3 h-3 text-purple-600" />
                  <span>Admin Hub</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            {/* Gemini API Key Button for Cloners */}
            <button
              type="button"
              onClick={() => setIsApiKeyOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-purple-300 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 text-xs font-semibold transition-all shadow-2xs"
              title="Configure your Gemini API key"
            >
              <Key className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">
                {hasApiKey ? 'Gemini Key Active' : 'Set Gemini Key'}
              </span>
              <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-emerald-500' : 'bg-amber-400'}`} />
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={user.role === 'admin' ? '/admin' : '/trips'}
                  className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[11px]">
                    {user.name.charAt(0)}
                  </div>
                  <span className="font-bold text-slate-800 hidden sm:inline">
                    {user.name.split(' ')[0]}
                  </span>
                  <Badge variant={user.role === 'admin' ? 'rose' : 'purple'} size="sm">
                    {user.role}
                  </Badge>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAuthOpen(true)}
              >
                <User className="w-3.5 h-3.5 mr-1.5" />
                <span>Sign In / Demo</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Instant Demo Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          fetch('/api/auth/me')
            .then((res) => res.json())
            .then((data) => setUser(data.user));
        }}
        onPromptApiKey={() => {
          setIsApiKeyOpen(true);
        }}
      />

      {/* Gemini API Key Modal for Repo Cloners */}
      <ApiKeyModal
        isOpen={isApiKeyOpen}
        onClose={() => {
          setIsApiKeyOpen(false);
          if (typeof window !== 'undefined') {
            const key = localStorage.getItem('roamly_gemini_api_key');
            setHasApiKey(!!key);
          }
        }}
        onSaved={() => {
          setHasApiKey(true);
        }}
      />
    </>
  );
}
