'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { AIPatchPlan } from '@/lib/types';
import { formatCurrency } from '@/lib/money';

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  trip: any;
  onUpdateTrip: (updatedTrip: any) => void;
}

export function AIPanel({
  isOpen,
  onClose,
  trip,
  onUpdateTrip,
}: AIPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Proposed Patch State
  const [proposedPlan, setProposedPlan] = useState<AIPatchPlan | null>(null);
  const [isLiveAi, setIsLiveAi] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickActions = [
    { label: '🌿 Make Day 2 more relaxed', prompt: 'Make Day 2 more relaxed by adding leisure buffers' },
    { label: '🍳 Swap for cultural cooking class', prompt: 'Replace an activity on Day 2 with an authentic Balinese cooking class' },
    { label: '💰 Suggest lower-cost alternatives', prompt: 'Suggest lower-cost or free nature alternatives for Day 1' },
    { label: '🥗 Incorporate vegetarian dining', prompt: 'Incorporate vegetarian dining spots for lunch on Day 2' },
  ];

  const handleGeneratePlan = async (userPrompt: string) => {
    setIsLoading(true);
    setError(null);
    setSuccessNotice(null);

    try {
      const res = await fetch(`/api/trips/${trip.id}/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate plan');

      setProposedPlan(data.plan);
      setIsLiveAi(data.isLiveAi);
    } catch (err: any) {
      setError(err.message || 'Error processing request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPatch = async () => {
    if (!proposedPlan) return;
    setIsApplying(true);
    setError(null);

    try {
      const res = await fetch(`/api/trips/${trip.id}/ai`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: proposedPlan }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to apply patch');

      onUpdateTrip(data.trip);
      setSuccessNotice('Changes applied successfully! A revision snapshot was saved.');
      setProposedPlan(null);
      setPrompt('');
    } catch (err: any) {
      setError(err.message || 'Error applying changes');
    } finally {
      setIsApplying(false);
    }
  };

  const handleUndoRevision = async () => {
    setIsUndoing(true);
    setError(null);

    try {
      const res = await fetch(`/api/trips/${trip.id}/ai`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to undo');

      setSuccessNotice('Rolled back to previous revision snapshot.');
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Error rolling back');
    } finally {
      setIsUndoing(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md md:max-w-lg bg-white shadow-2xl flex flex-col border-l border-slate-200">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  AI Planning Architect
                </h3>
                <span className="text-[11px] text-purple-700 font-semibold">
                  Google Gemini & Structured Pipeline
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* System Info Notice */}
            <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200 text-xs text-purple-900 space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                  <span>Schema-Constrained AI Editing</span>
                </span>
                <Badge variant="purple" size="sm">
                  {process.env.NEXT_PUBLIC_GEMINI_KEY ? 'Live Gemini 1.5' : 'Deterministic Sandbox'}
                </Badge>
              </div>
              <p className="text-purple-700 text-[11px] leading-relaxed">
                Roamly parses prompts through typed operations referencing valid database IDs. User-locked items are strictly preserved, and full undo is supported.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successNotice}</span>
              </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recommended Actions
              </span>
              <div className="space-y-1.5">
                {quickActions.map((qa, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setPrompt(qa.prompt);
                      handleGeneratePlan(qa.prompt);
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200/80 hover:border-purple-300 text-left text-xs font-semibold text-slate-800 hover:text-purple-900 transition-all flex items-center justify-between"
                  >
                    <span>{qa.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600" />
                  </button>
                ))}
              </div>
            </div>

            {/* Proposed Patch Preview Modal / Box if ready */}
            {proposedPlan && (
              <div className="p-4 rounded-2xl bg-slate-50 border-2 border-purple-400 space-y-4 shadow-sm animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-md">
                    Proposed Revision Diff
                  </span>
                  <Badge variant={isLiveAi ? 'emerald' : 'purple'} size="sm">
                    {isLiveAi ? 'Gemini Live' : 'Deterministic Planner'}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    {proposedPlan.summary}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {proposedPlan.reasoning}
                  </p>
                </div>

                {/* Operations Diff List */}
                <div className="space-y-2 border-t border-slate-200 pt-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Detailed Patch Operations:
                  </span>
                  {proposedPlan.operations.map((op, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 capitalize">
                          {op.op.replace('_', ' ')} (Day {op.dayNumber || 1})
                        </span>
                        {op.costImpactMinor !== undefined && op.costImpactMinor !== 0 && (
                          <span
                            className={`text-[11px] font-bold ${
                              op.costImpactMinor > 0 ? 'text-purple-700' : 'text-emerald-700'
                            }`}
                          >
                            {op.costImpactMinor > 0 ? '+' : ''}
                            {formatCurrency(op.costImpactMinor, 'USD')}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600">{op.explanation}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setProposedPlan(null)}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    Discard Preview
                  </button>
                  <Button
                    size="sm"
                    onClick={handleApplyPatch}
                    isLoading={isApplying}
                  >
                    Accept & Apply Revision
                  </Button>
                </div>
              </div>
            )}

            {/* Undo Section */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Revert recent AI changes:</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndoRevision}
                isLoading={isUndoing}
              >
                Undo Last AI Edit
              </Button>
            </div>

          </div>

          {/* Footer Input Bar */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (prompt.trim()) handleGeneratePlan(prompt);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask AI: e.g. Make Day 3 more relaxed..."
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:border-purple-500 focus:outline-none"
              />
              <Button
                type="submit"
                size="sm"
                isLoading={isLoading}
                disabled={!prompt.trim()}
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
