'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TripboardHeader, TripTab } from './TripboardHeader';
import { OverviewTab } from './OverviewTab';
import { ItineraryTab } from './ItineraryTab';
import { StaysTab } from './StaysTab';
import { ExploreTab } from './ExploreTab';
import { BudgetTab } from './BudgetTab';
import { AIPanel } from '../ai/AIPanel';
import { ExpertEnquiryModal } from '../expert/ExpertEnquiryModal';

interface TripboardWorkspaceProps {
  initialTrip: any;
  isReadOnly?: boolean;
}

export function TripboardWorkspace({
  initialTrip,
  isReadOnly = false,
}: TripboardWorkspaceProps) {
  const router = useRouter();
  const [trip, setTrip] = useState(initialTrip);
  const [activeTab, setActiveTab] = useState<TripTab>('overview');

  // Modals state
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isExpertOpen, setIsExpertOpen] = useState(false);

  const handleUpdateTrip = (updatedTrip: any) => {
    setTrip(updatedTrip);
  };

  const handleDuplicateTrip = async () => {
    try {
      const res = await fetch(`/api/trips/${trip.id}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/trips/${data.tripId}`);
    } catch (err: any) {
      alert(err.message || 'Error duplicating trip');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col justify-between">
      <div>
        {/* Sticky Tripboard Header */}
        <TripboardHeader
          trip={trip}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenAi={() => setIsAiOpen(true)}
          onOpenExpert={() => setIsExpertOpen(true)}
          onDuplicateTrip={handleDuplicateTrip}
          isReadOnly={isReadOnly}
        />

        {/* Tab Content Body */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {activeTab === 'overview' && (
            <OverviewTab
              trip={trip}
              onNavigateTab={setActiveTab}
              onOpenExpert={() => setIsExpertOpen(true)}
            />
          )}

          {activeTab === 'itinerary' && (
            <ItineraryTab
              trip={trip}
              onUpdateTrip={handleUpdateTrip}
              isReadOnly={isReadOnly}
            />
          )}

          {activeTab === 'stays' && (
            <StaysTab
              trip={trip}
              onUpdateTrip={handleUpdateTrip}
              isReadOnly={isReadOnly}
            />
          )}

          {activeTab === 'explore' && (
            <ExploreTab
              trip={trip}
              onUpdateTrip={handleUpdateTrip}
              isReadOnly={isReadOnly}
            />
          )}

          {activeTab === 'budget' && (
            <BudgetTab
              trip={trip}
              onUpdateTrip={handleUpdateTrip}
              isReadOnly={isReadOnly}
            />
          )}
        </main>
      </div>

      {/* Slide-over Contextual AI Panel */}
      <AIPanel
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        trip={trip}
        onUpdateTrip={handleUpdateTrip}
      />

      {/* Travel Specialist Enquiry Modal */}
      <ExpertEnquiryModal
        isOpen={isExpertOpen}
        onClose={() => setIsExpertOpen(false)}
        trip={trip}
      />
    </div>
  );
}

