import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TripboardWorkspace } from '@/components/tripboard/TripboardWorkspace';

export const dynamic = 'force-dynamic';

interface TripPageProps {
  params: {
    id: string;
  };
}

export default async function TripboardPage({ params }: TripPageProps) {
  const trip = await prisma.trip.findUnique({
    where: { id: params.id },
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
  });

  if (!trip) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar theme="light" />
      <TripboardWorkspace initialTrip={trip} isReadOnly={false} />
      <Footer />
    </div>
  );
}
