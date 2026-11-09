import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Calendar, Compass, ArrowRight, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DestinationsPage() {
  const destinations = await prisma.destination.findMany({
    include: {
      cities: {
        select: { id: true, name: true, defaultNights: true },
      },
      templates: {
        select: { id: true, title: true, durationDays: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  // Group by region
  const regions = Array.from(new Set(destinations.map((d) => d.region)));

  return (
    <div className="min-h-screen bg-[#0b0c10] text-slate-100 flex flex-col justify-between">
      <Navbar theme="dark" />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 w-full">
        <div className="space-y-4">
          <Badge variant="purple" size="sm">
            Destination Directory
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Explore Handcrafted Destinations
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
            Curated travel intelligence with verified climate seasons, visa entry requirements, top arrival airports, and multi-city route collections.
          </p>
        </div>

        {/* Region groupings */}
        <div className="space-y-12">
          {regions.map((region) => {
            const regionDests = destinations.filter((d) => d.region === region);
            return (
              <div key={region} className="space-y-6">
                <div className="flex items-center gap-2 border-b border-purple-950/60 pb-3">
                  <Compass className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-bold text-white">{region}</h2>
                  <span className="text-xs text-slate-500 font-medium">
                    ({regionDests.length} {regionDests.length === 1 ? 'country' : 'countries'})
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regionDests.map((dest) => {
                    let bestMonths: string[] = [];
                    try {
                      bestMonths = JSON.parse(dest.bestMonths);
                    } catch {
                      bestMonths = [];
                    }

                    return (
                      <Link
                        key={dest.id}
                        href={`/destinations/${dest.slug}`}
                        className="group rounded-2xl overflow-hidden bg-slate-900/80 border border-purple-950/60 hover:border-purple-600/60 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-purple-950/40 flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative h-52 w-full overflow-hidden bg-slate-800">
                            <img
                              src={dest.heroImage}
                              alt={dest.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                            <div className="absolute top-3 left-3">
                              <Badge variant="purple" size="sm" className="bg-purple-950/90 text-white border-purple-500/40">
                                {dest.country}
                              </Badge>
                            </div>
                            <div className="absolute bottom-3 right-3 text-xs font-semibold bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full text-purple-300 border border-purple-900/50 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-purple-400" />
                              <span>{dest.suggestedDurationDays} Days Recommended</span>
                            </div>
                          </div>

                          <div className="p-5 space-y-3">
                            <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                              {dest.name}
                            </h3>
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                              {dest.description}
                            </p>

                            {/* Cities included */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {dest.cities.map((city) => (
                                <span
                                  key={city.id}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-900/40 text-purple-300 font-medium"
                                >
                                  {city.name} ({city.defaultNights}N)
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="p-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium text-purple-400">
                          <span>View Climate, Visa & Trips</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}

