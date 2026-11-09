'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Users,
  Calendar,
  MapPin,
  Sparkles,
  Plane,
  Heart,
  Utensils,
  Zap,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Clock,
  Compass,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { QuestionnaireDraft, OccasionType, PaceType, DietaryType } from '@/lib/types';

interface AvailableDestination {
  id: string;
  slug: string;
  name: string;
  country: string;
  heroImage: string;
  cities: Array<{ id: string; slug: string; name: string }>;
}

interface QuestionnaireWizardProps {
  destinations: AvailableDestination[];
  initialDestinationSlug?: string;
}

const LOCAL_STORAGE_KEY = 'roamly_planning_draft';

export function QuestionnaireWizard({
  destinations,
  initialDestinationSlug,
}: QuestionnaireWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Default dates: 14 days ahead for 7 days
  const defaultStart = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
  const defaultEnd = new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0];

  const [draft, setDraft] = useState<QuestionnaireDraft>({
    adults: 2,
    children: 0,
    infants: 0,
    elders: 0,
    occasion: 'leisure',
    startDate: defaultStart,
    endDate: defaultEnd,
    destinationSlug: initialDestinationSlug || 'bali',
    selectedCitySlugs: [],
    departureAirport: 'DPS',
    returnAirport: 'DPS',
    pace: 'balanced',
    dietary: 'none',
    budgetTier: 'comfort',
    interests: ['culture', 'nature', 'food'],
  });

  // Restore draft from localStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setDraft((prev) => ({
          ...prev,
          ...parsed,
          destinationSlug: initialDestinationSlug || parsed.destinationSlug || prev.destinationSlug,
        }));
      }
    } catch {}
  }, [initialDestinationSlug]);

  // Persist draft to localStorage on edit
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draft));
    } catch {}
  }, [draft]);

  // Calculate duration & nights
  const startD = draft.startDate ? new Date(draft.startDate) : new Date();
  const endD = draft.endDate ? new Date(draft.endDate) : new Date();
  const diffDays = Math.max(1, Math.ceil((endD.getTime() - startD.getTime()) / 86400000));
  const diffNights = Math.max(1, diffDays - 1);

  // Travelers count
  const totalTravelers = draft.adults + draft.children + draft.infants + draft.elders;

  // Validation before advancing step
  const handleNextStep = () => {
    setValidationError(null);

    if (currentStep === 1) {
      if (draft.adults + draft.elders < 1) {
        setValidationError('At least one adult (18–59) or elder (60+) is required.');
        return;
      }
      if (draft.infants > 0 && draft.adults < 1) {
        setValidationError('Infants (0–2) must be accompanied by an adult.');
        return;
      }
    }

    if (currentStep === 2) {
      if (!draft.startDate || !draft.endDate) {
        setValidationError('Please select both start and end dates.');
        return;
      }
      if (new Date(draft.endDate) <= new Date(draft.startDate)) {
        setValidationError('Return date must be strictly after departure date.');
        return;
      }
    }

    if (currentStep === 3) {
      if (!draft.destinationSlug) {
        setValidationError('Please choose a destination.');
        return;
      }
    }

    setCurrentStep((prev) => Math.min(4, prev + 1) as any);
  };

  const handlePrevStep = () => {
    setValidationError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1) as any);
  };

  const handleSubmit = async () => {
    setValidationError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate itinerary');

      // Clear draft after creation
      localStorage.removeItem(LOCAL_STORAGE_KEY);

      // Navigate to the visual tripboard
      router.push(`/trips/${data.tripId}`);
    } catch (err: any) {
      setValidationError(err.message || 'Error creating trip');
      setIsSubmitting(false);
    }
  };

  const currentDestination =
    destinations.find((d) => d.slug === draft.destinationSlug) || destinations[0];

  const stepsLabels = [
    { num: 1, label: 'Who is traveling' },
    { num: 2, label: 'When & Duration' },
    { num: 3, label: 'Where to go' },
    { num: 4, label: 'How you travel' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Progress Indicators */}
      <div className="grid grid-cols-4 gap-2">
        {stepsLabels.map((s) => {
          const isDone = currentStep > s.num;
          const isActive = currentStep === s.num;
          return (
            <button
              key={s.num}
              type="button"
              onClick={() => {
                if (currentStep > s.num) setCurrentStep(s.num as any);
              }}
              className={`text-left p-3 rounded-2xl border transition-all ${
                isActive
                  ? 'bg-purple-950/80 border-purple-500 shadow-sm ring-1 ring-purple-500/50'
                  : isDone
                  ? 'bg-slate-900 border-purple-900/60 hover:border-purple-600'
                  : 'bg-slate-950/40 border-slate-800 text-slate-600 opacity-60 pointer-events-none'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isDone
                      ? 'bg-purple-600 text-white'
                      : isActive
                      ? 'bg-purple-500 text-white animate-pulse'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isDone ? <Check className="w-3 h-3" /> : s.num}
                </span>
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider ${
                    isActive ? 'text-purple-300' : 'text-slate-400'
                  }`}
                >
                  Step {s.num}
                </span>
              </div>
              <p className="text-xs font-semibold text-white truncate hidden sm:block">
                {s.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Validation alert */}
      {validationError && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 flex items-center gap-3 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Wizard Form Container */}
      <div className="rounded-3xl bg-slate-900/90 border border-purple-900/50 p-6 sm:p-10 shadow-2xl backdrop-blur-md">
        
        {/* STEP 1: WHO */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Step 1 of 4
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                Who is embarking on this journey?
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Tell us your travel group composition to configure rooms, pace, and activities.
              </p>
            </div>

            {/* Age Group Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Adults */}
              <div className="p-4 rounded-2xl bg-slate-800/70 border border-purple-950 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">Adults</h4>
                  <span className="text-xs text-slate-400">Age 18–59</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((p) => ({ ...p, adults: Math.max(0, p.adults - 1) }))
                    }
                    className="w-8 h-8 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-base text-white w-4 text-center">
                    {draft.adults}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDraft((p) => ({ ...p, adults: p.adults + 1 }))}
                    className="w-8 h-8 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="p-4 rounded-2xl bg-slate-800/70 border border-purple-950 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">Children</h4>
                  <span className="text-xs text-slate-400">Age 3–17</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((p) => ({ ...p, children: Math.max(0, p.children - 1) }))
                    }
                    className="w-8 h-8 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-base text-white w-4 text-center">
                    {draft.children}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDraft((p) => ({ ...p, children: p.children + 1 }))}
                    className="w-8 h-8 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Infants */}
              <div className="p-4 rounded-2xl bg-slate-800/70 border border-purple-950 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">Infants</h4>
                  <span className="text-xs text-slate-400">Age 0–2</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((p) => ({ ...p, infants: Math.max(0, p.infants - 1) }))
                    }
                    className="w-8 h-8 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-base text-white w-4 text-center">
                    {draft.infants}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDraft((p) => ({ ...p, infants: p.infants + 1 }))}
                    className="w-8 h-8 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Elders */}
              <div className="p-4 rounded-2xl bg-slate-800/70 border border-purple-950 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">Elders</h4>
                  <span className="text-xs text-slate-400">Age 60+</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((p) => ({ ...p, elders: Math.max(0, p.elders - 1) }))
                    }
                    className="w-8 h-8 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold text-base text-white w-4 text-center">
                    {draft.elders}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDraft((p) => ({ ...p, elders: p.elders + 1 }))}
                    className="w-8 h-8 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Optional Occasion */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                Special Occasion (Optional)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'leisure', label: '🌴 Leisure Vacation' },
                  { id: 'honeymoon', label: '💍 Honeymoon Escape' },
                  { id: 'family_vacation', label: '👨‍👩‍👦 Family Trip' },
                  { id: 'anniversary', label: '🥂 Anniversary' },
                  { id: 'birthday', label: '🎂 Birthday Celebration' },
                  { id: 'bachelor', label: '🎉 Friends / Bachelor' },
                ].map((occ) => (
                  <button
                    key={occ.id}
                    type="button"
                    onClick={() => setDraft((p) => ({ ...p, occasion: occ.id as any }))}
                    className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                      draft.occasion === occ.id
                        ? 'bg-purple-600 text-white border-purple-400 shadow-md ring-2 ring-purple-400/40'
                        : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {occ.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: WHEN */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Step 2 of 4
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                When are you planning to travel?
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Select your travel window. We will compute total days, nights, and regional seasons.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Departure Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={draft.startDate}
                    onChange={(e) => setDraft((p) => ({ ...p, startDate: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Return Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={draft.endDate}
                    onChange={(e) => setDraft((p) => ({ ...p, endDate: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Calculated Duration Banner */}
            <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-800/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-purple-400" />
                <div>
                  <h4 className="font-bold text-sm text-white">Calculated Duration</h4>
                  <p className="text-xs text-purple-300">
                    {diffDays} Days / {diffNights} Nights
                  </p>
                </div>
              </div>
              <Badge variant="purple" size="md">
                {diffNights} Nights Tripboard
              </Badge>
            </div>
          </div>
        )}

        {/* STEP 3: WHERE */}
        {currentStep === 3 && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Step 3 of 4
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                Where would you like to explore?
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Select your primary destination and departure / return airports.
              </p>
            </div>

            {/* Destination Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Choose Destination
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {destinations.map((d) => {
                  const isSelected = draft.destinationSlug === d.slug;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() =>
                        setDraft((p) => ({
                          ...p,
                          destinationSlug: d.slug,
                          selectedCitySlugs: d.cities.map((c) => c.slug),
                        }))
                      }
                      className={`relative rounded-2xl overflow-hidden border p-3 text-left transition-all flex flex-col justify-between h-36 ${
                        isSelected
                          ? 'border-purple-500 ring-2 ring-purple-500/50'
                          : 'border-slate-800 opacity-70 hover:opacity-100 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={d.heroImage}
                        alt={d.name}
                        className="absolute inset-0 w-full h-full object-cover -z-10"
                      />
                      <div className="absolute inset-0 bg-slate-950/60 -z-10" />

                      <div className="flex justify-between items-start">
                        <Badge variant="purple" size="sm">
                          {d.country}
                        </Badge>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-bold text-white text-base">{d.name}</h4>
                        <span className="text-[11px] text-slate-300">
                          {d.cities.length} Curated Regions
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* City Checkboxes for chosen destination */}
            {currentDestination && currentDestination.cities.length > 0 && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Select Regions to Include in Itinerary
                </label>
                <div className="flex flex-wrap gap-2">
                  {currentDestination.cities.map((city) => {
                    const isSelected =
                      draft.selectedCitySlugs?.includes(city.slug) ?? true;
                    return (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => {
                          const current = draft.selectedCitySlugs || [];
                          const updated = current.includes(city.slug)
                            ? current.filter((s) => s !== city.slug)
                            : [...current, city.slug];
                          setDraft((p) => ({ ...p, selectedCitySlugs: updated }));
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-500'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <MapPin className="w-3 h-3" />
                        <span>{city.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Airports */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Departure Airport (City or IATA)
                </label>
                <div className="relative">
                  <Plane className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={draft.departureAirport}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        departureAirport: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="DPS or JFK"
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm uppercase font-mono focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Return Airport (Independently Editable)
                </label>
                <div className="relative">
                  <Plane className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 rotate-180" />
                  <input
                    type="text"
                    value={draft.returnAirport}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        returnAirport: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="DPS or JFK"
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm uppercase font-mono focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: HOW */}
        {currentStep === 4 && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Step 4 of 4
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                How do you prefer to travel?
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Specify your ideal pace, dining preferences, and travel focus.
              </p>
            </div>

            {/* Travel Pace */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                Itinerary Pace
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'relaxed',
                    label: 'Relaxed & Slow',
                    desc: '1–2 activities daily with generous pool and cafe time',
                  },
                  {
                    id: 'balanced',
                    label: 'Balanced',
                    desc: '2–3 activities per day, smooth transfers and dinners',
                  },
                  {
                    id: 'packed',
                    label: 'Action-Packed',
                    desc: '3–4 activities daily maximizing sights and early starts',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDraft((p) => ({ ...p, pace: item.id as PaceType }))}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      draft.pace === item.id
                        ? 'bg-purple-950/80 border-purple-500 ring-2 ring-purple-500/40'
                        : 'bg-slate-800/80 border-slate-700/60 hover:bg-slate-800'
                    }`}
                  >
                    <h4 className="font-bold text-sm text-white mb-1">{item.label}</h4>
                    <p className="text-[11px] text-slate-400 leading-snug">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary Preference */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                Dietary Preference
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'none', label: 'No Restrictions' },
                  { id: 'vegetarian', label: 'Vegetarian Only' },
                  { id: 'egg', label: 'Eggetarian' },
                  { id: 'vegan', label: '100% Plant-Based' },
                ].map((diet) => (
                  <button
                    key={diet.id}
                    type="button"
                    onClick={() =>
                      setDraft((p) => ({ ...p, dietary: diet.id as DietaryType }))
                    }
                    className={`p-3 rounded-xl border text-xs font-medium text-center transition-all ${
                      draft.dietary === diet.id
                        ? 'bg-purple-600 text-white border-purple-400 font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {diet.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Style Interests */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                Key Interests & Themes
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Ancient Culture & Temples',
                  'Beach Clubs & Sunsets',
                  'Local Food & Cooking',
                  'Nature & Volcano Treks',
                  'Surfing & Water Sports',
                  'Wellness & Spas',
                ].map((interest) => {
                  const isSelected = draft.interests?.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => {
                        const cur = draft.interests || [];
                        const updated = isSelected
                          ? cur.filter((i) => i !== interest)
                          : [...cur, interest];
                        setDraft((p) => ({ ...p, interests: updated }));
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-purple-600/40 text-purple-200 border-purple-400'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation */}
        <div className="mt-10 pt-6 border-t border-purple-950/60 flex items-center justify-between">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrevStep}
              className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Back</span>
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <Button type="button" size="md" onClick={handleNextStep}>
              <span>Continue</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              isLoading={isSubmitting}
              onClick={handleSubmit}
              className="font-bold shadow-lg shadow-purple-600/40"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span>Generate My Visual Tripboard</span>
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}

