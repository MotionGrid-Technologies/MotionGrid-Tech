import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { EmptyCard } from "@/components/ui/Card";
import {
  listDemoRequests,
  listPayFastPayments,
  type DemoRequest,
  type DemoRequestStatus,
  type PayFastPayment,
} from "@/lib/lead-store";
import { listBookings, type DemoBooking } from "@/lib/booking-store";
import { formatSlotSast } from "@/lib/booking-slots";
import {
  removeDemoRequest,
  setBookingStatus,
  setDemoRequestStatus,
} from "@/lib/actions/dashboard";
import { SignOutButton } from "@/components/admin/SignOutButton";

// Data must be read per-request, never baked in at build time.
export const dynamic = "force-dynamic";

// Access is gated by middleware (auth) and the dashboard/admin layout; the
// server actions below also re-check the session role before mutating.

export const metadata = { title: "Dashboard", robots: { index: false, follow: false } };

export default async function AdminDashboardPage() {
  const demos = await listDemoRequests();
  const payments = await listPayFastPayments();
  const bookings = await listBookings();
  const now = new Date();

  const upcoming = bookings.filter(
    (b) => b.status === "scheduled" && new Date(b.slot_start) > now
  );
  const past = bookings.filter(
    (b) => b.status !== "scheduled" || new Date(b.slot_start) <= now
  );

  const counts = {
    new: demos.filter((d) => d.status === "new").length,
    contacted: demos.filter((d) => d.status === "contacted").length,
    archived: demos.filter((d) => d.status === "archived").length,
    hot: demos.filter((d) => d.score_tier === "hot").length,
  };

  return (
    <section className="py-16 md:py-24">
      <Container className="flex flex-col gap-16">
        {/* Header ---------------------------------------------------------- */}
        <header className="flex flex-col gap-4">
          <Eyebrow>Admin</Eyebrow>
          <div className="flex items-end justify-between gap-4">
            <h1 className="font-display text-4xl text-chrome-100 md:text-5xl">Dashboard</h1>
            <SignOutButton />
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-chrome-500">
            Manage demo requests and booked calls coming off the contact page,
            and review PayFast transactions. PayFast is a read-only feed until
            the ITN webhook is connected.
          </p>
        </header>

        {/* Stat strip ------------------------------------------------------ */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="Open requests" value={counts.new} />
          <Stat label="Contacted" value={counts.contacted} />
          <Stat label="Hot leads" value={counts.hot} />
          <Stat label="Upcoming calls" value={upcoming.length} />
        </div>

        {/* Upcoming bookings ---------------------------------------------- */}
        <div className="flex flex-col gap-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl text-chrome-100">Upcoming calls</h2>
            <Link
              href="/contact#demo"
              className="flex items-center gap-1 text-sm text-chrome-300 hover:text-chrome-100"
            >
              View public slots <ArrowUpRight size={14} />
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <EmptyCard
              label="No calls booked"
              note="Bookings from the 15-minute slot picker on the contact page will appear here."
            />
          ) : (
            <div className="flex flex-col divide-y divide-hairline rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40">
              {upcoming.map((b) => (
                <BookingRow key={b.id} booking={b} />
              ))}
            </div>
          )}
        </div>

        {/* Demo requests --------------------------------------------------- */}
        <div className="flex flex-col gap-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl text-chrome-100">Demo requests</h2>
            <Link
              href="/contact#demo"
              className="flex items-center gap-1 text-sm text-chrome-300 hover:text-chrome-100"
            >
              View public form <ArrowUpRight size={14} />
            </Link>
          </div>

          {demos.length === 0 ? (
            <EmptyCard
              label="No requests yet"
              note="Submissions from the contact page will appear here."
            />
          ) : (
            <div className="flex flex-col divide-y divide-hairline rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40">
              {demos.map((d) => (
                <DemoRow key={d.id} request={d} />
              ))}
            </div>
          )}
        </div>

        {/* Past bookings --------------------------------------------------- */}
        {past.length > 0 && (
          <div className="flex flex-col gap-6">
            <h2 className="font-display text-2xl text-chrome-100">Booking history</h2>
            <div className="flex flex-col divide-y divide-hairline rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40">
              {past.slice(0, 20).map((b) => (
                <BookingRow key={b.id} booking={b} />
              ))}
            </div>
          </div>
        )}

        {/* PayFast payments ----------------------------------------------- */}
        <div className="flex flex-col gap-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl text-chrome-100">PayFast</h2>
            <span className="text-xs text-chrome-700">Read-only · awaiting ITN webhook</span>
          </div>

          {payments.length === 0 ? (
            <EmptyCard
              label="No payments yet"
              note="Transactions will land here once the PayFast ITN route is wired up."
            />
          ) : (
            <PaymentsTable payments={payments} />
          )}
        </div>
      </Container>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/40 p-5">
      <div className="font-display text-3xl text-chrome-100">{value}</div>
      <div className="mg-eyebrow mt-1.5">{label}</div>
    </div>
  );
}

