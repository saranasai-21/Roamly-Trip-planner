import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MyTripsDashboard } from '@/components/trips/MyTripsDashboard';
import { Badge } from '@/components/ui/Badge';
import { Compass } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MyTripsPage() {
  const user = await getCurrentUser();

  // Load user trips if authenticated, or public/demo seeded trips if guest
  const trips = await prisma.trip.findMany({
    where: user ? { userId: user.id } : { isPublic: true },
    include: {
      destination: true,
      cities: {
        include: { city: true },
        orderBy: { orderIndex: 'asc' },
      },
      days: {
        include: { items: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar theme="light" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 space-y-6">
        <div>
          <Badge variant="purple" size="sm">
            Workspace
          </Badge>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
            My Tripboards
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your personal multi-city itineraries, revisions, stay selections, and share links.
          </p>
        </div>

        <MyTripsDashboard initialTrips={trips} currentUser={user} />
      </main>

      <Footer />
    </div>
  );
}
