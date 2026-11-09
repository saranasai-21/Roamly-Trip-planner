import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TemplateCustomiseButton } from '@/components/template/TemplateCustomiseButton';
import { Calendar, User, MapPin, Sparkles, Check, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TemplateDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const template = await prisma.tripTemplate.findUnique({
    where: { slug: params.slug },
    include: {
      destination: {
        include: {
          cities: true,
        },
      },
      creator: true,
    },
  });

  if (!template) {
    notFound();
  }

  let citiesParsed: Array<{ cityName: string; citySlug: string; nights: number }> = [];
  try {
    citiesParsed = JSON.parse(template.citiesJson);
  } catch {
    citiesParsed = [];
  }

  let highlightPills: string[] = [];
  try {
    highlightPills = JSON.parse(template.highlightPills);
  } catch {
    highlightPills = [];
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 w-full flex-1">
        <Link
          href="/templates"
          className="inline-flex items-center gap-1.5 text-xs text-purple-700 hover:text-purple-900 transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Collections</span>
        </Link>

        {/* Hero Card */}
        <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xl">
          <div className="relative h-64 md:h-80 w-full bg-slate-950">
            <img
              src={template.coverImage}
              alt={template.title}
              className="w-full h-full object-cover opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            <div className="absolute top-4 left-4">
              <Badge variant="purple" size="sm" className="bg-purple-950/90 text-white border-purple-500/50">
                {template.destination.name} Collection
              </Badge>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                  {template.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-200 max-w-xl">
                  {template.subtitle}
                </p>
              </div>

              {/* Action Button */}
              <div className="shrink-0">
                <TemplateCustomiseButton
                  templateSlug={template.slug}
                  isPaid={template.isPaid}
                  priceMinor={template.priceMinor}
                />
              </div>
            </div>
          </div>

          {/* Details Bar */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Duration:</span>
              <span className="font-bold text-slate-900 text-sm">
                {template.durationDays} Days / {template.nights} Nights
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Curator:</span>
              <span className="font-bold text-slate-900 text-sm">
                {template.creator?.name || 'Roamly Travel Architect'}
              </span>
              {template.creator?.isDemo && (
                <span className="text-[10px] text-purple-700 font-semibold ml-1">(Demo Profile)</span>
              )}
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Route Stops:</span>
              <span className="font-bold text-slate-900 text-sm">
                {citiesParsed.map((c) => c.cityName).join(' → ') || 'Multi-City'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Access Status:</span>
              <span className="font-bold text-emerald-700 text-sm">
                {template.isPaid ? 'Premium Sandbox' : 'Free Open Template'}
              </span>
            </div>
          </div>
        </div>

        {/* City and Nights Breakdown */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Route Sequence</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {citiesParsed.map((city, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs border border-purple-200">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{city.cityName}</h4>
                    <span className="text-xs text-slate-500">{city.nights} Nights</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Highlights List */}
        <div className="rounded-2xl bg-purple-50/60 border border-purple-200 p-6 space-y-4">
          <h3 className="font-bold text-base text-purple-900">
            What makes this trip special
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
            {highlightPills.map((pill, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{pill}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div>
            <h3 className="font-bold text-lg text-slate-900">
              Ready to make this itinerary your own?
            </h3>
            <p className="text-xs text-slate-600">
              Customising creates a private copy in your tripboard where you can change dates, swap activities, and compare hotels.
            </p>
          </div>
          <TemplateCustomiseButton
            templateSlug={template.slug}
            isPaid={template.isPaid}
            priceMinor={template.priceMinor}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}

