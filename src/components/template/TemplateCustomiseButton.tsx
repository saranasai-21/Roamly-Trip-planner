'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface TemplateCustomiseButtonProps {
  templateSlug: string;
  isPaid?: boolean;
  priceMinor?: number;
}

export function TemplateCustomiseButton({
  templateSlug,
  isPaid,
  priceMinor,
}: TemplateCustomiseButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCustomise = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/templates/${templateSlug}/duplicate`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to customise template');

      // Navigate directly to the duplicated trip's tripboard!
      router.push(`/trips/${data.tripId}`);
    } catch (err: any) {
      alert(err.message || 'Error duplicating trip');
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCustomise}
      isLoading={isLoading}
      size="md"
      className="font-bold shadow-lg shadow-purple-600/30 whitespace-nowrap"
    >
      <Sparkles className="w-4 h-4 mr-1.5" />
      <span>{isPaid ? 'Unlock & Customise' : 'Duplicate & Customise'}</span>
      <ArrowRight className="w-4 h-4 ml-1.5" />
    </Button>
  );
}

