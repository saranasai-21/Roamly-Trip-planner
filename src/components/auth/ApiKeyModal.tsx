'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Key, Sparkles, CheckCircle2, ShieldCheck, ExternalLink } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function ApiKeyModal({ isOpen, onClose, onSaved }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('roamly_gemini_api_key');
      if (stored) setApiKey(stored);
    }
  }, [isOpen]);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (typeof window !== 'undefined') {
      if (apiKey.trim()) {
        localStorage.setItem('roamly_gemini_api_key', apiKey.trim());
      } else {
        localStorage.removeItem('roamly_gemini_api_key');
      }
    }
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      if (onSaved) onSaved();
      onClose();
    }, 600);
  };

  const handleUseDemo = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('roamly_gemini_api_key');
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Google Gemini AI Setup"
      description="Connect your Gemini API key to enable live travel planning and AI itinerary editing."
      maxWidth="md"
    >
      <form onSubmit={handleSave} className="space-y-4">
        <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Developer & Cloner Configuration</span>
          </div>
          <p className="text-purple-700 leading-relaxed text-[11px]">
            Anyone cloning this repo can enter their own Google Gemini API key. It is stored securely in your browser session and passed only to the server-side AI planner.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Gemini API Key
            </label>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
            >
              <span>Get free key at Google AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="relative">
            <Key className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-xs font-mono outline-none"
            />
          </div>
        </div>

        {isSaved && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>API key saved successfully!</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button type="submit" size="sm" className="flex-1">
            Save & Enable Live AI
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUseDemo}
            className="flex-1 text-slate-600"
          >
            Use Demo Planner (Free)
          </Button>
        </div>
      </form>
    </Modal>
  );
}

