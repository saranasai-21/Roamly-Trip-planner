'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Roamly’s visual tripboard differ from a standard itinerary list?',
      a: 'Unlike static lists or notes, Roamly’s tripboard is an interactive workspace with five linked views: Overview, Day-by-Day Itinerary with drag-and-drop, multi-provider Stay comparison, Explore catalogue, and transparent Bookings & Budget. Edits update budget calculations, schedules, and map routing in real time.',
    },
    {
      q: 'Do I need to create an account to start planning?',
      a: 'No. You can complete the 4-stage questionnaire and explore the complete tripboard as an anonymous guest. Your draft is preserved locally. When you are ready to save permanently, you can sign in directly with 1-click Demo Customer or Admin access and seamlessly merge your draft.',
    },
    {
      q: 'How does the AI itinerary assistant work?',
      a: 'Roamly connects to Google Gemini with structured schema constraints. You can ask it to make a day more relaxed, swap out activities, suggest lower-cost alternatives, or incorporate dietary preferences. Users can configure their own Gemini API key anytime right in the navigation bar. Every AI change shows a preview diff before you accept, preserves user-locked items, and supports full undo.',
    },
    {
      q: 'How does hotel price comparison work?',
      a: 'Roamly aggregates and presents verified offers from multiple booking providers (such as Agoda, Booking.com, Expedia, and Direct websites). Each offer clearly states room type, meal basis, cancellation policy, and total stay price with taxes and fees.',
    },
    {
      q: 'Can I share my trip with family and friends without giving them edit access?',
      a: 'Yes. Roamly provides tokenized read-only share links. Private notes, booking references, and confirmation attachments are automatically scrubbed from the public link, while allowing viewers to duplicate the itinerary to customize for themselves.',
    },
    {
      q: 'Can I consult with a human travel specialist?',
      a: 'Yes. Each tripboard has an "Ask Travel Expert" entry point. Verified destination experts can review your itinerary, answer complex logistics questions, propose custom quotes, and offer assistance via direct platform enquiry or email.',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-slate-50 border-t border-slate-200 text-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Everything you need to know about Roamly
          </h2>
          <p className="text-sm text-slate-600">
            Transparent answers on planning, privacy, AI capabilities, and stays.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 flex items-center justify-between text-left text-sm font-bold text-slate-900 hover:text-purple-700 transition-colors focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-purple-600 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

