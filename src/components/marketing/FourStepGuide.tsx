import React from 'react';
import { Sparkles, LayoutGrid, Users2, ShieldCheck } from 'lucide-react';

export function FourStepGuide() {
  const steps = [
    {
      num: '01',
      title: 'Smart Questionnaire & AI Draft',
      desc: 'Tell Roamly who is traveling, ideal dates, multi-city preferences, pace, and dietary needs. Roamly instantiates a balanced initial multi-day itinerary in seconds.',
      icon: Sparkles,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      num: '02',
      title: 'Interactive Visual Tripboard',
      desc: 'Rearrange activities via drag-and-drop, toggle compact or detailed card modes, inspect daytime transit gaps, and explore curated local dining recommendations.',
      icon: LayoutGrid,
      color: 'from-indigo-500 to-violet-500',
    },
    {
      num: '03',
      title: 'Multi-Provider Hotel Comparison',
      desc: 'Compare transparent live nightly and total-stay pricing across Agoda, Booking.com, Expedia, and Direct properties with clear inclusions, cancellation terms, and fees.',
      icon: ShieldCheck,
      color: 'from-violet-500 to-fuchsia-500',
    },
    {
      num: '04',
      title: 'Expert Consultation & Confidence',
      desc: 'Refine your personalized itinerary with verified destination specialists, request customized quotes, and securely share read-only links with traveling companions.',
      icon: Users2,
      color: 'from-fuchsia-500 to-purple-600',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-[#09080e] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
            How Roamly Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Effortless travel architecture from idea to departure
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Eliminate twenty open browser tabs. Everything you need to discover, organize, budget, and review is consolidated into one living tripboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative rounded-2xl bg-slate-900/60 border border-purple-950/60 p-6 flex flex-col justify-between space-y-4 hover:border-purple-600/50 hover:bg-slate-900 transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${step.color} flex items-center justify-center text-white shadow-md shadow-purple-900/30 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-2xl font-black text-slate-700 group-hover:text-purple-400/50 transition-colors">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
