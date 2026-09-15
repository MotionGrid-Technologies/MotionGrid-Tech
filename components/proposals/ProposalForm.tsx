"use client";

import { useState, useTransition, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClientAction } from "@/app/dashboard/admin/proposals/actions";
import type { ClientRecord } from "@/lib/clients-store";
import type { ProposalItemInput } from "@/lib/proposals-store";

function formatZAR(value: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(value);
}

interface ProposalFormProps {
  clients: ClientRecord[];
  action: (formData: FormData) => void;
  initial?: {
    client_id: string;
    title: string;
    description: string;
    valid_until: string;
    items: ProposalItemInput[];
  };
  submitLabel: string;
}

export function ProposalForm({ clients, action, initial, submitLabel }: ProposalFormProps) {
  const [clientList, setClientList] = useState(clients);
  const [clientId, setClientId] = useState(initial?.client_id ?? "");
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", company: "", email: "", phone: "" });
  const [items, setItems] = useState<ProposalItemInput[]>(
    initial?.items?.length ? initial.items : [{ name: "", description: "", quantity: 1, unit_price: 0 }]
  );
  const [isPending, startTransition] = useTransition();

  const total = useMemo(
    () => items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0), 0),
    [items]
  );

  function updateItem(index: number, patch: Partial<ProposalItemInput>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { name: "", description: "", quantity: 1, unit_price: 0 }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleCreateClient() {
    if (!newClient.name || !newClient.company || !newClient.email) return;
    startTransition(async () => {
      const record = await createClientAction(newClient);
      setClientList((prev) => [...prev, record].sort((a, b) => a.company.localeCompare(b.company)));
      setClientId(record.id);
      setShowNewClient(false);
      setNewClient({ name: "", company: "", email: "", phone: "" });
    });
  }

  return (
    <form action={action} className="flex flex-col gap-10">
      {/* Client ---------------------------------------------------------- */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-chrome-100">Client</h2>

        <div className="flex flex-wrap items-center gap-3">
          <select
            name="client_id"
            required
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="mg-input min-w-[240px] max-w-full"
            aria-label="Select a client"
          >
            <option value="" disabled>
              Select a client
            </option>
            {clientList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company} — {c.name}
              </option>
            ))}
          </select>

          <Button type="button" variant="chrome" size="sm" onClick={() => setShowNewClient((v) => !v)}>
            <Plus size={14} />
            Create New Client
          </Button>
        </div>

        {showNewClient && (
          <div className="flex flex-col gap-3 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 p-5">
            <div className="grid gap-3 md:grid-cols-2">
              <input
                placeholder="Contact name"
                aria-label="Contact name"
                value={newClient.name}
                onChange={(e) => setNewClient((p) => ({ ...p, name: e.target.value }))}
                className="mg-input"
              />
              <input
                placeholder="Company"
                aria-label="Company"
                value={newClient.company}
                onChange={(e) => setNewClient((p) => ({ ...p, company: e.target.value }))}
                className="mg-input"
              />
              <input
                type="email"
                placeholder="Email"
                aria-label="Email"
                value={newClient.email}
                onChange={(e) => setNewClient((p) => ({ ...p, email: e.target.value }))}
                className="mg-input"
              />
              <input
                placeholder="Phone (optional)"
                aria-label="Phone (optional)"
                value={newClient.phone}
                onChange={(e) => setNewClient((p) => ({ ...p, phone: e.target.value }))}
                className="mg-input"
              />
            </div>
            <Button type="button" variant="primary" size="sm" disabled={isPending} onClick={handleCreateClient}>
              {isPending ? "Saving..." : "Save Client"}
            </Button>
          </div>
        )}
      </section>

      {/* Proposal details -------------------------------------------------- */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-chrome-100">Proposal Details</h2>

        <label className="flex flex-col gap-1.5 text-sm text-chrome-500">
          Title
          <input
            name="title"
            required
            defaultValue={initial?.title}
            placeholder="Website Development Package"
            className="mg-input"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-chrome-500">
          Description
          <textarea
            name="description"
            defaultValue={initial?.description}
            rows={4}
            className="mg-input"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-chrome-500 md:w-64">
          Valid Until
          <input
            type="date"
            name="valid_until"
            defaultValue={initial?.valid_until}
            className="mg-input"
          />
        </label>
      </section>

      {/* Items ------------------------------------------------------------ */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-chrome-100">Services / Items</h2>

        <div className="overflow-x-auto rounded-[var(--radius-mg-lg)] border border-hairline">
          <table className="w-full text-left text-sm">
            <thead className="bg-graphite/60 text-xs uppercase tracking-wide text-chrome-700">
              <tr>
                <th className="px-4 py-3">Service</th>
                <th className="w-24 px-4 py-3">Qty</th>
                <th className="w-36 px-4 py-3">Unit Price</th>
                <th className="w-32 px-4 py-3 text-right">Total</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {items.map((item, i) => (
                <tr key={i}>
                  <td className="px-4 py-2">
                    <input
                      value={item.name}
                      onChange={(e) => updateItem(i, { name: e.target.value })}
                      placeholder="Website Design"
                      aria-label={`Item ${i + 1} name`}
                      className="mg-input"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min={0}
                      step="0.5"
                      value={item.quantity}
                      onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })}
                      aria-label={`Item ${i + 1} quantity`}
                      className="mg-input"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateItem(i, { unit_price: Number(e.target.value) })}
                      aria-label={`Item ${i + 1} unit price`}
                      className="mg-input"
                    />
                  </td>
                  <td className="px-4 py-2 text-right text-chrome-100">
                    {formatZAR((Number(item.quantity) || 0) * (Number(item.unit_price) || 0))}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button type="button" onClick={() => removeItem(i)} className="text-chrome-700 hover:text-signal" aria-label={`Remove item ${i + 1}`}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between">
          <Button type="button" variant="chrome" size="sm" onClick={addItem}>
            <Plus size={14} />
            Add Item
          </Button>
          <div className="text-right">
            <div className="mg-eyebrow text-chrome-700">Total</div>
            <div className="font-display text-2xl text-chrome-100">{formatZAR(total)}</div>
          </div>
        </div>
      </section>

      <input type="hidden" name="items" value={JSON.stringify(items)} />

      <div className="flex justify-end gap-3">
        <Button href="/dashboard/admin/proposals" variant="ghost">
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
