'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, MapPin, ArrowRight, Compass, Shield, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeroSectionProps {
  destinations: Array<{
    id: string;
    slug: string;
    name: string;
    country: string;
    heroImage: string;
    suggestedDurationDays: number;
  }>;
}

export function HeroSection({ destinations }: HeroSectionProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activePin, setActivePin] = useState<string>('bali');

  const filteredDestinations = destinations.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredDestinations.length > 0) {
      router.push(`/destinations/${filteredDestinations[0].slug}`);
    } else {
      router.push('/plan');
    }
  };

  const worldPins = [
    { slug: 'bali', name: 'Bali, Indonesia', x: 78, y: 64, desc: 'Temples, surf & jungle villas' },
    { slug: 'thailand', name: 'Thailand', x: 74, y: 52, desc: 'Bangkok street food & islands' },
    { slug: 'japan', name: 'Japan', x: 86, y: 40, desc: 'Tokyo neon & Kyoto Zen shrines' },
  ];

  return (
    <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32">
      {/* Background radial purple glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-purple-700/20 via-violet-900/10 to-transparent blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline, Subtitle, Search & CTAs */}
          <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/70 border border-purple-800/60 text-purple-300 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>Next-Gen Visual Multi-City Tripboard</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                Plan your ultimate journey{' '}
                <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                  visually with AI
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Discover destinations, design balanced multi-city itineraries, compare live hotel offers, and refine with expert support on an interactive day-by-day tripboard.
              </p>
            </div>

            {/* Quick Country/Destination Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative max-w-md mx-auto lg:mx-0"
            >
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-purple-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Where do you want to travel? (e.g. Bali, Japan)"
                  className="w-full pl-12 pr-32 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-purple-500/30 focus:border-purple-400 text-white placeholder-slate-400 text-sm outline-none backdrop-blur-md transition-all shadow-lg"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-2 px-4 py-2"
                >
                  Explore
                </Button>
              </div>

              {/* Autocomplete dropdown if typing */}
              {searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#12111d] border border-purple-900/60 rounded-xl shadow-2xl p-2 z-30 text-left">
                  {filteredDestinations.map((d) => (
                    <Link
                      key={d.id}
                      href={`/destinations/${d.slug}`}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-purple-900/40 text-xs text-white transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-purple-400" />
                        <span className="font-semibold">{d.name}</span>
                        <span className="text-slate-400">({d.country})</span>
                      </div>
                      <span className="text-purple-300">{d.suggestedDurationDays} Days &rarr;</span>
                    </Link>
                  ))}
                  {filteredDestinations.length === 0 && (
                    <p className="p-3 text-xs text-slate-400 text-center">
                      No matching seeded destination. Click &ldquo;Plan my trip&rdquo; to build any custom trip.
                    </p>
                  )}
                </div>
              )}
            </form>

            {/* Suggested Destinations Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-xs">
              <span className="text-slate-400 font-medium">Trending:</span>
              {destinations.map((d) => (
                <Link
                  key={d.id}
                  href={`/destinations/${d.slug}`}
                  className="px-3 py-1 rounded-full bg-slate-900/80 hover:bg-purple-900/50 border border-purple-900/40 hover:border-purple-500 text-slate-300 hover:text-white transition-all"
                >
                  {d.name}
                </Link>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link href="/plan" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-purple-600/30 font-bold">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Plan My Trip (Interactive Wizard)
                </Button>
              </Link>
              <Link href="/destinations/bali" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto bg-transparent border-purple-700/60 text-purple-200 hover:bg-purple-950/40 hover:text-white"
                >
                  View Sample Bali Tripboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive World Exploration Map Card */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl p-1 bg-gradient-to-b from-purple-500/30 via-purple-900/10 to-transparent shadow-2xl backdrop-blur-xl">
              <div className="relative rounded-[22px] bg-[#0f0e1a]/95 border border-purple-800/40 overflow-hidden p-6 aspect-[4/3] flex flex-col justify-between">
                
                {/* Header of Map Card */}
                <div className="flex items-center justify-between pb-3 border-b border-purple-950/60 z-20">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                      Interactive Visual Map
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Click any pin to inspect</span>
                </div>

                {/* Stylized Vector World Map Canvas */}
                <div className="relative flex-1 my-4 flex items-center justify-center">
                  <svg
                    viewBox="0 0 1000 500"
                    className="w-full h-full opacity-30 pointer-events-none fill-purple-300/40"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Simplified geometric continents */}
                    <path d="M150,120 Q180,80 260,90 Q320,130 280,220 Q210,250 170,190 Z" /> {/* North America */}
                    <path d="M260,260 Q320,270 310,380 Q250,440 230,340 Z" /> {/* South America */}
                    <path d="M470,110 Q540,90 550,170 Q490,200 460,150 Z" /> {/* Europe */}
                    <path d="M470,200 Q560,200 570,330 Q480,380 450,260 Z" /> {/* Africa */}
                    <path d="M570,90 Q760,80 820,200 Q740,320 620,240 Z" /> {/* Asia */}
                    <path d="M720,340 Q840,320 830,420 Q740,430 710,380 Z" /> {/* Australia */}
                  </svg>

                  {/* Destination Pins on Map */}
                  {worldPins.map((pin) => {
                    const isActive = activePin === pin.slug;
                    return (
                      <div
                        key={pin.slug}
                        style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                        onClick={() => setActivePin(pin.slug)}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 group"
                      >
                        <div
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all duration-300 ${
                            isActive
                              ? 'bg-purple-600 text-white border-purple-300 ring-4 ring-purple-400/30 scale-110'
                              : 'bg-[#181628] text-slate-300 border-purple-800/80 hover:border-purple-400 hover:scale-105'
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5 text-purple-300" />
                          <span>{pin.name.split(',')[0]}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer preview banner for the selected pin */}
                <div className="z-20 bg-purple-950/70 border border-purple-800/60 rounded-xl p-3 flex items-center justify-between backdrop-blur-md">
                  <div>
                    <h4 className="font-bold text-xs text-white">
                      {worldPins.find((p) => p.slug === activePin)?.name}
                    </h4>
                    <p className="text-[11px] text-purple-300">
                      {worldPins.find((p) => p.slug === activePin)?.desc}
                    </p>
                  </div>
                  <Link
                    href={`/destinations/${activePin}`}
                    className="text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span>View Board</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

