import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TripboardWorkspace } from '@/components/tripboard/TripboardWorkspace';
import { ShieldCheck, Info } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface SharePageProps {
  params: {
    token: string;
  };
}

export default async function SharedTripboardPage({ params }: SharePageProps) {
  // Find active, unrevoked share token
  const shareToken = await prisma.shareToken.findUnique({
    where: { token: params.token },
    include: {
      trip: {
        include: {
          destination: {
            include: {
              cities: {
                include: {
                  activities: true,
                  hotels: {
                    include: { offers: true },
                  },
                },
              },
            },
          },
          cities: {
            include: {
              city: {
                include: {
                  activities: true,
                  hotels: {
                    include: { offers: true },
                  },
                },
              },
            },
            orderBy: { orderIndex: 'asc' },
          },
          days: {
            include: {
              city: true,
              items: {
                include: { activity: true },
                orderBy: { orderIndex: 'asc' },
              },
            },
            orderBy: { dayNumber: 'asc' },
          },
          stays: {
            include: {
              hotel: {
                include: { offers: true },
              },
            },
          },
          bookings: true,
        },
      },
    },
  });

  if (!shareToken || shareToken.isRevoked || !shareToken.trip) {
    notFound();
  }

  const rawTrip = shareToken.trip;

  // Scrub private fields for public read-only viewer
  const scrubbedTrip = {
    ...rawTrip,
    user: null, // Scrub owner user identity & phone
    days: rawTrip.days.map((day) => ({
      ...day,
      notes: null, // Scrub private day notes
      items: day.items.map((item) => ({
        ...item,
        notes: null, // Scrub private item notes
        metadata: '{}', // Scrub private voucher refs & flight confirmations
      })),
    })),
    stays: rawTrip.stays.map((stay) => ({
      ...stay,
      bookingReference: null, // Scrub booking ref
      notes: null,
    })),
    bookings: rawTrip.bookings.map((booking) => ({
      ...booking,
      confirmationReference: null,
      notes: null,
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar theme="light" />

      {/* Public Share Privacy Banner */}
      <div className="bg-purple-950 text-white text-xs py-2 px-4 text-center flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-purple-400" />
        <span>
          Viewing a read-only shared tripboard. Private booking references and traveler notes have been scrubbed.
        </span>
      </div>

      <TripboardWorkspace initialTrip={scrubbedTrip} isReadOnly={true} />

      <Footer />
    </div>
  );
}
