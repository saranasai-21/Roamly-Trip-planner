'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  MapPin,
  Sparkles,
  Copy,
  Trash2,
  Archive,
  Edit,
  ArrowRight,
  Share2,
  Plus,
  Compass,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';

interface MyTripsDashboardProps {
  initialTrips: any[];
  currentUser: any;
}

export function MyTripsDashboard({ initialTrips, currentUser }: MyTripsDashboardProps) {
  const router = useRouter();
  const [trips, setTrips] = useState(initialTrips);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  // Rename modal
  const [renamingTrip, setRenamingTrip] = useState<any | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  const filteredTrips = trips.filter((t) =>
    activeTab === 'archived' ? t.status === 'archived' : t.status !== 'archived'
  );

  const handleOpenRename = (trip: any) => {
    setRenamingTrip(trip);
    setNewTitle(trip.title);
  };

  const handleSaveRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingTrip || !newTitle.trim()) return;
    setIsRenaming(true);

    try {
      const res = await fetch(`/api/trips/${renamingTrip.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setTrips((prev) =>
        prev.map((t) => (t.id === renamingTrip.id ? { ...t, title: newTitle.trim() } : t))
      );
      setRenamingTrip(null);
    } catch (err: any) {
      alert(err.message || 'Error renaming trip');
    } finally {
      setIsRenaming(false);
    }
  };

  const handleToggleArchive = async (trip: any) => {
    const nextStatus = trip.status === 'archived' ? 'active' : 'archived';
    try {
      const res = await fetch(`/api/trips/${trip.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');

      setTrips((prev) =>
        prev.map((t) => (t.id === trip.id ? { ...t, status: nextStatus } : t))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm('Are you sure you want to permanently delete this trip? This action cannot be undone.'))
      return;

    try {
      const res = await fetch(`/api/trips/${tripId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');

      setTrips((prev) => prev.filter((t) => t.id !== tripId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDuplicateTrip = async (tripId: string) => {
    try {
      const res = await fetch(`/api/trips/${tripId}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push(`/trips/${data.tripId}`);
    } catch (err: any) {
      alert(err.message || 'Error duplicating trip');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'active'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Active Tripboards ({trips.filter((t) => t.status !== 'archived').length})
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'archived'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Archived ({trips.filter((t) => t.status === 'archived').length})
          </button>
        </div>

        <Link href="/plan">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Plan New Trip</span>
          </Button>
        </Link>
      </div>

      {/* Trips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrips.map((trip) => {
          const startFormatted = new Date(trip.startDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
          const endFormatted = new Date(trip.endDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });

          return (
            <div
              key={trip.id}
              className="group rounded-2xl bg-white border border-slate-200/90 hover:border-purple-400 p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <Badge variant="purple" size="sm">
                    {trip.destination.name} &bull; {trip.nights} Nights
                  </Badge>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {trip.adults} Travelers
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 mt-2 line-clamp-1 group-hover:text-purple-600 transition-colors">
                  {trip.title}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {startFormatted} – {endFormatted}
                  </span>
                </div>

                {/* Cities included */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {trip.cities.map((tc: any, i: number) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200"
                    >
                      {tc.city.name} ({tc.nights}N)
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link href={`/trips/${trip.id}`}>
                  <Button size="sm">
                    Open Board &rarr;
                  </Button>
                </Link>

                <div className="flex items-center gap-1 text-slate-400">
                  <button
                    onClick={() => handleOpenRename(trip)}
                    className="p-1.5 rounded hover:bg-slate-100 hover:text-slate-800 transition-colors"
                    title="Rename Trip"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDuplicateTrip(trip.id)}
                    className="p-1.5 rounded hover:bg-slate-100 hover:text-slate-800 transition-colors"
                    title="Duplicate Trip"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleToggleArchive(trip)}
                    className="p-1.5 rounded hover:bg-slate-100 hover:text-slate-800 transition-colors"
                    title={trip.status === 'archived' ? 'Restore Trip' : 'Archive Trip'}
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTrip(trip.id)}
                    className="p-1.5 rounded hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    title="Delete Trip"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTrips.length === 0 && (
          <div className="col-span-full p-16 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
            <Compass className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No trips found in this view.</p>
            <Link href="/plan">
              <Button size="sm">
                Create a Trip with AI Wizard
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Rename Modal */}
      <Modal
        isOpen={!!renamingTrip}
        onClose={() => setRenamingTrip(null)}
        title="Rename Tripboard"
        maxWidth="sm"
      >
        <form onSubmit={handleSaveRename} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Trip Title
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRenamingTrip(null)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isRenaming}>
              Save Name
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

