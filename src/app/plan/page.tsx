import React from 'react';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { QuestionnaireWizard } from '@/components/questionnaire/QuestionnaireWizard';
import { Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PlanPageProps {
  searchParams: {
    destination?: string;
    template?: string;
  };
}

export default async function PlanPage({ searchParams }: PlanPageProps) {
  const destinations = await prisma.destination.findMany({
    include: {
      cities: {
        select: { id: true, slug: true, name: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="min-h-screen bg-[#0b0c10] text-slate-100 flex flex-col justify-between">
      <Navbar theme="dark" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950 border border-purple-800 text-purple-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Interactive Itinerary Wizard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Design Your Trip
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Tell us your travel style. We’ll generate a balanced, customizable multi-day visual tripboard in seconds.
          </p>
        </div>

        <QuestionnaireWizard
          destinations={destinations}
          initialDestinationSlug={searchParams.destination}
        />
      </main>

      <Footer />
    </div>
  );
}

