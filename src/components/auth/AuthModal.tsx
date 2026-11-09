'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Phone, KeyRound, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('+15551234567');
  const [otpCode, setOtpCode] = useState('');
  const [selectedRole, setSelectedRole] = useState<'customer' | 'expert' | 'admin'>('customer');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      setStep('otp');
      setInfoMessage(data.message || 'Demo OTP code: 123456');
    } catch (err: any) {
      setError(err.message || 'Error sending passcode');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otpCode, role: selectedRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP code');

      if (onSuccess) onSuccess();
      onClose();
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const selectQuickAccount = (targetPhone: string, role: 'customer' | 'expert' | 'admin') => {
    setPhone(targetPhone);
    setSelectedRole(role);
    setStep('otp');
    setOtpCode('123456');
    setInfoMessage(`Configured as ${role.toUpperCase()} with demo code 123456`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 'phone' ? 'Sign in to Roamly' : 'Enter Verification Code'}
      description="Save and manage your personalized multi-city trips across devices."
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Notice of Demo OTP Provider */}
        <div className="rounded-xl bg-purple-50 p-3.5 border border-purple-200/80 text-xs text-purple-900">
          <div className="flex items-center gap-1.5 font-bold mb-1">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Pluggable Demo OTP Mode Active</span>
          </div>
          <p className="text-purple-700 leading-relaxed">
            Local simulated SMS authentication. Use verification passcode{' '}
            <strong className="font-mono bg-purple-200/80 px-1 py-0.5 rounded text-purple-950">
              123456
            </strong>
            .
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
            {infoMessage}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555 123 4567"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['customer', 'expert', 'admin'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRole(r)}
                    className={`py-2 text-xs font-medium rounded-lg border capitalize transition-all ${
                      selectedRole === r
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full">
              Send Passcode
            </Button>

            {/* Quick Demo Logins */}
            <div className="pt-2 border-t border-slate-100">
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">
                Instant Demo Profiles
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => selectQuickAccount('+15551234567', 'customer')}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-purple-100 text-left transition-colors border border-slate-200/80"
                >
                  <p className="font-bold text-xs text-slate-900">Alex Morgan</p>
                  <p className="text-[10px] text-slate-500">Customer</p>
                </button>
                <button
                  type="button"
                  onClick={() => selectQuickAccount('+15557776666', 'expert')}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-purple-100 text-left transition-colors border border-slate-200/80"
                >
                  <p className="font-bold text-xs text-slate-900">Wayman S.</p>
                  <p className="text-[10px] text-slate-500">Expert</p>
                </button>
                <button
                  type="button"
                  onClick={() => selectQuickAccount('+15559998888', 'admin')}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-purple-100 text-left transition-colors border border-slate-200/80"
                >
                  <p className="font-bold text-xs text-slate-900">Elena R.</p>
                  <p className="text-[10px] text-slate-500">Admin</p>
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Enter 6-Digit Code sent to {phone}
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-lg font-mono tracking-widest outline-none text-center"
                />
              </div>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full">
              Verify & Enter
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-xs text-purple-600 hover:underline font-medium"
              >
                Change Phone Number
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
