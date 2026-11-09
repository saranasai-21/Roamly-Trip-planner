'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  FileText,
  Upload,
  AlertCircle,
  HelpCircle,
  Building,
  Plane,
  Compass,
  Car,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import {
  formatCurrency,
  convertCurrency,
  computeItemTotalCost,
  SUPPORTED_CURRENCIES,
  EXCHANGE_RATE_TIMESTAMP,
} from '@/lib/money';
import { BookingStatus, PriceBasis } from '@/lib/types';

interface BudgetTabProps {
  trip: any;
  onUpdateTrip: (updatedTrip: any) => void;
  isReadOnly?: boolean;
}

export function BudgetTab({ trip, onUpdateTrip, isReadOnly = false }: BudgetTabProps) {
  const [viewBasis, setViewBasis] = useState<'whole_trip' | 'per_person'>('whole_trip');
  const [selectedCurrency, setSelectedCurrency] = useState<string>(trip.currency || 'USD');

  // Manual booking reference update modal
  const [activeBookingModalItem, setActiveBookingModalItem] = useState<any | null>(null);
  const [bookingRefInput, setBookingRefInput] = useState('');
  const [bookingStatusInput, setBookingStatusInput] = useState<string>('booked');
  const [isSavingRef, setIsSavingRef] = useState(false);

  const totalTravelers = Math.max(1, trip.adults + (trip.children || 0));

  // 1. Gather all line items
  // Stays
  const stayRows = (trip.stays || []).map((s: any) => ({
    id: s.id,
    sourceType: 'stay',
    category: 'stays',
    title: `${s.hotel?.name || 'Selected Stay'} (${s.nights}N)`,
    subtitle: `${s.roomType} &bull; via ${s.provider}`,
    costMinor: s.totalPriceMinor,
    currency: s.currency,
    priceBasis: 'per_room_night' as PriceBasis,
    status: s.bookingStatus || 'shortlisted',
    reference: s.bookingReference,
    isStay: true,
  }));

  // Itinerary items (activities, transfers, flights, meals)
  const itemRows = trip.days.flatMap((d: any) =>
    d.items.map((i: any) => ({
      id: i.id,
      sourceType: 'item',
      category:
        i.type === 'flight'
          ? 'flights'
          : i.type === 'transfer'
          ? 'transport'
          : i.type === 'meal'
          ? 'extras'
          : 'activities',
      title: i.title,
      subtitle: `Day ${d.dayNumber}: ${d.city.name}`,
      costMinor: i.costMinor,
      currency: i.currency,
      priceBasis: i.priceBasis as PriceBasis,
      status: i.bookingStatus || 'planned',
      reference: i.metadata ? JSON.parse(i.metadata || '{}').reference : null,
      isStay: false,
    }))
  );

  const allRows = [...stayRows, ...itemRows];

  // Calculate totals in selected currency
  let totalTripEstimatedMinor = 0;
  let totalTripConfirmedMinor = 0;

  const categoryTotals: Record<string, { totalMinor: number; confirmedMinor: number }> = {
    stays: { totalMinor: 0, confirmedMinor: 0 },
    activities: { totalMinor: 0, confirmedMinor: 0 },
    flights: { totalMinor: 0, confirmedMinor: 0 },
    transport: { totalMinor: 0, confirmedMinor: 0 },
    extras: { totalMinor: 0, confirmedMinor: 0 },
  };

  allRows.forEach((row) => {
    const cost = computeItemTotalCost(
      row.costMinor,
      row.currency,
      row.priceBasis,
      { adults: trip.adults, children: trip.children, nights: 1 },
      selectedCurrency
    );

    totalTripEstimatedMinor += cost.totalMinor;
    if (row.status === 'booked') {
      totalTripConfirmedMinor += cost.totalMinor;
    }

    if (categoryTotals[row.category]) {
      categoryTotals[row.category].totalMinor += cost.totalMinor;
      if (row.status === 'booked') {
        categoryTotals[row.category].confirmedMinor += cost.totalMinor;
      }
    }
  });

  const displayTotal =
    viewBasis === 'whole_trip'
      ? totalTripEstimatedMinor
      : Math.round(totalTripEstimatedMinor / totalTravelers);

  const displayConfirmed =
    viewBasis === 'whole_trip'
      ? totalTripConfirmedMinor
      : Math.round(totalTripConfirmedMinor / totalTravelers);

  const handleOpenBookingModal = (row: any) => {
    if (isReadOnly) return;
    setActiveBookingModalItem(row);
    setBookingRefInput(row.reference || '');
    setBookingStatusInput(row.status || 'booked');
  };

  const handleSaveBookingReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBookingModalItem || isReadOnly) return;
    setIsSavingRef(true);

    try {
      if (activeBookingModalItem.isStay) {
        // Update stay selection
        const res = await fetch(`/api/trips/${trip.id}/stays/${activeBookingModalItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingStatus: bookingStatusInput,
            bookingReference: bookingRefInput,
          }),
        });
        if (!res.ok) throw new Error('Failed to update stay');

        const updatedStays = trip.stays.map((s: any) =>
          s.id === activeBookingModalItem.id
            ? { ...s, bookingStatus: bookingStatusInput, bookingReference: bookingRefInput }
            : s
        );
        onUpdateTrip({ ...trip, stays: updatedStays });
      } else {
        // Update itinerary item
        const res = await fetch(`/api/trips/${trip.id}/items/${activeBookingModalItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingStatus: bookingStatusInput,
            metadata: JSON.stringify({ reference: bookingRefInput }),
          }),
        });
        if (!res.ok) throw new Error('Failed to update item');

        const updatedDays = trip.days.map((d: any) => ({
          ...d,
          items: d.items.map((i: any) =>
            i.id === activeBookingModalItem.id
              ? {
                  ...i,
                  bookingStatus: bookingStatusInput,
                  metadata: JSON.stringify({ reference: bookingRefInput }),
                }
              : i
          ),
        }));
        onUpdateTrip({ ...trip, days: updatedDays });
      }

      setActiveBookingModalItem(null);
    } catch (err: any) {
      alert(err.message || 'Error updating booking reference');
    } finally {
      setIsSavingRef(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'booked':
        return <Badge variant="emerald" size="sm">Confirmed Booked</Badge>;
      case 'shortlisted':
        return <Badge variant="purple" size="sm">Shortlisted</Badge>;
      case 'enquiry_sent':
        return <Badge variant="sky" size="sm">Enquiry Sent</Badge>;
      case 'cancelled':
        return <Badge variant="rose" size="sm">Cancelled</Badge>;
      default:
        return <Badge variant="slate" size="sm">Planned / Unbooked</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Controls Bar: View basis toggle, currency switcher, exchange rate notice */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Whole Trip vs Per Person */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/60">
            <button
              onClick={() => setViewBasis('whole_trip')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewBasis === 'whole_trip'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Whole Trip Total
            </button>
            <button
              onClick={() => setViewBasis('per_person')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewBasis === 'per_person'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Per-Person Share ({totalTravelers})
            </button>
          </div>

          {/* Currency Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500">Currency:</span>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:border-purple-500 focus:outline-none"
            >
              {Object.keys(SUPPORTED_CURRENCIES).map((cur) => (
                <option key={cur} value={cur}>
                  {cur} ({SUPPORTED_CURRENCIES[cur].symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Timestamped Exchange Rate Notice */}
        <span className="text-[11px] text-slate-400">
          Exchange rates pegged: {new Date(EXCHANGE_RATE_TIMESTAMP).toLocaleDateString()}
        </span>
      </div>

      {/* Hero Budget Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-950 text-white shadow-xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
            {viewBasis === 'whole_trip' ? 'Total Estimated Trip Budget' : 'Per-Person Estimated Budget'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            {formatCurrency(displayTotal, selectedCurrency)}
          </h2>
          <p className="text-xs text-purple-200 pt-1">
            Combines verified stay packages, transfers, activities, and dining estimates.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Confirmed & Booked Spend
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
            {formatCurrency(displayConfirmed, selectedCurrency)}
          </h2>
          <span className="text-xs text-slate-400 block pt-1">
            {displayTotal > 0
              ? `${Math.round((displayConfirmed / displayTotal) * 100)}% of total trip expenses secured`
              : '0% secured'}
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Outstanding / Estimated Spend
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
            {formatCurrency(Math.max(0, displayTotal - displayConfirmed), selectedCurrency)}
          </h2>
          <span className="text-xs text-slate-400 block pt-1">
            Planned activities, transfers, and open reservations.
          </span>
        </div>
      </div>

      {/* Category Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { key: 'stays', label: 'Accommodations', icon: Building, color: 'text-purple-600' },
          { key: 'activities', label: 'Experiences & Tours', icon: Compass, color: 'text-indigo-600' },
          { key: 'transport', label: 'Transfers & Drivers', icon: Car, color: 'text-sky-600' },
          { key: 'flights', label: 'Flights', icon: Plane, color: 'text-emerald-600' },
          { key: 'extras', label: 'Dining & Extras', icon: DollarSign, color: 'text-amber-600' },
        ].map((cat) => {
          const Icon = cat.icon;
          const catData = categoryTotals[cat.key] || { totalMinor: 0, confirmedMinor: 0 };
          const val =
            viewBasis === 'whole_trip'
              ? catData.totalMinor
              : Math.round(catData.totalMinor / totalTravelers);

          return (
            <div
              key={cat.key}
              className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-sm space-y-1"
            >
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                <span className="truncate">{cat.label}</span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">
                {formatCurrency(val, selectedCurrency)}
              </h4>
            </div>
          );
        })}
      </div>

      {/* Inclusions vs Exclusions Breakdown */}
      <div className="rounded-2xl bg-slate-50 border border-slate-200/90 p-6 space-y-4">
        <h3 className="font-bold text-sm text-slate-900">
          Trip Inclusions & Exclusions Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
          <div className="space-y-2 p-4 rounded-xl bg-white border border-slate-200">
            <span className="font-bold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>What is Included in This Budget:</span>
            </span>
            <ul className="space-y-1 text-slate-600 pl-5 list-disc text-[11px]">
              <li>Handpicked resort stays with local hospitality taxes & service charges included.</li>
              <li>Pre-arranged airport meet & greet and inter-region private van transfers.</li>
              <li>Sacred temple entry tickets, guided workshops, and scheduled excursions.</li>
              <li>Breakfast buffet at confirmed hotels.</li>
            </ul>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-white border border-slate-200">
            <span className="font-bold text-rose-700 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>What is Excluded (Pay Locally):</span>
            </span>
            <ul className="space-y-1 text-slate-600 pl-5 list-disc text-[11px]">
              <li>International flights (unless manually booked and entered).</li>
              <li>Alcoholic cocktails & daybed minimum spends at beach clubs.</li>
              <li>Tourist Visa on Arrival fees (~$32 USD / IDR 500,000 per person).</li>
              <li>Driver and guide gratuities (recommended 10-15%).</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Itemized Line Items Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden space-y-0">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            Itemized Expense & Booking Ledger
          </h3>
          <span className="text-xs text-slate-400">
            {allRows.length} Ledger Items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Expense / Booking</th>
                <th className="px-4 py-3">Price Basis</th>
                <th className="px-4 py-3">Estimated Cost</th>
                <th className="px-4 py-3">Booking Status</th>
                <th className="px-4 py-3">Reference / Confirmation</th>
                {!isReadOnly && <th className="px-4 py-3 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allRows.map((row) => {
                const costCalc = computeItemTotalCost(
                  row.costMinor,
                  row.currency,
                  row.priceBasis,
                  { adults: trip.adults, children: trip.children, nights: 1 },
                  selectedCurrency
                );

                const displayedAmount =
                  viewBasis === 'whole_trip' ? costCalc.totalMinor : costCalc.perPersonMinor;

                return (
                  <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5">
                      <span className="font-bold text-slate-900 block">{row.title}</span>
                      <span className="text-[11px] text-slate-400">{row.subtitle}</span>
                    </td>
                    <td className="px-4 py-3.5 capitalize text-slate-600">
                      {row.priceBasis?.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {displayedAmount > 0
                        ? formatCurrency(displayedAmount, selectedCurrency)
                        : 'Included'}
                    </td>
                    <td className="px-4 py-3.5">{getStatusBadge(row.status)}</td>
                    <td className="px-4 py-3.5">
                      {row.reference ? (
                        <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold">
                          {row.reference}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">None added</span>
                      )}
                    </td>
                    {!isReadOnly && (
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenBookingModal(row)}
                        >
                          Update Reference
                        </Button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Booking Reference Entry Modal */}
      <Modal
        isOpen={!!activeBookingModalItem}
        onClose={() => setActiveBookingModalItem(null)}
        title="Update Booking Reference & Spend"
        description={activeBookingModalItem?.title}
        maxWidth="md"
      >
        <form onSubmit={handleSaveBookingReference} className="space-y-4">
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 leading-relaxed">
            <span className="font-bold block mb-0.5">Booking Protection:</span>
            Entering a reference records your confirmed provider confirmation number privately. This is automatically omitted from public share links.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Booking Status
            </label>
            <select
              value={bookingStatusInput}
              onChange={(e) => setBookingStatusInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:border-purple-500 focus:outline-none"
            >
              <option value="planned">Planned (Not booked yet)</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="enquiry_sent">Enquiry Sent to Provider</option>
              <option value="booked">Booked & Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirmation / PNR / Voucher Code
            </label>
            <input
              type="text"
              value={bookingRefInput}
              onChange={(e) => setBookingRefInput(e.target.value)}
              placeholder="e.g. AG-9821447 or GA-842"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveBookingModalItem(null)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSavingRef}>
              Save Booking Details
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

