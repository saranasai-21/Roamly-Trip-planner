import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Calendar, User, ArrowRight, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TemplatesDirectoryPage() {
  const templates = await prisma.tripTemplate.findMany({
    include: {
      destination: true,
      creator: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-[#0b0c10] text-slate-100 flex flex-col justify-between">
      <Navbar theme="dark" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 w-full flex-1">
        <div className="space-y-4">
          <Badge variant="purple" size="sm">
            Curated Tripboards
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Curated Itineraries & Creator Trips
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
            Ready-to-customise travel boards crafted by slow-travel photographers, regional specialists, and our AI travel architects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className="rounded-2xl overflow-hidden bg-slate-900/90 border border-purple-950/60 hover:border-purple-600/60 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-purple-950/40"
              >
                <div>
                  <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                    <img
                      src={tpl.coverImage}
                      alt={tpl.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <Badge variant="purple" size="sm" className="bg-purple-950/90 text-white border-purple-500/40">
                        {tpl.destination.name}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 right-3 text-xs font-semibold bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full text-purple-300 border border-purple-900/50 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-purple-400" />
                      <span>{tpl.durationDays} Days ({tpl.nights}N)</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    {tpl.creator && (
                      <div className="flex items-center gap-2">
                        <img
                          src={tpl.creator.avatarUrl}
                          alt={tpl.creator.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="text-xs text-slate-300">
                          {tpl.creator.name}
                        </span>
                        {tpl.creator.isDemo && (
                          <span className="text-[9px] bg-purple-950 text-purple-400 px-1 py-0.5 rounded border border-purple-800/60">
                            Demo Creator
                          </span>
                        )}
                      </div>
                    )}

                    <h3 className="text-lg font-bold text-white leading-snug">
                      {tpl.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {tpl.subtitle}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {pills.slice(0, 3).map((pill, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded bg-purple-950/70 border border-purple-900/40 text-purple-300"
                        >
                          {pill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <Link
                    href={`/templates/${tpl.slug}`}
                    className="text-xs font-semibold text-purple-400 hover:text-purple-300"
                  >
                    View Details &rarr;
                  </Link>
                  <Link href={`/plan?template=${tpl.slug}`}>
                    <Button size="sm">
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      Customise
                    </Button>
                  </Link>
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

