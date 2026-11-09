'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Compass,
  Clock,
  MapPin,
  Check,
  AlertCircle,
  Accessibility,
  Info,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Drawer } from '../ui/Drawer';
import { formatCurrency } from '@/lib/money';

interface ExploreTabProps {
  trip: any;
  onUpdateTrip: (updatedTrip: any) => void;
  isReadOnly?: boolean;
}

export function ExploreTab({
  trip,
  onUpdateTrip,
  isReadOnly = false,
}: ExploreTabProps) {
  const [selectedCitySlug, setSelectedCitySlug] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add to Trip Modal State
  const [targetActivity, setTargetActivity] = useState<any | null>(null);
  const [targetDayId, setTargetDayId] = useState<string>(trip.days[0]?.id || '');
  const [targetTimeSlot, setTargetTimeSlot] = useState<string>('10:00');
  const [isAdding, setIsAdding] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Drawer for activity
  const [activeActivityDrawer, setActiveActivityDrawer] = useState<any | null>(null);

  // Collect all activities from trip's destination cities
  const allActivities: any[] = trip.destination.cities.flatMap(
    (c: any) => c.activities || []
  );

  // Filter activities
  const filteredActivities = allActivities.filter((act) => {
    const matchesCity =
      selectedCitySlug === 'all' || act.city?.slug === selectedCitySlug;
    const matchesCategory =
      selectedCategory === 'all' || act.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCity && matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'culture', label: 'Culture & Temples' },
    { id: 'nature', label: 'Nature & Trails' },
    { id: 'food', label: 'Food & Culinary' },
    { id: 'adventure', label: 'Adventure & Surfing' },
    { id: 'entertainment', label: 'Beach Clubs & Nightlife' },
    { id: 'historic_sites', label: 'Historic Sites' },
  ];

  // Check if an activity is already added on the trip
  const isActivityOnTrip = (activityId: string) => {
    return trip.days.some((d: any) =>
      d.items.some((i: any) => i.activityId === activityId)
    );
  };

  const handleOpenAddModal = (activity: any) => {
    setTargetActivity(activity);
    setTargetDayId(trip.days[0]?.id || '');
    setTargetTimeSlot('10:00');

    // Check if already on trip
    if (isActivityOnTrip(activity.id)) {
      setConflictWarning(
        `Notice: "${activity.title}" is already scheduled on your itinerary. Adding again will schedule an additional visit.`
      );
    } else {
      setConflictWarning(null);
    }
  };

  const handleConfirmAddToTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !targetActivity) return;
    setIsAdding(true);

    try {
      const res = await fetch(`/api/trips/${trip.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayId: targetDayId,
          type: 'activity',
          activityId: targetActivity.id,
          title: targetActivity.title,
          startTime: targetTimeSlot,
          durationMinutes: targetActivity.durationMinutes,
          locationName: targetActivity.address || targetActivity.city?.name,
          lat: targetActivity.lat,
          lng: targetActivity.lng,
          costMinor: targetActivity.estimatedCostMinor,
          priceBasis: 'per_person',
          notes: targetActivity.practicalTips,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Local state update
      const updatedDays = trip.days.map((day: any) =>
        day.id === targetDayId
          ? { ...day, items: [...day.items, data.item] }
          : day
      );
      onUpdateTrip({ ...trip, days: updatedDays });

      setTargetActivity(null);
    } catch (err: any) {
      alert(err.message || 'Error adding activity to trip');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search & Category Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search activities, sacred temples, surf coves, or beach clubs..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2 text-xs focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* City Switcher */}
          <select
            value={selectedCitySlug}
            onChange={(e) => setSelectedCitySlug(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 focus:border-purple-500 focus:outline-none"
          >
            <option value="all">All Cities & Regions</option>
            {trip.destination.cities.map((c: any) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map((act) => {
          const alreadyAdded = isActivityOnTrip(act.id);
          let highlights: string[] = [];
          try {
            highlights = JSON.parse(act.highlights);
          } catch {
            highlights = [];
          }

          return (
            <div
              key={act.id}
              className="group rounded-2xl bg-white border border-slate-200/90 hover:border-purple-400 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Cover Image */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={act.coverImage}
                    alt={act.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant="purple" size="sm" className="bg-white/90 backdrop-blur-md text-purple-800 border-purple-200 font-bold">
                      {act.category?.replace('_', ' ')}
                    </Badge>
                  </div>

                  {alreadyAdded && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="emerald" size="sm" className="bg-emerald-600 text-white border-0 font-bold">
                        <Check className="w-3 h-3" />
                        <span>On Itinerary</span>
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-purple-600" />
                      <span>{act.durationMinutes} mins</span>
                    </span>
                    <span className="font-semibold text-slate-700">
                      {act.estimatedCostMinor > 0
                        ? formatCurrency(act.estimatedCostMinor, act.currency)
                        : 'Free Entry'}
                    </span>
                  </div>

                  <h4
                    onClick={() => setActiveActivityDrawer(act)}
                    className="font-bold text-sm text-slate-900 cursor-pointer hover:text-purple-600 transition-colors line-clamp-1"
                  >
                    {act.title}
                  </h4>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {act.description}
                  </p>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {highlights.slice(0, 2).map((h, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 truncate max-w-[200px]"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveActivityDrawer(act)}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700"
                >
                  View Details &rarr;
                </button>

                {!isReadOnly && (
                  <Button
                    size="sm"
                    variant={alreadyAdded ? 'outline' : 'primary'}
                    onClick={() => handleOpenAddModal(act)}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>{alreadyAdded ? 'Add Again' : 'Add to Trip'}</span>
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {filteredActivities.length === 0 && (
          <div className="col-span-full p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
            No activities match your current search and category filters.
          </div>
        )}
      </div>

      {/* Add To Trip Modal */}
      <Modal
        isOpen={!!targetActivity}
        onClose={() => setTargetActivity(null)}
        title="Schedule Activity into Itinerary"
        description={targetActivity?.title}
        maxWidth="md"
      >
        <form onSubmit={handleConfirmAddToTrip} className="space-y-4">
          {conflictWarning && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{conflictWarning}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Trip Day
            </label>
            <select
              value={targetDayId}
              onChange={(e) => setTargetDayId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:border-purple-500 focus:outline-none"
            >
              {trip.days.map((d: any) => (
                <option key={d.id} value={d.id}>
                  Day {d.dayNumber}: {d.city.name} ({new Date(d.date).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Preferred Time Slot
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Morning (09:00)', time: '09:00' },
                { label: 'Afternoon (14:00)', time: '14:00' },
                { label: 'Sunset (17:00)', time: '17:00' },
              ].map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  onClick={() => setTargetTimeSlot(slot.time)}
                  className={`p-2 rounded-xl text-xs font-medium border transition-all ${
                    targetTimeSlot === slot.time
                      ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTargetActivity(null)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isAdding}>
              Confirm & Add to Day
            </Button>
          </div>
        </form>
      </Modal>

      {/* Activity Details Drawer */}
      <Drawer
        isOpen={!!activeActivityDrawer}
        onClose={() => setActiveActivityDrawer(null)}
        title={activeActivityDrawer?.title || 'Experience Details'}
        subtitle={activeActivityDrawer?.address || activeActivityDrawer?.city?.name}
      >
        {activeActivityDrawer && (
          <div className="space-y-6">
            <div className="h-56 w-full rounded-2xl overflow-hidden bg-slate-100">
              <img
                src={activeActivityDrawer.coverImage}
                alt={activeActivityDrawer.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Duration:</span>
                <span className="font-bold text-slate-800">
                  {activeActivityDrawer.durationMinutes} Minutes
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Est. Cost:</span>
                <span className="font-bold text-purple-700">
                  {activeActivityDrawer.estimatedCostMinor > 0
                    ? formatCurrency(activeActivityDrawer.estimatedCostMinor, activeActivityDrawer.currency)
                    : 'Included / Free'}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs text-slate-900 mb-1">Overview</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activeActivityDrawer.description}
              </p>
            </div>

            {activeActivityDrawer.practicalTips && (
              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900">
                <span className="font-bold block mb-1">Practical Advice:</span>
                <p className="text-purple-800 text-[11px] leading-relaxed">
                  {activeActivityDrawer.practicalTips}
                </p>
              </div>
            )}

            {activeActivityDrawer.accessibilityNotes && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                <Accessibility className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">Accessibility Information:</span>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    {activeActivityDrawer.accessibilityNotes}
                  </p>
                </div>
              </div>
            )}

            {!isReadOnly && (
              <Button
                size="md"
                className="w-full"
                onClick={() => {
                  const act = activeActivityDrawer;
                  setActiveActivityDrawer(null);
                  handleOpenAddModal(act);
                }}
              >
                Schedule on Itinerary &rarr;
              </Button>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
