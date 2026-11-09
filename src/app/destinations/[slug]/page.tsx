import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { VisaChecker } from '@/components/destination/VisaChecker';
import {
  Calendar,
  Compass,
  Plane,
  Sun,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  Users,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface DestinationPageProps {
  params: {
    slug: string;
  };
}

export default async function DestinationDetailPage({ params }: DestinationPageProps) {
  const destination = await prisma.destination.findUnique({
    where: { slug: params.slug },
    include: {
      cities: {
        include: {
          airports: true,
          activities: {
            take: 4,
          },
        },
      },
      templates: {
        include: {
          creator: true,
        },
      },
      articles: true,
    },
  });

  if (!destination) {
    notFound();
  }

  let bestMonths: string[] = [];
  try {
    bestMonths = JSON.parse(destination.bestMonths);
  } catch {
    bestMonths = [];
  }

  let visaInfo = {
    requirements: 'Visa entry guidelines subject to national passport regulations.',
    cost: 'Varies by nationality',
    sourceUrl: 'https://imigrasi.go.id',
    lastVerified: '2026-09-01',
  };
  try {
    visaInfo = { ...visaInfo, ...JSON.parse(destination.visaInfo) };
  } catch {}

  const allMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  return (
    <div className="min-h-screen bg-[#0b0c10] text-slate-100 flex flex-col justify-between">
      <Navbar theme="dark" />

      {/* Hero Banner */}
      <section className="relative h-[440px] md:h-[500px] w-full overflow-hidden bg-slate-900">
        <img
          src={destination.heroImage}
          alt={destination.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/40 to-transparent" />

        <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="purple" size="sm" className="bg-purple-950/90 text-white border-purple-500/50">
              {destination.country} &bull; {destination.region}
            </Badge>
            <span className="text-xs font-semibold text-purple-300 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-purple-900/40 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span>Recommended: {destination.suggestedDurationDays} Days</span>
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            {destination.name}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            {destination.description}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link href={`/plan?destination=${destination.slug}`}>
              <Button size="md" className="font-bold shadow-lg shadow-purple-600/30">
                <Sparkles className="w-4 h-4 mr-1.5" />
                Plan Custom {destination.name} Trip
              </Button>
            </Link>
            {destination.templates.length > 0 && (
              <Link href={`/templates/${destination.templates[0].slug}`}>
                <Button
                  variant="outline"
                  size="md"
                  className="bg-slate-900/80 border-purple-800 text-purple-200 hover:text-white"
                >
                  View Sample Tripboard
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 w-full">
        {/* Section 1: Regional Cities & Recommended Night Balance */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Multi-City Route Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Key Regions & Recommended Night Allocation
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Don’t stay in one place. Balance your trip between culture, coasts, and cliffs to minimize transit fatigue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {destination.cities.map((city) => (
              <div
                key={city.id}
                className="rounded-2xl bg-slate-900/80 border border-purple-950/60 overflow-hidden flex flex-col justify-between hover:border-purple-600/50 transition-colors"
              >
                <div>
                  {city.heroImage && (
                    <div className="h-40 w-full overflow-hidden bg-slate-800">
                      <img
                        src={city.heroImage}
                        alt={city.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white">{city.name}</h3>
                      <Badge variant="purple" size="sm">
                        {city.defaultNights} Nights Ideal
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {city.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <span className="text-[11px] font-semibold text-purple-300 block mb-1">
                    Top Experiences:
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {city.activities.slice(0, 2).map((act) => (
                      <li key={act.id} className="flex items-center gap-1.5 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <span className="truncate">{act.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Climate Matrix & Visa Requirements */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Monthly Climate Guide */}
          <div className="lg:col-span-6 rounded-2xl bg-slate-900/90 border border-purple-900/40 p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">
                Monthly Climate & Best Travel Windows
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {destination.weatherNotes ||
                'Dry season features clear skies and low humidity. Tropical wet season brings brief afternoon downpours with lush greenery.'}
            </p>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400">
                12-Month Suitability Matrix:
              </span>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 text-center">
                {allMonths.map((month) => {
                  const isBest = bestMonths.includes(month);
                  return (
                    <div
                      key={month}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                        isBest
                          ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                          : 'bg-slate-800/50 border-slate-700/50 text-slate-500'
                      }`}
                    >
                      <span>{month}</span>
                      <span className="block text-[9px] mt-0.5 font-normal">
                        {isBest ? 'Dry' : 'Rain'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Contextual Visa Checker */}
          <div className="lg:col-span-6">
            <VisaChecker
              destinationName={destination.name}
              countryName={destination.country}
              visaData={visaInfo}
            />
          </div>
        </div>

        {/* Section 3: Arrival Airports */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-purple-400" />
            <h3 className="text-xl font-bold text-white">
              Primary Arrival Ports & Airports
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {destination.cities.flatMap((c) => c.airports).map((airport) => (
              <div
                key={airport.id}
                className="p-4 rounded-xl bg-slate-900/70 border border-purple-950/60 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-purple-400 bg-purple-950 px-2 py-0.5 rounded">
                      {airport.iata}
                    </span>
                    <span className="font-semibold text-xs text-white">
                      {airport.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {airport.country}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Ready-made Itineraries */}
        <div className="space-y-6 pt-6 border-t border-purple-950/40">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Curated Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Ready-Made Itineraries for {destination.name}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {destination.templates.map((tpl) => (
              <div
                key={tpl.id}
                className="rounded-2xl bg-slate-900 border border-purple-900/40 p-5 flex flex-col justify-between space-y-4"
              >
                <div className="flex gap-4">
                  <img
                    src={tpl.coverImage}
                    alt={tpl.title}
                    className="w-28 h-28 rounded-xl object-cover shrink-0"
                  />
                  <div className="space-y-1 flex-1">
                    <Badge variant="purple" size="sm">
                      {tpl.durationDays} Days &bull; {tpl.nights} Nights
                    </Badge>
                    <h4 className="font-bold text-white text-base leading-tight">
                      {tpl.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {tpl.subtitle}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <Link
                    href={`/templates/${tpl.slug}`}
                    className="text-xs font-semibold text-purple-400 hover:text-purple-300"
                  >
                    View Details &rarr;
                  </Link>
                  <Link href={`/plan?template=${tpl.slug}`}>
                    <Button size="sm">
                      Customise on Tripboard
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
