import React from 'react';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/marketing/HeroSection';
import { DestinationCarousel } from '@/components/marketing/DestinationCarousel';
import { FourStepGuide } from '@/components/marketing/FourStepGuide';
import { FaqSection } from '@/components/marketing/FaqSection';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const destinations = await prisma.destination.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      country: true,
      heroImage: true,
      description: true,
      suggestedDurationDays: true,
    },
    take: 6,
  });

  const templates = await prisma.tripTemplate.findMany({
    include: {
      destination: {
        select: { name: true },
      },
      creator: {
        select: { name: true, handle: true, isDemo: true },
      },
    },
    take: 4,
  });

  return (
    <div className="min-h-screen bg-[#0b0c10] text-slate-100 flex flex-col justify-between">
      <Navbar theme="dark" />
      <main className="flex-1">
        <HeroSection destinations={destinations} />
        <DestinationCarousel destinations={destinations} templates={templates} />
        <FourStepGuide />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
