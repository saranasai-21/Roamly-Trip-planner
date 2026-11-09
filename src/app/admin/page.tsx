import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AdminEnquiriesTable } from '@/components/admin/AdminEnquiriesTable';
import { Badge } from '@/components/ui/Badge';
import { Shield, Users, MapPin, Compass, Building, HelpCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminHubPage() {
  const user = await getCurrentUser();

  // Metrics
  const destinationsCount = await prisma.destination.count();
  const citiesCount = await prisma.city.count();
  const activitiesCount = await prisma.activity.count();
  const hotelsCount = await prisma.hotel.count();
  const templatesCount = await prisma.tripTemplate.count();
  const enquiriesCount = await prisma.expertEnquiry.count();

  // Load enquiries
  const enquiries = await prisma.expertEnquiry.findMany({
    include: {
      trip: {
        select: { id: true, title: true, destination: { select: { name: true } } },
      },
      quotes: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar theme="light" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 space-y-8">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="purple" size="sm">
              Operations Hub
            </Badge>
            <Badge variant="emerald" size="sm">
              Role: {user?.role || 'Guest / Demo Admin'}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
            Administration & Specialist Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review traveler expert consultation requests, issue proposed quotes, and manage verified destination catalogue data.
          </p>
        </div>

        {/* 4 Catalogue Overview Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Destinations & Cities
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {destinationsCount} <span className="text-sm font-semibold text-slate-400">({citiesCount} Cities)</span>
            </h3>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Activities & Sights
            </span>
            <h3 className="text-2xl font-black text-purple-700 mt-1">
              {activitiesCount} Curated
            </h3>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Hotels & Multi-Offers
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {hotelsCount} Properties
            </h3>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Curated Templates
            </span>
            <h3 className="text-2xl font-black text-emerald-700 mt-1">
              {templatesCount} Ready Trips
            </h3>
          </div>
        </div>

        {/* Enquiries Queue */}
        <AdminEnquiriesTable initialEnquiries={enquiries} />
      </main>

      <Footer />
    </div>
  );
}