const STATUS_LABEL: Record<DemoRequestStatus, string> = {
  new: "New",
  contacted: "Contacted",
  archived: "Archived",
};

const STATUS_TONE: Record<DemoRequestStatus, string> = {
  new: "text-signal border-signal/40",
  contacted: "text-chrome-100 border-chrome-500",
  archived: "text-chrome-700 border-hairline",
};

const TIER_TONE: Record<string, string> = {
  hot: "text-signal border-signal/40",
  warm: "text-chrome-100 border-chrome-500",
  cold: "text-chrome-700 border-hairline",
};

function DemoRow({ request: r }: { request: DemoRequest }) {
  const created = new Date(r.created_at).toLocaleString("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <article className="flex flex-col gap-4 p-6 md:flex-row md:items-start md:justify-between">
      {/* Details */}
      <div className="flex flex-col gap-2 md:max-w-[60%]">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-display text-lg text-chrome-100">{r.name}</h3>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[0.7rem] tracking-wide ${STATUS_TONE[r.status]}`}
          >
            {STATUS_LABEL[r.status]}
          </span>
          {r.score_tier && (
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[0.7rem] tracking-wide ${TIER_TONE[r.score_tier] ?? ""}`}
              title={r.score !== null ? `Lead score: ${r.score}/100` : undefined}
            >
              {r.score_tier} · {r.score ?? "—"}
            </span>
          )}
          <span className="text-xs text-chrome-700">{created}</span>
        </div>
        {r.company && <p className="text-sm text-chrome-300">{r.company}</p>}
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-chrome-500">
          <a href={`mailto:${r.email}`} className="hover:text-chrome-100">
            {r.email}
          </a>
          {r.phone && <a href={`tel:${r.phone.replace(/\s+/g, "")}`}>{r.phone}</a>}
        </div>
        {r.message && (
          <p className="mt-1 text-sm leading-relaxed text-chrome-500">{r.message}</p>
        )}
      </div>

      {/* Actions */}
      <form className="flex shrink-0 flex-wrap gap-2">
        <input type="hidden" name="id" value={r.id} />
        {r.status !== "new" && (
          <button
            formAction={setDemoRequestStatus.bind(null, r.id, "new")}
            className="rounded-[var(--radius-mg)] border border-hairline px-3 py-1.5 text-xs text-chrome-300 hover:border-chrome-500 hover:text-chrome-100"
          >
            Mark new
          </button>
        )}
        {r.status !== "contacted" && (
          <button
            formAction={setDemoRequestStatus.bind(null, r.id, "contacted")}
            className="rounded-[var(--radius-mg)] border border-hairline px-3 py-1.5 text-xs text-chrome-300 hover:border-chrome-500 hover:text-chrome-100"
          >
            Mark contacted
          </button>
        )}
        {r.status !== "archived" && (
          <button
            formAction={setDemoRequestStatus.bind(null, r.id, "archived")}
            className="rounded-[var(--radius-mg)] border border-hairline px-3 py-1.5 text-xs text-chrome-300 hover:border-chrome-500 hover:text-chrome-100"
          >
            Archive
          </button>
        )}
        <button
          formAction={removeDemoRequest.bind(null, r.id)}
          className="rounded-[var(--radius-mg)] border border-signal/30 px-3 py-1.5 text-xs text-signal hover:border-signal"
        >
          Delete
        </button>
      </form>
    </article>
  );
}

function formatZAR(value: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(value);
}

const BOOKING_STATUS_TONE: Record<DemoBooking["status"], string> = {
  scheduled: "text-signal border-signal/40",
  completed: "text-chrome-100 border-chrome-500",
  cancelled: "text-chrome-700 border-hairline",
};

function BookingRow({ booking: b }: { booking: DemoBooking }) {
  const slot = formatSlotSast(new Date(b.slot_start));

  return (
    <article className="flex flex-col gap-4 p-6 md:flex-row md:items-start md:justify-between">
      <div className="flex flex-col gap-2 md:max-w-[60%]">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-display text-lg text-chrome-100">{slot}</h3>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[0.7rem] tracking-wide ${BOOKING_STATUS_TONE[b.status]}`}
          >
            {b.status}
          </span>
          <span className="text-xs text-chrome-700">{b.duration_minutes} min</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 text-sm text-chrome-300">
          <span className="font-display">{b.name}</span>
          {b.company && <span className="text-chrome-500">{b.company}</span>}
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-chrome-500">
          <a href={`mailto:${b.email}`} className="hover:text-chrome-100">
            {b.email}
          </a>
          {b.phone && <a href={`tel:${b.phone.replace(/\s+/g, "")}`}>{b.phone}</a>}
        </div>
        {b.message && (
          <p className="mt-1 text-sm leading-relaxed text-chrome-500">{b.message}</p>
        )}
      </div>

      {b.status === "scheduled" && (
        <form className="flex shrink-0 flex-wrap gap-2">
          <button
            formAction={setBookingStatus.bind(null, b.id, "completed")}
            className="rounded-[var(--radius-mg)] border border-hairline px-3 py-1.5 text-xs text-chrome-300 hover:border-chrome-500 hover:text-chrome-100"
          >
            Mark completed
          </button>
          <button
            formAction={setBookingStatus.bind(null, b.id, "cancelled")}
            className="rounded-[var(--radius-mg)] border border-signal/30 px-3 py-1.5 text-xs text-signal hover:border-signal"
          >
            Cancel
          </button>
        </form>
      )}
    </article>
  );
}

function PaymentsTable({ payments }: { payments: PayFastPayment[] }) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-mg-lg)] border border-hairline">
      <table className="w-full text-left text-sm">
        <thead className="bg-graphite/60 text-xs uppercase tracking-wide text-chrome-700">
          <tr>
            <Th>PayFast ID</Th>
            <Th>Item</Th>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th align="right">Gross</Th>
            <Th align="right">Fee</Th>
            <Th align="right">Net</Th>
            <Th>Status</Th>
            <Th>Date</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {payments.map((p) => (
            <tr key={p.id} className="text-chrome-500">
              <Td className="font-mono text-xs">{p.pf_payment_id || "—"}</Td>
              <Td>{p.item_name || "—"}</Td>
              <Td>{[p.name_first, p.name_last].filter(Boolean).join(" ") || "—"}</Td>
              <Td>{p.email_address || "—"}</Td>
              <Td align="right" className="text-chrome-100">{formatZAR(p.amount_gross)}</Td>
              <Td align="right">{formatZAR(p.amount_fee)}</Td>
              <Td align="right" className="text-chrome-100">{formatZAR(p.amount_net)}</Td>
              <Td>
                <span className="text-chrome-300">{p.status}</span>
              </Td>
              <Td className="text-xs text-chrome-700">
                {new Date(p.created_at).toLocaleDateString("en-ZA")}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return <th className={`px-4 py-3 ${align === "right" ? "text-right" : "text-left"}`}>{children}</th>;
}

function Td({
  children,
  align = "left",
  className = "",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <td className={`px-4 py-3 ${align === "right" ? "text-right" : "text-left"} ${className}`}>
      {children}
    </td>
  );
}