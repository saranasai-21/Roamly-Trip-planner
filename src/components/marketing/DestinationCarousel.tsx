import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Compass, ArrowRight, Star } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface DestinationItem {
  id: string;
  slug: string;
  name: string;
  country: string;
  heroImage: string;
  description: string;
  suggestedDurationDays: number;
}

interface TemplateItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  durationDays: number;
  coverImage: string;
  destination: {
    name: string;
  };
  creator?: {
    name: string;
    handle: string;
    isDemo: boolean;
  } | null;
  highlightPills: string; // JSON string array
}

interface DestinationCarouselProps {
  destinations: DestinationItem[];
  templates: TemplateItem[];
}

export function DestinationCarousel({ destinations, templates }: DestinationCarouselProps) {
  return (
    <section className="py-16 md:py-24 bg-[#0d0c15] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Curated Destinations Section */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Explore The World
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Curated Travel Destinations
              </h2>
              <p className="text-sm text-slate-400 mt-1 max-w-xl">
                Verified climates, travel visa guidelines, arrival airports, and multi-city route recommendations.
              </p>
            </div>
            <Link
              href="/destinations"
              className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors"
            >
              <span>View All Destinations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {destinations.map((d) => (
              <Link
                key={d.id}
                href={`/destinations/${d.slug}`}
                className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-purple-950/60 hover:border-purple-600/60 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-purple-950/40 flex flex-col h-[380px]"
              >
                <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                  <img
                    src={d.heroImage}
                    alt={d.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <Badge variant="purple" size="sm" className="bg-purple-950/80 backdrop-blur-md text-white border-purple-500/40 font-bold">
                      {d.country}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 right-3 text-xs font-semibold bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full text-purple-300 border border-purple-900/50 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-purple-400" />
                    <span>{d.suggestedDurationDays} Days Recommended</span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                      {d.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-3 mt-2 leading-relaxed">
                      {d.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium text-purple-400">
                    <span>Explore Itinerary & Cities</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Ready-Made Curated Itineraries Section */}
        <div className="space-y-6 pt-8 border-t border-purple-950/40">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Ready-Made Itineraries
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Curated Trip Templates
              </h2>
              <p className="text-sm text-slate-400 mt-1 max-w-xl">
                Ready-to-customise boards featuring real multi-city balances, verified stays, and timed activities.
              </p>
            </div>
            <Link
              href="/templates"
              className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors"
            >
              <span>Browse All Collections</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((tpl) => {
              let pills: string[] = [];
              try {
                pills = JSON.parse(tpl.highlightPills);
              } catch {
                pills = [];
              }

              return (
                <div
                  key={tpl.id}
                  className="rounded-2xl overflow-hidden bg-slate-900/90 border border-purple-900/40 hover:border-purple-600/60 p-5 flex flex-col justify-between gap-4 transition-all duration-300 hover:shadow-xl hover:shadow-purple-950/40"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <img
                      src={tpl.coverImage}
                      alt={tpl.title}
                      className="w-full sm:w-36 h-36 rounded-xl object-cover shrink-0"
                    />
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="purple" size="sm">
                          {tpl.destination.name} &bull; {tpl.durationDays} Days
                        </Badge>
                        {tpl.creator && (
                          <span className="text-[11px] text-slate-400">
                            by <span className="text-slate-300 font-semibold">{tpl.creator.name}</span>
                            {tpl.creator.isDemo && (
                              <span className="ml-1 text-[9px] text-purple-400 bg-purple-950 px-1 py-0.5 rounded">
                                Demo
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white leading-snug">
                        {tpl.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {tpl.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Highlight Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {pills.slice(0, 4).map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950/70 border border-purple-800/40 text-purple-300 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <Link
                      href={`/templates/${tpl.slug}`}
                      className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                    >
                      Inspect Itinerary &rarr;
                    </Link>
                    <Link
                      href={`/plan?template=${tpl.slug}`}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      Duplicate & Customise
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}

