'use client'

import { useState } from 'react'
import { X, Loader2, FileDown, MessageCircle, ArrowUpRight } from 'lucide-react'
import { toast } from 'sonner'
import type { Database } from '@/types/database'
import { StatusBadge } from '@/components/ui/StatusBadge'

type Quote = Database['public']['Tables']['quotes']['Row']
type Status = NonNullable<Quote['status']>

interface LineItem {
  description?: string
  qty?: number
  unit_price?: number
}

interface QuoteDetailModalProps {
  quote: Quote
  onClose: () => void
  onStatusChange: (quote: Quote) => void
  admin?: boolean
}

const ADMIN_STATUSES: Status[] = [
  'pending',
  'sent',
  'accepted',
  'declined',
  'completed',
  'cancelled',
]

function formatCurrency(value: number | null | undefined) {
  if (value == null) return '—'
  return `R${value.toLocaleString('en-ZA', { maximumFractionDigits: 2 })}`
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wider text-grey-medium font-semibold">
        {label}
      </span>
      <span className="text-sm text-grey-dark">{children}</span>
    </div>
  )
}

export function QuoteDetailModal({
  quote,
  onClose,
  onStatusChange,
  admin = false,
}: QuoteDetailModalProps) {
  const [transitioning, setTransitioning] = useState<Status | null>(null)

  const lineItems: LineItem[] = Array.isArray(quote.line_items)
    ? (quote.line_items as LineItem[])
    : []

  async function handleStatusChange(status: Status) {
    setTransitioning(status)
    try {
      const res = await fetch('/api/quotes/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [quote.id], status }),
      })

      if (!res.ok) throw new Error('Failed to update quote status')

      toast.success(`Quote marked as ${status}`)
      onStatusChange({ ...quote, status })
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Failed to update quote. Please try again.')
    } finally {
      setTransitioning(null)
    }
  }

  function triggerWhatsApp() {
    let cleanPhone = (quote.customer_phone || '').replace(/[^\d]/g, '')
    if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
      cleanPhone = '27' + cleanPhone.substring(1)
    }
    window.open(
      `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `Hi ${quote.customer_name}, regarding your quote ${quote.quote_number ?? ''} for your ${quote.vehicle_make ?? 'vehicle'} ${quote.vehicle_model ?? ''}:`
      )}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-base shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-grey-light sticky top-0 bg-white">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-grey-dark">
              Quote {quote.quote_number ?? quote.id.slice(0, 8)}
            </h2>
            <p className="text-xs text-grey-medium">
              Created {quote.created_at ? new Date(quote.created_at).toLocaleDateString('en-ZA') : '—'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={quote.status ?? 'pending'} />
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-base hover:bg-grey-lightest text-grey-medium transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Customer">
              {quote.customer_name}
              <span className="block text-xs text-grey-medium">
                {quote.customer_phone}
                {quote.customer_email ? ` · ${quote.customer_email}` : ''}
              </span>
            </Field>
            <Field label="Vehicle">
              {[quote.vehicle_make, quote.vehicle_model, quote.vehicle_year]
                .filter(Boolean)
                .join(' ') || '—'}
            </Field>
            <Field label="Service">{quote.service_type ?? '—'}</Field>
            <Field label="Expiry">
              {quote.expiry_date
                ? new Date(quote.expiry_date).toLocaleDateString('en-ZA')
                : '—'}
            </Field>
          </div>

          {quote.description && (
            <Field label="Description">{quote.description}</Field>
          )}

          {lineItems.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-wider text-grey-medium font-semibold">
                Line items
              </span>
              <div className="border border-grey-medium/10 rounded-base overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-grey-medium/20 text-grey uppercase tracking-wider text-xs">
                      <th className="py-2.5 px-4 font-bold">Item</th>
                      <th className="py-2.5 px-4 font-bold text-right">Qty</th>
                      <th className="py-2.5 px-4 font-bold text-right">Price</th>
                      <th className="py-2.5 px-4 font-bold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-grey-light">
                    {lineItems.map((item, i) => (
                      <tr key={i}>
                        <td className="py-2.5 px-4 text-grey-dark">
                          {item.description ?? '—'}
                        </td>
                        <td className="py-2.5 px-4 text-right text-grey-dark">
                          {item.qty ?? '—'}
                        </td>
                        <td className="py-2.5 px-4 text-right text-grey-dark">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-semibold text-grey-dark">
                          {formatCurrency(
                            (item.qty ?? 0) * (item.unit_price ?? 0)
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 border-t border-grey-light pt-4">
            <Field label="Subtotal">{formatCurrency(quote.subtotal)}</Field>
            <Field label="Discount">{quote.discount_percent}%</Field>
            <Field label="Deposit">
              {quote.deposit_amount != null
                ? `${formatCurrency(quote.deposit_amount)}${
                    quote.deposit_percent ? ` (${quote.deposit_percent}%)` : ''
                  }`
                : '—'}
            </Field>
            <Field label="Total">
              <span className="text-base font-bold">
                {formatCurrency(quote.total ?? quote.estimated_quote)}
              </span>
            </Field>
          </div>

          {quote.notes && <Field label="Notes">{quote.notes}</Field>}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 p-6 border-t border-grey-light">
          {admin && (
            <>
              <button
                type="button"
                onClick={triggerWhatsApp}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-base transition-colors"
              >
                <MessageCircle size={14} className="fill-white" />
                WhatsApp
                <ArrowUpRight size={10} className="opacity-70" />
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch(
                      `/api/quotes/${quote.id}/pdf?skipEmail=true`,
                      { method: 'POST' }
                    )
                    const data = await res.json()
                    if (res.ok && data.storagePath) {
                      window.open(
                        `/api/quotes/${quote.id}/pdf/download`,
                        '_blank'
                      )
                      toast.success('PDF ready!')
                    } else {
                      toast.error(data.error || 'Failed to generate PDF')
                    }
                  } catch {
                    toast.error('Failed to generate PDF')
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-grey-lightest hover:bg-grey-light text-grey-dark text-xs font-bold rounded-base transition-colors"
              >
                <FileDown size={14} />
                Download PDF
              </button>
              <div className="flex items-center gap-1.5 border-l border-grey-light pl-2 ml-1">
                {ADMIN_STATUSES.filter((s) => s !== quote.status).map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={transitioning !== null}
                    onClick={() => handleStatusChange(status)}
                    className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-bold rounded-base bg-white border border-grey-medium/20 hover:border-primary/40 hover:bg-primary/10 text-grey-dark transition-all disabled:opacity-50 capitalize"
                  >
                    {transitioning === status ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      status
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
          {!admin && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-base bg-grey-lightest hover:bg-grey-light text-grey-dark transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
