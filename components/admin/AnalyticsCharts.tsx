"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthPoint } from "@/lib/analytics-store";

// Charts for /dashboard/admin/analytics. Recharts renders client-side only;
// the page shell and every figure is rendered on the server.

const axisStyle = { fill: "#55585f", fontSize: 11 };

function monthLabel(month: string): string {
  const [y, m] = month.split("-");
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, 1));
  return date.toLocaleDateString("en-ZA", { month: "short", timeZone: "UTC" });
}

export function LeadsChart({ data }: { data: MonthPoint[] }) {
  const points = data.map((p) => ({ ...p, label: monthLabel(p.month) }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid stroke="#1e2024" vertical={false} />
          <XAxis dataKey="label" tick={axisStyle} axisLine={{ stroke: "#2a2c31" }} tickLine={false} />
          <YAxis allowDecimals={false} tick={axisStyle} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "#131418",
              border: "1px solid #2a2c31",
              borderRadius: 6,
              fontSize: 12,
              color: "#f4f5f6",
            }}
          />
          <Bar dataKey="leads" name="Leads" fill="#f2761d" radius={[2, 2, 0, 0]} />
          <Line
            dataKey="bookings"
            name="Booked calls"
            stroke="#b9bcc3"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenueChart({ data }: { data: MonthPoint[] }) {
  const points = data.map((p) => ({
    label: monthLabel(p.month),
    net: Math.round(p.revenueNet),
    gross: Math.round(p.revenueGross),
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid stroke="#1e2024" vertical={false} />
          <XAxis dataKey="label" tick={axisStyle} axisLine={{ stroke: "#2a2c31" }} tickLine={false} />
          <YAxis
            tick={axisStyle}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) =>
              typeof v === "number"
                ? `R${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`
                : String(v)
            }
          />
          <Tooltip
            formatter={(value) =>
              typeof value === "number"
                ? new Intl.NumberFormat("en-ZA", {
                    style: "currency",
                    currency: "ZAR",
                    maximumFractionDigits: 0,
                  }).format(value)
                : String(value)
            }
            contentStyle={{
              background: "#131418",
              border: "1px solid #2a2c31",
              borderRadius: 6,
              fontSize: 12,
              color: "#f4f5f6",
            }}
          />
          <Bar dataKey="net" name="Net revenue" fill="#f2761d" radius={[2, 2, 0, 0]} />
          <Bar dataKey="gross" name="Gross" fill="#55585f" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
