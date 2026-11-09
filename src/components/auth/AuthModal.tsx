'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { User, Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onPromptApiKey?: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess, onPromptApiKey }: AuthModalProps) {
  const [isLoadingRole, setIsLoadingRole] = useState<'customer' | 'admin' | null>(null);

  const handleInstantLogin = async (role: 'customer' | 'admin') => {
    setIsLoadingRole(role);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      if (onSuccess) onSuccess();
      onClose();

      // Ask for API key right after login so cloners can enter their key!
      if (onPromptApiKey) {
        setTimeout(() => {
          onPromptApiKey();
        }, 200);
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      alert(err.message || 'Error signing in');
    } finally {
      setIsLoadingRole(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Instant Sign In / Switch Role"
      description="Select an account role to explore Roamly's customer workspace or admin operations hub."
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Customer Card */}
        <div
          onClick={() => !isLoadingRole && handleInstantLogin('customer')}
          className="p-4 rounded-2xl border-2 border-slate-200 hover:border-purple-500 bg-white hover:bg-purple-50/40 transition-all cursor-pointer shadow-sm group flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-base group-hover:scale-105 transition-transform">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-purple-700 transition-colors">
                  Alex Morgan
                </h4>
                <Badge variant="purple" size="sm">
                  Customer
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Full access to visual tripboards, AI editing, stay comparisons, and budget tools.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
        </div>

        {/* Admin Card */}
        <div
          onClick={() => !isLoadingRole && handleInstantLogin('admin')}
          className="p-4 rounded-2xl border-2 border-slate-200 hover:border-purple-500 bg-white hover:bg-purple-50/40 transition-all cursor-pointer shadow-sm group flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-base group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-purple-700 transition-colors">
                  Elena Rostova
                </h4>
                <Badge variant="rose" size="sm">
                  Administrator
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Review traveller consultation enquiries, draft quotes, and manage verified catalogue items.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
        </div>

        <div className="text-center pt-2">
          <p className="text-[11px] text-slate-400">
            No password or SMS verification required in demo mode.
          </p>
        </div>
      </div>
    </Modal>
  );
}
