'use client';

import React, { useState } from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Check, MessageSquare, DollarSign, ExternalLink, Mail, Phone } from 'lucide-react';
import { formatCurrency } from '@/lib/money';

interface AdminEnquiriesTableProps {
  initialEnquiries: any[];
}

export function AdminEnquiriesTable({ initialEnquiries }: AdminEnquiriesTableProps) {
  const [enquiries, setEnquiries] = useState(initialEnquiries);
  const [quotingEnquiry, setQuotingEnquiry] = useState<any | null>(null);
  const [quoteText, setQuoteText] = useState('');
  const [quoteAmount, setQuoteAmount] = useState('1250.00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateStatus = async (enquiryId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/enquiries/${enquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');

      setEnquiries((prev) =>
        prev.map((e) => (e.id === enquiryId ? { ...e, status: newStatus } : e))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotingEnquiry) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/enquiries/${quotingEnquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'quoted',
          quoteDetails: quoteText,
          totalAmountMinor: Math.round(parseFloat(quoteAmount) * 100),
          currency: 'USD',
        }),
      });

      if (!res.ok) throw new Error('Failed to save quote');

      setEnquiries((prev) =>
        prev.map((item) =>
          item.id === quotingEnquiry.id
            ? {
                ...item,
                status: 'quoted',
                quotes: [
                  ...item.quotes,
                  { quoteDetails: quoteText, totalAmountMinor: Math.round(parseFloat(quoteAmount) * 100), currency: 'USD' },
                ],
              }
            : item
        )
      );

      setQuotingEnquiry(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            Traveler Consultation Queue ({enquiries.length})
          </h3>
          <span className="text-xs text-slate-400">
            Assigned to Bali & Southeast Asia Specialist Desk
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-3">Traveler</th>
                <th className="px-4 py-3">Linked Trip / Dates</th>
                <th className="px-4 py-3">Enquiry Message</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Quotes</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enquiries.map((enq) => (
                <tr key={enq.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900 block">{enq.fullName}</span>
                    <span className="text-slate-500 text-[11px] flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {enq.email}
                    </span>
                    <span className="text-slate-500 text-[11px] flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {enq.phone}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    {enq.trip ? (
                      <div>
                        <span className="font-semibold text-purple-700 block">
                          {enq.trip.title}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {enq.travelDates || 'Dates pending'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">General Consultation</span>
                    )}
                  </td>

                  <td className="px-4 py-4 max-w-xs">
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {enq.message}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <Badge
                      variant={
                        enq.status === 'resolved'
                          ? 'emerald'
                          : enq.status === 'quoted'
                          ? 'purple'
                          : enq.status === 'assigned'
                          ? 'sky'
                          : 'amber'
                      }
                      size="sm"
                    >
                      {enq.status}
                    </Badge>
                  </td>

                  <td className="px-4 py-4">
                    {enq.quotes && enq.quotes.length > 0 ? (
                      <span className="font-bold text-emerald-700 text-xs">
                        {formatCurrency(enq.quotes[0].totalAmountMinor, enq.quotes[0].currency)}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">None yet</span>
                    )}
                  </td>

                  <td className="px-4 py-4 text-right space-x-1.5 whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setQuotingEnquiry(enq);
                        setQuoteText(`Official Package Quote for ${enq.trip?.title || 'Trip'}: Includes luxury villas, private driver, and all excursion admissions.`);
                      }}
                    >
                      Add Quote
                    </Button>

                    <select
                      value={enq.status}
                      onChange={(e) => handleUpdateStatus(enq.id, e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2 py-1 focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="assigned">Assigned</option>
                      <option value="quoted">Quoted</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quote Modal */}
      <Modal
        isOpen={!!quotingEnquiry}
        onClose={() => setQuotingEnquiry(null)}
        title="Draft Proposed Specialist Quote"
        description={`For ${quotingEnquiry?.fullName}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveQuote} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Package Total Amount ($ USD)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={quoteAmount}
              onChange={(e) => setQuoteAmount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quote Scope & Proposed Itinerary Revisions
            </label>
            <textarea
              rows={4}
              required
              value={quoteText}
              onChange={(e) => setQuoteText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuotingEnquiry(null)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Issue Quote to Traveler
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

