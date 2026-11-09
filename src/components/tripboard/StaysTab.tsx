'use client';

import React, { useState } from 'react';
import {
  Hotel as HotelIcon,
  Star,
  MapPin,
  Check,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Drawer } from '../ui/Drawer';
import { formatCurrency } from '@/lib/money';

interface StaysTabProps {
  trip: any;
  onUpdateTrip: (updatedTrip: any) => void;
  isReadOnly?: boolean;
}

export function StaysTab({ trip, onUpdateTrip, isReadOnly = false }: StaysTabProps) {
  const [selectedCityId, setSelectedCityId] = useState<string>(
    trip.cities[0]?.city.id || ''
  );
  const [expandedHotelId, setExpandedHotelId] = useState<string | null>(null);
  const [activeHotelDrawer, setActiveHotelDrawer] = useState<any | null>(null);
  const [isUpdatingStay, setIsUpdatingStay] = useState(false);

  // Selected city
  const activeCity = trip.cities.find((tc: any) => tc.city.id === selectedCityId) || trip.cities[0];
  const cityHotels = activeCity?.city.hotels || [];

  // Check currently selected stay for this city
  const currentCityStay = trip.stays.find((s: any) => s.cityId === selectedCityId);

  const handleSelectOffer = async (hotel: any, offer: any) => {
    if (isReadOnly) return;
    setIsUpdatingStay(true);

    try {
      const res = await fetch(`/api/trips/${trip.id}/stays`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityId: selectedCityId,
          hotelId: hotel.id,
          offerId: offer.id,
          roomType: offer.roomType,
          provider: offer.provider,
          totalPriceMinor: offer.totalPriceMinor,
          currency: offer.currency,
          nights: activeCity.nights || 2,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Update local state
      const updatedStays = trip.stays.filter((s: any) => s.cityId !== selectedCityId);
      updatedStays.push(data.stay);

      onUpdateTrip({ ...trip, stays: updatedStays });
    } catch (err: any) {
      alert(err.message || 'Error updating stay');
    } finally {
      setIsUpdatingStay(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* City & Stay Nights Navigator */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Select City Region:
          </span>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {trip.cities.map((tc: any) => {
              const isSelected = tc.city.id === selectedCityId;
              const hasStay = trip.stays.some((s: any) => s.cityId === tc.city.id);

              return (
                <button
                  key={tc.city.id}
                  onClick={() => setSelectedCityId(tc.city.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{tc.city.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-purple-700' : 'bg-slate-200'}`}>
                    {tc.nights}N
                  </span>
                  {hasStay && <Check className="w-3 h-3 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status for current city */}
        <div className="text-right">
          <span className="text-[11px] text-slate-400 block">Stay Selection:</span>
          {currentCityStay ? (
            <span className="font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Selected: {currentCityStay.hotel?.name || 'Hotel'} ({currentCityStay.provider})
            </span>
          ) : (
            <span className="font-bold text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              No stay selected for {activeCity?.city.name}
            </span>
          )}
        </div>
      </div>

      {/* Provider Transparency Banner */}
      <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 flex items-center justify-between text-xs text-purple-900">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0" />
          <span className="leading-relaxed">
            <strong>Transparent Multi-Provider Price Comparison:</strong> Comparing offers across Agoda, Booking.com, Expedia, and Direct resort websites with taxes & fees included.
          </span>
        </div>
        <span className="text-[10px] text-purple-600 font-semibold uppercase tracking-wider hidden md:inline shrink-0">
          Fixture Demonstration Data
        </span>
      </div>

      {/* Hotel Cards List */}
      <div className="grid grid-cols-1 gap-6">
        {cityHotels.map((hotel: any) => {
          const isSelectedStay = currentCityStay?.hotelId === hotel.id;
          const isExpanded = expandedHotelId === hotel.id;

          // Find cheapest offer
          const sortedOffers = [...hotel.offers].sort(
            (a, b) => a.totalPriceMinor - b.totalPriceMinor
          );
          const cheapestOffer = sortedOffers[0];
          const directOffer = hotel.offers.find((o: any) => o.isDirect);

          let amenities: string[] = [];
          try {
            amenities = JSON.parse(hotel.amenities);
          } catch {
            amenities = [];
          }

          return (
            <div
              key={hotel.id}
              className={`rounded-2xl bg-white border transition-all overflow-hidden ${
                isSelectedStay
                  ? 'border-purple-500 shadow-md ring-2 ring-purple-400/20'
                  : 'border-slate-200/90 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="p-6 flex flex-col md:flex-row gap-6">
                {/* Hotel Image & Gallery trigger */}
                <div className="w-full md:w-64 h-48 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative group">
                  <img
                    src={hotel.coverImage}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {isSelectedStay && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="emerald" size="sm" className="bg-emerald-600 text-white border-0 font-bold">
                        <Check className="w-3 h-3" />
                        <span>Selected for Trip</span>
                      </Badge>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2">
                    <button
                      type="button"
                      onClick={() => setActiveHotelDrawer(hotel)}
                      className="text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-2 py-1 rounded-md hover:bg-black/80 transition-colors"
                    >
                      View Gallery & Details
                    </button>
                  </div>
                </div>

                {/* Hotel Details Column */}
                <div className="flex-1 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="flex text-amber-400">
                          {Array.from({ length: Math.round(hotel.starRating) }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-slate-700">
                          {hotel.starRating} Stars
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                        <span>{hotel.reviewScore} / 10</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({hotel.reviewCount} reviews)
                        </span>
                      </div>
                    </div>

                    <h3
                      onClick={() => setActiveHotelDrawer(hotel)}
                      className="text-lg font-bold text-slate-900 cursor-pointer hover:text-purple-600 transition-colors mt-1"
                    >
                      {hotel.name}
                    </h3>

                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span>{hotel.address}</span>
                    </div>

                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {hotel.description}
                    </p>

                    {/* Amenities pills */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {amenities.slice(0, 4).map((amenity, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Best Offer Preview Bar */}
                  {cheapestOffer && (
                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-xl">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            Best Offer on {cheapestOffer.provider}:
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                            Lowest Rate
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block">
                          {cheapestOffer.roomType} &bull; {cheapestOffer.mealBasis}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-base font-extrabold text-slate-900">
                            {formatCurrency(cheapestOffer.pricePerNightMinor, cheapestOffer.currency)}
                            <span className="text-xs font-normal text-slate-500"> / night</span>
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            Total: {formatCurrency(cheapestOffer.totalPriceMinor, cheapestOffer.currency)} ({activeCity.nights}N)
                          </span>
                        </div>

                        {!isReadOnly && (
                          <Button
                            size="sm"
                            variant={isSelectedStay ? 'secondary' : 'primary'}
                            isLoading={isUpdatingStay}
                            onClick={() => handleSelectOffer(hotel, cheapestOffer)}
                          >
                            {isSelectedStay ? 'Current Selection' : 'Select Stay'}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Accordion toggle to compare all provider offers */}
                  <div className="pt-1 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedHotelId(isExpanded ? null : hotel.id)
                      }
                      className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 transition-colors"
                    >
                      <span>
                        {isExpanded ? 'Hide Offer Comparison' : `Compare ${hotel.offers.length} Provider Offers`}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveHotelDrawer(hotel)}
                      className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                    >
                      Property Details &rarr;
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Provider Comparison Table */}
              {isExpanded && (
                <div className="bg-slate-50/90 border-t border-slate-200 p-6 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    All Available Provider Quotes ({activeCity.nights} Nights)
                  </h4>

                  <div className="space-y-2">
                    {hotel.offers.map((offer: any) => {
                      const isCheapest = offer.id === cheapestOffer?.id;
                      const isOfferSelected = currentCityStay?.offerId === offer.id;

                      return (
                        <div
                          key={offer.id}
                          className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isOfferSelected
                              ? 'bg-purple-50 border-purple-300'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">
                                {offer.provider}
                              </span>
                              {offer.isDirect && (
                                <Badge variant="purple" size="sm">
                                  Direct Property Perk
                                </Badge>
                              )}
                              {isCheapest && (
                                <Badge variant="emerald" size="sm">
                                  Cheapest
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-600">
                              {offer.roomType} &bull; {offer.mealBasis}
                            </p>
                            <span className="text-[11px] text-slate-400">
                              {offer.cancellationPolicy}
                            </span>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="font-extrabold text-sm text-slate-900">
                                {formatCurrency(offer.pricePerNightMinor, offer.currency)}
                                <span className="text-[11px] font-normal text-slate-500"> / night</span>
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                Total: {formatCurrency(offer.totalPriceMinor, offer.currency)}
                              </span>
                            </div>

                            {!isReadOnly && (
                              <Button
                                size="sm"
                                variant={isOfferSelected ? 'secondary' : 'outline'}
                                isLoading={isUpdatingStay}
                                onClick={() => handleSelectOffer(hotel, offer)}
                              >
                                {isOfferSelected ? 'Selected' : 'Choose Offer'}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {cityHotels.length === 0 && (
          <div className="p-12 rounded-2xl border border-dashed border-slate-300 bg-white text-center text-xs text-slate-400 space-y-2">
            <HotelIcon className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No verified partner stays seeded for {activeCity?.city.name} yet.</p>
          </div>
        )}
      </div>

      {/* Hotel Detail & Photo Gallery Drawer */}
      <Drawer
        isOpen={!!activeHotelDrawer}
        onClose={() => setActiveHotelDrawer(null)}
        title={activeHotelDrawer?.name || 'Hotel Details'}
        subtitle={activeHotelDrawer?.address}
      >
        {activeHotelDrawer && (
          <div className="space-y-6">
            {/* Gallery Images */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700">Photo Gallery</span>
              <div className="grid grid-cols-2 gap-2">
                <img
                  src={activeHotelDrawer.coverImage}
                  alt={activeHotelDrawer.name}
                  className="w-full h-36 object-cover rounded-xl"
                />
                <img
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80"
                  alt="Gallery"
                  className="w-full h-36 object-cover rounded-xl"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">About Property</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activeHotelDrawer.description}
              </p>
            </div>

            {/* Check-in info */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Check-in Time:</span>
                <span className="font-bold text-slate-800">{activeHotelDrawer.checkInTime}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Check-out Time:</span>
                <span className="font-bold text-slate-800">{activeHotelDrawer.checkOutTime}</span>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

