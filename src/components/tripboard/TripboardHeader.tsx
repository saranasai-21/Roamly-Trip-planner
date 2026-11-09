'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  Calendar,
  Users,
  MapPin,
  Sparkles,
  Share2,
  Copy,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';

export type TripTab = 'overview' | 'itinerary' | 'stays' | 'explore' | 'budget';

interface TripboardHeaderProps {
  trip: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    nights: number;
    adults: number;
    children: number;
    infants: number;
    elders: number;
    destination: {
      name: string;
      country: string;
    };
    cities: Array<{
      city: { name: string; slug: string };
      nights: number;
    }>;
  };
  activeTab: TripTab;
  onTabChange: (tab: TripTab) => void;
  onOpenAi: () => void;
  onOpenExpert: () => void;
  onDuplicateTrip?: () => void;
  isReadOnly?: boolean;
}

export function TripboardHeader({
  trip,
  activeTab,
  onTabChange,
  onOpenAi,
  onOpenExpert,
  onDuplicateTrip,
  isReadOnly = false,
}: TripboardHeaderProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);

  const totalTravelers = trip.adults + trip.children + trip.infants + trip.elders;

  const startFormatted = new Date(trip.startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const endFormatted = new Date(trip.endDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleOpenShare = async () => {
    setIsShareModalOpen(true);
    if (!shareUrl) {
      setIsGeneratingShare(true);
      try {
        const res = await fetch(`/api/trips/${trip.id}/share`, { method: 'POST' });
        const data = await res.json();
        if (data.shareUrl) {
          setShareUrl(data.shareUrl);
        } else {
          setShareUrl(`${window.location.origin}/share/${data.token}`);
        }
      } catch {
        setShareUrl(`${window.location.origin}/trips/${trip.id}`);
      } finally {
        setIsGeneratingShare(false);
      }
    }
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const tabs: Array<{ id: TripTab; label: string; count?: number }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'itinerary', label: 'Itinerary' },
    { id: 'stays', label: 'Stays' },
    { id: 'explore', label: 'Explore' },
    { id: 'budget', label: 'Bookings & Budget' },
  ];

  return (
    <>
      <div className="w-full bg-white border-b border-slate-200 shadow-sm sticky top-16 z-30 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Title & Controls Row */}
          <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="purple" size="sm">
                  {trip.destination.name}, {trip.destination.country}
                </Badge>
                {isReadOnly && (
                  <Badge variant="amber" size="sm">
                    Read-Only View
                  </Badge>
                )}
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {startFormatted} – {endFormatted} ({trip.nights} Nights)
                  </span>
                </span>
                <span className="text-slate-300">&bull;</span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {totalTravelers} {totalTravelers === 1 ? 'Traveler' : 'Travelers'}
                  </span>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {trip.title}
              </h1>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {!isReadOnly ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onOpenExpert}
                    className="border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
                    <span>Ask Travel Expert</span>
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onOpenAi}
                    className="shadow-purple-500/20"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    <span>AI Assistant</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenShare}
                  >
                    <Share2 className="w-3.5 h-3.5 mr-1.5" />
                    <span>Share</span>
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onDuplicateTrip}
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  <span>Duplicate & Customise</span>
                </Button>
              )}
            </div>
          </div>

          {/* Navigation Tabs and City Chips Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 pb-1 overflow-x-auto no-scrollbar">
            {/* 5 Primary Tabs */}
            <nav className="flex items-center gap-1 sm:gap-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap ${
                      isActive
                        ? 'text-purple-700 bg-purple-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-purple-600 rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* City & Nights Chips below navigation */}
            <div className="flex items-center gap-1.5 shrink-0 pb-1 sm:pb-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden md:inline mr-1">
                Route:
              </span>
              {trip.cities.map((tc, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80"
                >
                  <MapPin className="w-3 h-3 text-purple-600" />
                  <span>{tc.city.name}</span>
                  <span className="text-purple-700 font-bold">{tc.nights}N</span>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>

      {/* Share Modal */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Share Read-Only Tripboard"
        description="Share a private, revocable link with traveling companions or friends."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Privacy & Scrubbing Protection</span>
            </div>
            <p className="text-purple-700 leading-relaxed text-[11px]">
              This link is read-only. Private notes, phone numbers, booking confirmation references, and attached files are automatically excluded from the public view.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Revocable Share URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={isGeneratingShare ? 'Generating token...' : shareUrl}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-3 py-2 text-xs font-mono outline-none"
              />
              <Button
                size="sm"
                variant={copied ? 'secondary' : 'primary'}
                onClick={handleCopyShareLink}
                disabled={isGeneratingShare}
                className="shrink-0"
              >
                {copied ? <Check className="w-4 h-4 mr-1 text-emerald-400" /> : <Copy className="w-4 h-4 mr-1" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>
          </div>

          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-400">
              Anyone with this link can view the complete itinerary, stays, and budget breakdown.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
