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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 w-full">
        <div className="space-y-4">
          <Badge variant="purple" size="sm">
            Destination Directory
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Explore Handcrafted Destinations
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            Curated travel intelligence with verified climate seasons, visa entry requirements, top arrival airports, and multi-city route collections.
          </p>
        </div>

        {/* Region groupings */}
        <div className="space-y-12">
          {regions.map((region) => {
            const regionDests = destinations.filter((d) => d.region === region);
            return (
              <div key={region} className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                  <Compass className="w-5 h-5 text-purple-600" />
                  <h2 className="text-xl font-bold text-slate-900">{region}</h2>
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
                        className="group rounded-2xl overflow-hidden bg-white border border-slate-200 hover:border-purple-300 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                            <img
                              src={dest.heroImage}
                              alt={dest.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                            <div className="absolute top-3 left-3">
                              <Badge variant="purple" size="sm" className="bg-white/95 text-purple-900 border-purple-200 font-bold shadow-sm">
                                {dest.country}
                              </Badge>
                            </div>
                            <div className="absolute bottom-3 right-3 text-xs font-semibold bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-slate-800 border border-slate-200 shadow-sm flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-purple-600" />
                              <span>{dest.suggestedDurationDays} Days Recommended</span>
                            </div>
                          </div>

                          <div className="p-5 space-y-3">
                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                              {dest.name}
                            </h3>
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                              {dest.description}
                            </p>

                            {/* Cities included */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {dest.cities.map((city) => (
                                <span
                                  key={city.id}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 border border-purple-100 text-purple-700 font-medium"
                                >
                                  {city.name} ({city.defaultNights}N)
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-700">
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

