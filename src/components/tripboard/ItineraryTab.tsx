'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Copy,
  Lock,
  Unlock,
  Edit2,
  AlertTriangle,
  Move,
  Plane,
  Utensils,
  Car,
  Hotel,
  Sun,
  Sparkles,
  Layers,
  Map,
  X,
  ChevronDown,
  Compass,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Drawer } from '../ui/Drawer';
import { TripMap, MapMarker } from '../map/TripMap';
import { formatCurrency } from '@/lib/money';
import { analyzeDaySchedule, ScheduleIssue } from '@/lib/schedule';
import { ItineraryItemType, PriceBasis } from '@/lib/types';

interface ItineraryTabProps {
  trip: any;
  onUpdateTrip: (updatedTrip: any) => void;
  isReadOnly?: boolean;
}

export function ItineraryTab({
  trip,
  onUpdateTrip,
  isReadOnly = false,
}: ItineraryTabProps) {
  const [viewMode, setViewMode] = useState<'detailed' | 'compact'>('detailed');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null); // null = all days
  const [showMap, setShowMap] = useState<boolean>(true);

  // Detail Drawer state
  const [activeDrawerItem, setActiveDrawerItem] = useState<any | null>(null);

  // Add / Edit Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [targetDayId, setTargetDayId] = useState<string>('');

  // Save / undo feedback state
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  // Filter days based on mobile selector or all
  const displayedDays = selectedDayNumber
    ? trip.days.filter((d: any) => d.dayNumber === selectedDayNumber)
    : trip.days;

  // Build map markers
  const markers: MapMarker[] = displayedDays.flatMap((day: any) =>
    day.items
      .filter((i: any) => typeof i.lat === 'number' && typeof i.lng === 'number')
      .map((i: any) => ({
        id: i.id,
        title: i.title,
        lat: i.lat,
        lng: i.lng,
        dayNumber: day.dayNumber,
        type: i.type,
      }))
  );

  // Analyze schedule conflicts
  const scheduleIssues: Record<string, ScheduleIssue[]> = {};
  trip.days.forEach((day: any) => {
    scheduleIssues[day.id] = analyzeDaySchedule(day.items);
  });

  const allIssuesCount = Object.values(scheduleIssues).reduce(
    (sum, list) => sum + list.length,
    0
  );

  // CRUD Actions
  const handleToggleLock = async (itemId: string, currentLocked: boolean) => {
    if (isReadOnly) return;
    setSaveStatus('saving');
    try {
      const res = await fetch(`/api/trips/${trip.id}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLocked: !currentLocked }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Local state update
      const updatedDays = trip.days.map((day: any) => ({
        ...day,
        items: day.items.map((i: any) =>
          i.id === itemId ? { ...i, isLocked: !currentLocked } : i
        ),
      }));
      onUpdateTrip({ ...trip, days: updatedDays });
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (isReadOnly) return;
    if (!confirm('Are you sure you want to remove this item from your itinerary?')) return;
    setSaveStatus('saving');
    try {
      const res = await fetch(`/api/trips/${trip.id}/items/${itemId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete item');

      const updatedDays = trip.days.map((day: any) => ({
        ...day,
        items: day.items.filter((i: any) => i.id !== itemId),
      }));
      onUpdateTrip({ ...trip, days: updatedDays });
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  };

  const handleDuplicateItem = async (item: any, dayId: string) => {
    if (isReadOnly) return;
    setSaveStatus('saving');
    try {
      const res = await fetch(`/api/trips/${trip.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayId,
          type: item.type,
          title: `${item.title} (Copy)`,
          startTime: item.startTime,
          endTime: item.endTime,
          durationMinutes: item.durationMinutes,
          locationName: item.locationName,
          costMinor: item.costMinor,
          priceBasis: item.priceBasis,
          notes: item.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const updatedDays = trip.days.map((day: any) =>
        day.id === dayId ? { ...day, items: [...day.items, data.item] } : day
      );
      onUpdateTrip({ ...trip, days: updatedDays });
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  };

  const handleMoveItemToDay = async (itemId: string, newDayId: string) => {
    if (isReadOnly) return;
    setSaveStatus('saving');
    try {
      const res = await fetch(`/api/trips/${trip.id}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayId: newDayId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Re-fetch or re-distribute item
      let movedItem: any = null;
      trip.days.forEach((d: any) => {
        const found = d.items.find((i: any) => i.id === itemId);
        if (found) movedItem = { ...found, dayId: newDayId };
      });

      const updatedDays = trip.days.map((d: any) => ({
        ...d,
        items:
          d.id === newDayId
            ? [...d.items, movedItem]
            : d.items.filter((i: any) => i.id !== itemId),
      }));

      onUpdateTrip({ ...trip, days: updatedDays });
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  };

  const handleSaveItemModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    setSaveStatus('saving');

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const payload = {
      type: formData.get('type') as string,
      title: formData.get('title') as string,
      startTime: formData.get('startTime') as string,
      endTime: formData.get('endTime') as string,
      durationMinutes: parseInt(formData.get('durationMinutes') as string, 10) || 60,
      locationName: formData.get('locationName') as string,
      costMinor: Math.round(parseFloat(formData.get('costMajor') as string || '0') * 100),
      priceBasis: formData.get('priceBasis') as string,
      notes: formData.get('notes') as string,
    };

    try {
      if (editingItem) {
        // Update existing item
        const res = await fetch(`/api/trips/${trip.id}/items/${editingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        const updatedDays = trip.days.map((day: any) => ({
          ...day,
          items: day.items.map((i: any) =>
            i.id === editingItem.id ? { ...i, ...payload } : i
          ),
        }));
        onUpdateTrip({ ...trip, days: updatedDays });
      } else {
        // Add new item
        const res = await fetch(`/api/trips/${trip.id}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, dayId: targetDayId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        const updatedDays = trip.days.map((day: any) =>
          day.id === targetDayId
            ? { ...day, items: [...day.items, data.item] }
            : day
        );
        onUpdateTrip({ ...trip, days: updatedDays });
      }

      setIsEditModalOpen(false);
      setEditingItem(null);
      setSaveStatus('saved');
    } catch (err: any) {
      alert(err.message || 'Error saving item');
      setSaveStatus('error');
    }
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'activity':
        return <Compass className="w-3.5 h-3.5 text-purple-600" />;
      case 'meal':
        return <Utensils className="w-3.5 h-3.5 text-amber-600" />;
      case 'flight':
        return <Plane className="w-3.5 h-3.5 text-sky-600" />;
      case 'transfer':
        return <Car className="w-3.5 h-3.5 text-indigo-600" />;
      case 'stay':
        return <Hotel className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Sun className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Itinerary Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Day selection on mobile / filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Filter Day:</span>
            <select
              value={selectedDayNumber ?? ''}
              onChange={(e) =>
                setSelectedDayNumber(e.target.value ? parseInt(e.target.value, 10) : null)
              }
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-purple-500"
            >
              <option value="">All Days ({trip.days.length} Days)</option>
              {trip.days.map((d: any) => (
                <option key={d.id} value={d.dayNumber}>
                  Day {d.dayNumber} ({d.city.name})
                </option>
              ))}
            </select>
          </div>

          {/* Detailed vs Compact Toggle */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/60">
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'detailed'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Detailed
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'compact'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Compact
            </button>
          </div>

          {/* Toggle Map View */}
          <button
            onClick={() => setShowMap(!showMap)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
              showMap
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
          </button>
        </div>

        {/* Autosave Status Indicator */}
        <div className="flex items-center gap-2 text-xs">
          {saveStatus === 'saving' && (
            <span className="text-amber-600 flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Autosaving changes...</span>
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-slate-400 flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>All edits synced</span>
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-rose-600 font-medium">
              Failed to sync edit.
            </span>
          )}
        </div>
      </div>

      {/* Schedule Warning Banner (if conflicts or tight connections exist) */}
      {allIssuesCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">
              {allIssuesCount} Schedule Optimization Opportunity{allIssuesCount > 1 ? 'ies' : ''} Detected
            </span>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              We identified potential timing overlaps or short transit gaps between destinations on your board. You can adjust times or ask the AI to rebalance.
            </p>
          </div>
        </div>
      )}

      {/* Interactive Trip Map (MapLibre + fallback) */}
      {showMap && (
        <TripMap
          markers={markers}
          heightClass="h-72 sm:h-80"
          onSelectMarker={(m) => {
            const foundDay = trip.days.find((d: any) => d.dayNumber === m.dayNumber);
            if (foundDay) {
              const foundItem = foundDay.items.find((i: any) => i.id === m.id);
              if (foundItem) setActiveDrawerItem(foundItem);
            }
          }}
        />
      )}

      {/* Horizontal Day Columns (Desktop) / Vertically Stacked (Mobile) */}
      <div className="flex flex-col lg:flex-row gap-5 overflow-x-auto pb-4 pt-1 items-start">
        {displayedDays.map((day: any) => {
          const dayDate = new Date(day.date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });
          const dayIssues = scheduleIssues[day.id] || [];

          return (
            <div
              key={day.id}
              className="w-full lg:w-[320px] shrink-0 rounded-2xl bg-slate-50 border border-slate-200/90 p-4 space-y-4 shadow-sm flex flex-col justify-between"
            >
              {/* Day Header */}
              <div className="border-b border-slate-200/70 pb-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-purple-700 bg-purple-100/70 px-2.5 py-0.5 rounded-lg">
                    Day {day.dayNumber}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {dayDate}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {day.city.name}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {day.items.length} {day.items.length === 1 ? 'stop' : 'stops'}
                  </span>
                </div>
              </div>

              {/* Day Warnings */}
              {dayIssues.length > 0 && (
                <div className="p-2 rounded-lg bg-amber-100/70 border border-amber-300 text-[10px] text-amber-900 space-y-0.5">
                  {dayIssues.map((issue, idx) => (
                    <p key={idx} className="truncate">
                      &bull; {issue.message}
                    </p>
                  ))}
                </div>
              )}

              {/* Day Itinerary Items List */}
              <div className="space-y-3 min-h-[140px]">
                {day.items.map((item: any) => {
                  const isCompact = viewMode === 'compact';

                  return (
                    <div
                      key={item.id}
                      className={`group rounded-xl border bg-white transition-all shadow-sm ${
                        item.isLocked
                          ? 'border-purple-300 ring-1 ring-purple-200'
                          : 'border-slate-200/80 hover:border-purple-400'
                      } ${isCompact ? 'p-2.5' : 'p-3.5'} space-y-2`}
                    >
                      {/* Top item row: icon, type, time, lock */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center">
                            {getItemTypeIcon(item.type)}
                          </div>
                          {item.startTime && (
                            <span className="text-[11px] font-mono font-bold text-slate-600">
                              {item.startTime}
                              {item.endTime ? ` - ${item.endTime}` : ''}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {!isReadOnly && (
                            <button
                              type="button"
                              onClick={() => handleToggleLock(item.id, item.isLocked)}
                              className={`p-1 rounded hover:bg-slate-100 transition-colors ${
                                item.isLocked ? 'text-purple-600' : 'text-slate-300 hover:text-slate-600'
                              }`}
                              title={item.isLocked ? 'Locked (Protected from AI)' : 'Lock item'}
                            >
                              {item.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Title and Drawer Trigger */}
                      <div>
                        <h4
                          onClick={() => setActiveDrawerItem(item)}
                          className="font-bold text-xs sm:text-sm text-slate-900 cursor-pointer hover:text-purple-600 transition-colors line-clamp-2"
                        >
                          {item.title}
                        </h4>
                        {item.locationName && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{item.locationName}</span>
                          </div>
                        )}
                      </div>

                      {/* Detailed Mode specifics: Cost, Basis & Notes */}
                      {!isCompact && (
                        <>
                          {item.notes && (
                            <p className="text-[11px] text-slate-500 italic line-clamp-2 border-l-2 border-slate-200 pl-2">
                              {item.notes}
                            </p>
                          )}

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-slate-700">
                              {item.costMinor > 0
                                ? formatCurrency(item.costMinor, item.currency)
                                : 'Included / Free'}
                            </span>
                            <span className="text-slate-400 text-[10px] capitalize">
                              {item.priceBasis?.replace('_', ' ') || 'Per Person'}
                            </span>
                          </div>
                        </>
                      )}

                      {/* Card Action buttons (Edit, Duplicate, Delete, Move) */}
                      {!isReadOnly && (
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-1 text-slate-400">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingItem(item);
                                setTargetDayId(day.id);
                                setIsEditModalOpen(true);
                              }}
                              className="p-1 rounded hover:bg-slate-100 hover:text-slate-800 transition-colors"
                              title="Edit stop"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateItem(item, day.id)}
                              className="p-1 rounded hover:bg-slate-100 hover:text-slate-800 transition-colors"
                              title="Duplicate stop"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1 rounded hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title="Remove stop"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Quick inter-day mover */}
                          <select
                            onChange={(e) => {
                              if (e.target.value) handleMoveItemToDay(item.id, e.target.value);
                            }}
                            defaultValue=""
                            className="text-[10px] bg-slate-50 border border-slate-200 text-slate-500 rounded px-1.5 py-0.5 focus:outline-none"
                            title="Move item to another day"
                          >
                            <option value="" disabled>Move Day &darr;</option>
                            {trip.days.map((d: any) => (
                              <option key={d.id} value={d.id} disabled={d.id === day.id}>
                                Day {d.dayNumber} ({d.city.name})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}

                {day.items.length === 0 && (
                  <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    No items scheduled for this day yet.
                  </div>
                )}
              </div>

              {/* Add item button for this day */}
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setTargetDayId(day.id);
                    setIsEditModalOpen(true);
                  }}
                  className="w-full py-2 rounded-xl border border-dashed border-slate-300 hover:border-purple-500 hover:bg-purple-50/50 text-xs font-bold text-slate-600 hover:text-purple-700 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Stop / Activity</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Activity Details Drawer */}
      <Drawer
        isOpen={!!activeDrawerItem}
        onClose={() => setActiveDrawerItem(null)}
        title={activeDrawerItem?.title || 'Stop Details'}
        subtitle={activeDrawerItem?.locationName || 'Scheduled Itinerary Stop'}
      >
        {activeDrawerItem && (
          <div className="space-y-6">
            {/* If linked to an activity with image */}
            {activeDrawerItem.activity?.coverImage && (
              <div className="h-52 w-full rounded-2xl overflow-hidden bg-slate-100">
                <img
                  src={activeDrawerItem.activity.coverImage}
                  alt={activeDrawerItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Quick Meta */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Type:</span>
                <span className="font-bold text-slate-800 capitalize">
                  {activeDrawerItem.type}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Duration:</span>
                <span className="font-bold text-slate-800">
                  {activeDrawerItem.durationMinutes || 120} Minutes
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Time Slot:</span>
                <span className="font-bold text-slate-800">
                  {activeDrawerItem.startTime || 'Unscheduled'}
                  {activeDrawerItem.endTime ? ` - ${activeDrawerItem.endTime}` : ''}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Est. Cost:</span>
                <span className="font-bold text-purple-700">
                  {activeDrawerItem.costMinor > 0
                    ? formatCurrency(activeDrawerItem.costMinor, activeDrawerItem.currency)
                    : 'Included / Free'}
                </span>
              </div>
            </div>

            {/* Description */}
            {activeDrawerItem.activity?.description && (
              <div>
                <h4 className="font-bold text-xs text-slate-900 mb-1">About This Place</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {activeDrawerItem.activity.description}
                </p>
              </div>
            )}

            {/* Practical Notes */}
            {activeDrawerItem.notes && (
              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900">
                <span className="font-bold block mb-0.5">Your Trip Notes:</span>
                <p className="text-purple-800 text-[11px] leading-relaxed">
                  {activeDrawerItem.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Add / Edit Item Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? 'Edit Itinerary Stop' : 'Add Stop to Itinerary'}
        description="Update schedule times, location, price basis, or traveler notes."
        maxWidth="md"
      >
        <form onSubmit={handleSaveItemModal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Stop Category
            </label>
            <select
              name="type"
              defaultValue={editingItem?.type || 'activity'}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:border-purple-500 focus:outline-none"
            >
              <option value="activity">Activity / Sights</option>
              <option value="meal">Meal / Dining</option>
              <option value="transfer">Transfer / Transit</option>
              <option value="flight">Flight</option>
              <option value="stay">Stay / Check-in</option>
              <option value="free_time">Free Time / Leisure</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              required
              defaultValue={editingItem?.title || ''}
              placeholder="e.g. Sunset Surf Lesson or Ubud Market"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                name="startTime"
                defaultValue={editingItem?.startTime || '10:00'}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                name="endTime"
                defaultValue={editingItem?.endTime || '12:00'}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Cost ($ USD)
              </label>
              <input
                type="number"
                step="0.01"
                name="costMajor"
                defaultValue={editingItem ? (editingItem.costMinor / 100).toFixed(2) : '0'}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Price Basis
              </label>
              <select
                name="priceBasis"
                defaultValue={editingItem?.priceBasis || 'per_person'}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-purple-500 focus:outline-none"
              >
                <option value="per_person">Per Person</option>
                <option value="per_group">Per Group</option>
                <option value="per_room_night">Per Room / Night</option>
                <option value="per_booking">Per Booking</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Location / Venue Name
            </label>
            <input
              type="text"
              name="locationName"
              defaultValue={editingItem?.locationName || ''}
              placeholder="e.g. Seminyak Beach or Paon Village"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Private Traveler Notes
            </label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={editingItem?.notes || ''}
              placeholder="e.g. Bring sun protection and cash for warung."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingItem(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save Stop
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
