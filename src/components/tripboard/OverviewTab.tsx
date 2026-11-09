'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Hotel,
  Compass,
  Sparkles,
  PhoneCall,
  Shield,
  Smartphone,
  Utensils,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency } from '@/lib/money';

interface OverviewTabProps {
  trip: any;
  onNavigateTab: (tab: any) => void;
  onOpenExpert: () => void;
}

export function OverviewTab({ trip, onNavigateTab, onOpenExpert }: OverviewTabProps) {
  // Compute checklist and progress
  const allItems: any[] = trip.days.flatMap((d: any) => d.items);
  const staySelections: any[] = trip.stays || [];

  const bookedStays = staySelections.filter((s) => s.bookingStatus === 'booked').length;
  const totalStaysNeeded = trip.cities.length;

  const bookedItems = allItems.filter((i) => i.bookingStatus === 'booked').length;
  const totalItems = allItems.length;

  // Approximate total estimated cost
  const stayTotal = staySelections.reduce((sum, s) => sum + s.totalPriceMinor, 0);
  const itemsTotal = allItems.reduce((sum, i) => sum + i.costMinor, 0);
  const grandTotalMinor = stayTotal + itemsTotal;

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Trip Length</span>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">
              {trip.nights + 1}D / {trip.nights}N
            </h3>
            <span className="text-[11px] text-slate-400">
              {trip.cities.length} Regional Hubs
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Accommodation</span>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">
              {staySelections.length} / {totalStaysNeeded} Stays
            </h3>
            <span className="text-[11px] text-emerald-600 font-semibold">
              {bookedStays} Confirmed
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Hotel className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Experiences</span>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">
              {allItems.filter((i) => i.type === 'activity').length} Activities
            </h3>
            <span className="text-[11px] text-slate-400">
              {bookedItems} Booked / Shortlisted
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Compass className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Est. Total Budget</span>
            <h3 className="text-xl font-black text-purple-700 mt-0.5">
              {formatCurrency(grandTotalMinor, trip.currency || 'USD')}
            </h3>
            <span className="text-[11px] text-slate-400">
              ~{formatCurrency(Math.round(grandTotalMinor / Math.max(1, trip.adults)), trip.currency || 'USD')} / person
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Booking Checklist & Stay Selection Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Booking Readiness Checklist */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-base text-slate-900">
                Booking Readiness Checklist
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('budget')}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 transition-colors"
            >
              Manage in Budget &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {/* Stay item */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    bookedStays === totalStaysNeeded
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  <Hotel className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-800">
                    Hotels & Accommodations
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    {staySelections.length} Selected ({bookedStays} Confirmed)
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateTab('stays')}
              >
                Compare Stays
              </Button>
            </div>

            {/* Activities item */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-800">
                    Scheduled Experiences & Tours
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    {allItems.filter((i) => i.type === 'activity').length} Sights on Itinerary
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateTab('itinerary')}
              >
                Review Days
              </Button>
            </div>

            {/* Transfers & Transport item */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-800">
                    Airport & Inter-City Transfers
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    {allItems.filter((i) => i.type === 'transfer').length} Route Legs Planned
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateTab('itinerary')}
              >
                Check Gaps
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Expert Consultation Card */}
        <div className="lg:col-span-5 rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-950 p-6 text-white space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <Badge variant="purple" size="sm" className="bg-purple-800/80 text-white border-purple-400/30">
              Verified Human Specialist
            </Badge>
          </div>

          <div>
            <h3 className="font-black text-lg text-white">
              Need assistance refining your itinerary?
            </h3>
            <p className="text-xs text-purple-200 mt-1 leading-relaxed">
              Our destination travel architects review daily routing, check seasonal temple calendars, verify villa amenities, and prepare consolidated quotes.
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="secondary"
              size="md"
              onClick={onOpenExpert}
              className="w-full bg-white text-purple-950 hover:bg-purple-50 font-bold"
            >
              Request Free Specialist Review &rarr;
            </Button>
          </div>
        </div>
      </div>

      {/* Daily Preview Cards Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Day-by-Day Route Preview</h3>
            <p className="text-xs text-slate-500">
              Click any day to jump straight to the interactive editing column.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateTab('itinerary')}
          >
            Open Full Itinerary Board &rarr;
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {trip.days.map((day: any) => {
            const dayDate = new Date(day.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });
            const activities = day.items.filter((i: any) => i.type === 'activity');

            return (
              <div
                key={day.id}
                onClick={() => onNavigateTab('itinerary')}
                className="group rounded-2xl bg-white border border-slate-200/90 p-4 space-y-3 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                      Day {day.dayNumber}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{dayDate}</span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-800 mt-2 line-clamp-1 group-hover:text-purple-600 transition-colors">
                    {day.title || `Day in ${day.city.name}`}
                  </h4>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                    <MapPin className="w-3 h-3 text-purple-500" />
                    <span>{day.city.name}</span>
                  </div>

                  <ul className="mt-3 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2">
                    {day.items.slice(0, 3).map((item: any) => (
                      <li key={item.id} className="flex items-center gap-1.5 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </li>
                    ))}
                    {day.items.length > 3 && (
                      <li className="text-[11px] text-purple-600 font-semibold">
                        +{day.items.length - 3} more stops
                      </li>
                    )}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-purple-600 font-semibold">
                  <span>Edit Day</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Destination Essentials & Local Intelligence */}
      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
            Traveler Intelligence
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">
            Essential Advice for {trip.destination.name}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-700">
          {/* Card 1 */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Smartphone className="w-4 h-4 text-purple-600" />
              <span>eSIM & Mobile Data</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              Telkomsel provides the most consistent 4G/5G data coverage in Bali. Download an eSIM QR profile prior to departure to avoid long queueing at airport terminals.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Shield className="w-4 h-4 text-purple-600" />
              <span>Temple Dress & Etiquette</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              Cover shoulders and knees with a sarong and sash at sacred shrines. Avoid stepping directly on Canang Sari offerings set on pavements.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Utensils className="w-4 h-4 text-purple-600" />
              <span>Ride-Hailing & Getting Around</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              Install Grab and Gojek for on-demand rides in South Bali. For full-day temple routes across Ubud and Tegallalang, booking a dedicated private driver is recommended.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

