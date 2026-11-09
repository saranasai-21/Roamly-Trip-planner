'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Sparkles, MapPin, User, LogOut, MessageSquare, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { AuthModal } from '../auth/AuthModal';
import { UserSession } from '@/lib/types';

interface NavbarProps {
  theme?: 'dark' | 'light';
}

export function Navbar({ theme = 'light' }: NavbarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserSession | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const isDark = theme === 'dark' || pathname === '/';

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/';
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <>
      <header
        className={`w-full transition-colors z-40 ${
          isDark
            ? 'bg-[#0b0c10]/85 border-b border-purple-950/40 text-white backdrop-blur-md sticky top-0'
            : 'bg-white/90 border-b border-slate-200 text-slate-800 backdrop-blur-md sticky top-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-700 to-violet-500 flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-purple-400 via-violet-300 to-white bg-clip-text text-transparent">
                  Roamly
                </span>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-purple-400 -mt-1">
                  Trip Planner
                </span>
              </div>
            </Link>

            {/* Main Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link
                href="/destinations"
                className={`transition-colors hover:text-purple-400 ${
                  pathname?.startsWith('/destinations')
                    ? 'text-purple-400 font-semibold'
                    : isDark
                    ? 'text-slate-300'
                    : 'text-slate-600'
                }`}
              >
                Destinations
              </Link>
              <Link
                href="/templates"
                className={`transition-colors hover:text-purple-400 ${
                  pathname?.startsWith('/templates')
                    ? 'text-purple-400 font-semibold'
                    : isDark
                    ? 'text-slate-300'
                    : 'text-slate-600'
                }`}
              >
                Curated Trips
              </Link>
              <Link
                href="/plan"
                className={`flex items-center gap-1.5 transition-colors hover:text-purple-400 ${
                  pathname === '/plan'
                    ? 'text-purple-400 font-semibold'
                    : isDark
                    ? 'text-slate-300'
                    : 'text-slate-600'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Plan With AI</span>
              </Link>
              <Link
                href="/trips"
                className={`transition-colors hover:text-purple-400 ${
                  pathname === '/trips'
                    ? 'text-purple-400 font-semibold'
                    : isDark
                    ? 'text-slate-300'
                    : 'text-slate-600'
                }`}
              >
                My Trips
              </Link>
              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1 text-xs font-semibold text-purple-400 bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-800/80"
                >
                  <Shield className="w-3 h-3" />
                  <span>Admin Hub</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-800/60 transition-colors"
                title="Chat directly with an expert on WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Expert WhatsApp</span>
              </a>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/trips"
                  className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[11px]">
                    {user.name.charAt(0)}
                  </div>
                  <span className="font-medium text-slate-200 hidden sm:inline">
                    {user.name.split(' ')[0]}
                  </span>
                  <Badge variant={user.role === 'admin' ? 'rose' : user.role === 'expert' ? 'amber' : 'purple'} size="sm">
                    {user.role}
                  </Badge>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/50 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Button
                variant={isDark ? 'primary' : 'primary'}
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

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          fetch('/api/auth/me')
            .then((res) => res.json())
            .then((data) => setUser(data.user));
        }}
      />
    </>
  );
}

