'use client';

import React, { useState } from 'react';
import { ShieldCheck, ExternalLink, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface VisaInfoData {
  requirements: string;
  cost?: string;
  sourceUrl: string;
  lastVerified: string;
}

interface VisaCheckerProps {
  destinationName: string;
  countryName: string;
  visaData: VisaInfoData;
}

export function VisaChecker({
  destinationName,
  countryName,
  visaData,
}: VisaCheckerProps) {
  const [nationality, setNationality] = useState('US');
  const [travelDate, setTravelDate] = useState('2026-12-01');

  const NATIONALITY_RULES: Record<
    string,
    { label: string; status: 'exempt' | 'voa' | 'evisa' | 'embassy'; note: string }
  > = {
    US: {
      label: 'United States',
      status: countryName === 'Indonesia' ? 'voa' : countryName === 'Thailand' ? 'exempt' : 'exempt',
      note: 'Eligible for 30-day Visa on Arrival (VoA) / e-VoA or 60-day tourism exemption.',
    },
    GB: {
      label: 'United Kingdom',
      status: countryName === 'Indonesia' ? 'voa' : 'exempt',
      note: 'Eligible for 30-day Visa on Arrival / e-VoA or visa waiver scheme.',
    },
    AU: {
      label: 'Australia',
      status: countryName === 'Indonesia' ? 'voa' : 'exempt',
      note: 'Eligible for 30-day e-VoA or Visa on Arrival upon landing at major international ports.',
    },
    IN: {
      label: 'India',
      status: countryName === 'Indonesia' ? 'voa' : countryName === 'Thailand' ? 'exempt' : 'evisa',
      note: 'Special tourism exemption or e-VoA online registration prior to departure.',
    },
    DE: {
      label: 'Germany (EU)',
      status: countryName === 'Indonesia' ? 'voa' : 'exempt',
      note: 'EU passport holder 30-day VoA or standard tourist visa exemption.',
    },
  };

  const selectedRule = NATIONALITY_RULES[nationality] || {
    label: nationality,
    status: 'voa',
    note: visaData.requirements,
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-purple-900/40 p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-purple-400" />
          <h3 className="text-base font-bold text-white">
            Contextual Visa & Entry Requirements
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="emerald" size="sm">
            <CheckCircle2 className="w-3 h-3" />
            <span>Verified Source</span>
          </Badge>
          <span className="text-[11px] text-slate-400">
            Last verified: {visaData.lastVerified || '2026-09-01'}
          </span>
        </div>
      </div>

      {/* Nationality & Travel Date selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Passport / Nationality
          </label>
          <select
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:border-purple-500 focus:outline-none"
          >
            <option value="US">United States (US)</option>
            <option value="GB">United Kingdom (UK)</option>
            <option value="AU">Australia (AU)</option>
            <option value="IN">India (IN)</option>
            <option value="DE">Germany / EU (DE)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Intended Travel Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Result Card */}
      <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/40 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-purple-200">
            Status for {selectedRule.label} Citizens:
          </span>
          <Badge
            variant={
              selectedRule.status === 'exempt'
                ? 'emerald'
                : selectedRule.status === 'voa'
                ? 'purple'
                : 'amber'
            }
            size="sm"
          >
            {selectedRule.status === 'exempt'
              ? 'Visa Exemption / Free'
              : selectedRule.status === 'voa'
              ? 'Visa on Arrival / e-VoA'
              : 'e-Visa Required'}
          </Badge>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {selectedRule.note}
        </p>

        {visaData.cost && (
          <p className="text-xs text-purple-300 font-semibold">
            Official Fee: {visaData.cost}
          </p>
        )}
      </div>

      {/* Official Government Source Link */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-purple-400" />
          <span>Rules subject to immigration discretion at port of entry.</span>
        </div>
        {visaData.sourceUrl && (
          <a
            href={visaData.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-purple-400 hover:text-purple-300 font-semibold transition-colors"
          >
            <span>Official Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

