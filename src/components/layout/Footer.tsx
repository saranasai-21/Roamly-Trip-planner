import React from 'react';
import Link from 'next/link';
import { Compass, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-white text-slate-600 border-t border-slate-200 py-12 px-4 sm:px-6 lg:px-8 text-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Brand column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold">
              <Compass className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-lg text-slate-900">Roamly</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Personalised multi-city vacation planning powered by curated destination intelligence, multi-provider stay comparison, and AI itinerary architecture.
          </p>
          <div className="flex items-center gap-2 text-xs text-purple-700 font-semibold">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Verified Travel Data & Demo Sandboxes</span>
          </div>
        </div>

        {/* Featured Destinations */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            Popular Destinations
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/destinations/bali" className="hover:text-purple-600 transition-colors">
                Bali, Indonesia (Ubud, Seminyak, Uluwatu)
              </Link>
            </li>
            <li>
              <Link href="/destinations/thailand" className="hover:text-purple-600 transition-colors">
                Thailand (Bangkok & Phuket)
              </Link>
            </li>
            <li>
              <Link href="/destinations/japan" className="hover:text-purple-600 transition-colors">
                Japan (Tokyo & Kyoto)
              </Link>
            </li>
            <li>
              <Link href="/destinations" className="text-purple-600 hover:text-purple-700 font-bold">
                Explore All Destinations &rarr;
              </Link>
            </li>
          </ul>
        </div>

        {/* Tripboard Product Sections */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            Tripboard Capabilities
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/trips" className="hover:text-purple-600 transition-colors">
                Visual Multi-Day Workspace
              </Link>
            </li>
            <li>
              <Link href="/templates" className="hover:text-purple-600 transition-colors">
                Curated Creator Itineraries
              </Link>
            </li>
            <li>
              <Link href="/plan" className="hover:text-purple-600 transition-colors">
                4-Stage Travel Questionnaire
              </Link>
            </li>
            <li>
              <span className="text-slate-400">Multi-Provider Hotel Comparison</span>
            </li>
            <li>
              <span className="text-slate-400">Transparent Inclusions & Exclusions</span>
            </li>
          </ul>
        </div>

        {/* Product Notice & Open Architecture */}
        <div className="space-y-2 text-xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            Open Architecture
          </h3>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Roamly is built with Next.js, MapLibre, PostgreSQL/Prisma & Google Gemini AI. Anyone cloning this repository can supply their own Gemini API key directly via the in-app key manager.
          </p>
          <p className="text-purple-700 text-[11px] font-bold pt-1">
            Production-Grade & Open Source
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <p>&copy; {new Date().getFullYear()} Roamly Travel Technologies. All rights reserved.</p>
        <div className="flex items-center gap-4 font-medium">
          <Link href="/destinations" className="hover:text-slate-700">Directory</Link>
          <Link href="/plan" className="hover:text-slate-700">Plan Wizard</Link>
          <Link href="/trips" className="hover:text-slate-700">My Trips</Link>
        </div>
      </div>
    </footer>
  );
}
