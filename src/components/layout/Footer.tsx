import React from 'react';
import Link from 'next/link';
import { Compass, ShieldCheck, Heart, Globe, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-[#08070d] text-slate-400 border-t border-purple-950/40 py-12 px-4 sm:px-6 lg:px-8 text-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Brand column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold">
              <Compass className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg text-white">Roamly</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Personalised multi-city vacation planning powered by curated destination intelligence, multi-provider stay comparison, and AI itinerary architecture.
          </p>
          <div className="flex items-center gap-2 text-xs text-purple-400">
            <ShieldCheck className="w-4 h-4 text-purple-500" />
            <span>Verified Travel Data & Demo Sandboxes</span>
          </div>
        </div>

        {/* Featured Destinations */}
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            Popular Destinations
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/destinations/bali" className="hover:text-purple-300 transition-colors">
                Bali, Indonesia (Ubud, Seminyak, Uluwatu)
              </Link>
            </li>
            <li>
              <Link href="/destinations/thailand" className="hover:text-purple-300 transition-colors">
                Thailand (Bangkok & Phuket)
              </Link>
            </li>
            <li>
              <Link href="/destinations/japan" className="hover:text-purple-300 transition-colors">
                Japan (Tokyo & Kyoto)
              </Link>
            </li>
            <li>
              <Link href="/destinations" className="text-purple-400 hover:text-purple-300 font-semibold">
                Explore All Destinations &rarr;
              </Link>
            </li>
          </ul>
        </div>

        {/* Tripboard Product Sections */}
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            Tripboard Capabilities
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/trips" className="hover:text-purple-300 transition-colors">
                Visual Multi-Day Workspace
              </Link>
            </li>
            <li>
              <Link href="/templates" className="hover:text-purple-300 transition-colors">
                Curated Creator Itineraries
              </Link>
            </li>
            <li>
              <Link href="/plan" className="hover:text-purple-300 transition-colors">
                4-Stage Travel Questionnaire
              </Link>
            </li>
            <li>
              <span className="text-slate-500">Live Multi-Provider Hotel Comparison</span>
            </li>
            <li>
              <span className="text-slate-500">Transparent Inclusions & Exclusions</span>
            </li>
          </ul>
        </div>

        {/* Product Notice & Open Architecture */}
        <div className="space-y-2 text-xs">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            Transparency Notice
          </h3>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Roamly is an independent travel planning application inspired by modern tripboard architectures. All creator profiles, sample itineraries, and hotel pricing offers are seeded demo fixtures for demonstration and testing purposes.
          </p>
          <p className="text-purple-400 text-[11px] font-medium pt-1">
            Built with Next.js, MapLibre, PostgreSQL/Prisma & Gemini AI.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-purple-950/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Roamly Travel Technologies. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="/destinations" className="hover:text-slate-400">Directory</Link>
          <Link href="/plan" className="hover:text-slate-400">Plan Wizard</Link>
          <Link href="/trips" className="hover:text-slate-400">My Trips</Link>
        </div>
      </div>
    </footer>
  );
}
