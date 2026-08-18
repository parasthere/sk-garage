"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Calendar, 
  Wrench, 
  IndianRupee, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Plus, 
  Car,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { formatCurrency, getStatusBadgeClass } from "@/lib/utils";

interface DashboardData {
  metrics: {
    todayAppointments: number;
    pendingJobs: number;
    completedJobs: number;
    totalRevenue: number;
    lowStockCount: number;
  };
  lowStockParts: any[];
  recentJobCards: any[];
  notifications: any[];
  monthlyRevenue: any[];
  jobStatuses: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-surface-container-high rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-surface-container-low border border-outline-variant/30 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {
    todayAppointments: 0,
    pendingJobs: 0,
    completedJobs: 0,
    totalRevenue: 0,
    lowStockCount: 0,
  };

  const COLORS = ["#4b8eff", "#00d2ff", "#ef6719", "#adc6ff"];

  return (
    <div className="space-y-8">
      {/* Page Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
            Garage Command Dashboard
          </h1>
          <p className="text-sm text-on-surface-variant">
            Live telemetry & operational management for SK Car Garage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/job-cards?new=true"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-container to-brand-blue text-on-primary font-semibold text-xs shadow-glow hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Job Card</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Today's Appointments */}
        <div className="p-6 bg-surface-container-low border border-outline-variant/40 rounded-2xl shadow-lg relative overflow-hidden group hover:border-primary/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Today's Schedule
            </span>
            <div className="w-10 h-10 rounded-xl bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-on-surface">
              {metrics.todayAppointments}
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +15%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-on-surface-variant">Appointments queued for today</p>
        </div>

        {/* Metric 2: Pending Job Cards */}
        <div className="p-6 bg-surface-container-low border border-outline-variant/40 rounded-2xl shadow-lg relative overflow-hidden group hover:border-secondary/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Active Job Cards
            </span>
            <div className="w-10 h-10 rounded-xl bg-secondary-container/20 border border-secondary-container/40 flex items-center justify-center text-secondary">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-on-surface">
              {metrics.pendingJobs}
            </span>
            <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              In Workshop
            </span>
          </div>
          <p className="mt-1 text-[11px] text-on-surface-variant">Inspection & repair pipeline</p>
        </div>

        {/* Metric 3: Total Revenue */}
        <div className="p-6 bg-surface-container-low border border-outline-variant/40 rounded-2xl shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Monthly Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-on-surface">
              {formatCurrency(metrics.totalRevenue)}
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Live DB
            </span>
          </div>
          <p className="mt-1 text-[11px] text-on-surface-variant">Settled & partial invoices</p>
        </div>

        {/* Metric 4: Low Stock Warning */}
        <div className="p-6 bg-surface-container-low border border-outline-variant/40 rounded-2xl shadow-lg relative overflow-hidden group hover:border-tertiary/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Low Stock Alerts
            </span>
            <div className="w-10 h-10 rounded-xl bg-tertiary-container/20 border border-tertiary-container/40 flex items-center justify-center text-tertiary">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-on-surface">
              {metrics.lowStockCount}
            </span>
            <span className="text-xs font-medium text-tertiary bg-tertiary-container/20 px-2 py-0.5 rounded-full border border-tertiary/30">
              Needs Restock
            </span>
          </div>
          <p className="mt-1 text-[11px] text-on-surface-variant">Parts below minimum threshold</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Growth Trend Chart */}
        <div className="lg:col-span-2 p-6 bg-surface-container-low border border-outline-variant/40 rounded-2xl shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-on-surface">Revenue Telemetry (₹)</h3>
              <p className="text-xs text-on-surface-variant">Monthly garage billing throughput</p>
            </div>
            <span className="text-xs font-semibold text-primary bg-primary-container/20 px-3 py-1 rounded-full border border-primary-container/30">
              YTD 2026
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthlyRevenue || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4b8eff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4b8eff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#8b90a0" fontSize={12} tickLine={false} />
                <YAxis stroke="#8b90a0" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1c2028", borderColor: "#414755", borderRadius: "12px" }}
                  formatter={(val: any) => [`₹${val.toLocaleString("en-IN")}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4b8eff" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Warning Box & Quick Actions */}
        <div className="p-6 bg-surface-container-low border border-outline-variant/40 rounded-2xl shadow-lg flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <h3 className="font-bold text-on-surface flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-tertiary" />
                Critical Inventory
              </h3>
              <Link href="/inventory" className="text-xs text-primary font-semibold hover:underline">
                Manage All
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {data?.lowStockParts.length === 0 ? (
                <div className="text-center py-8 text-on-surface-variant text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                  All inventory items are well-stocked!
                </div>
              ) : (
                data?.lowStockParts.slice(0, 4).map((part: any) => (
                  <div
                    key={part.id}
                    className="p-3 rounded-xl bg-surface-container-highest/50 border border-outline-variant/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-on-surface">{part.name}</p>
                      <p className="text-[10px] text-on-surface-variant">PN: {part.partNumber}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-tertiary">{part.stock} in stock</span>
                      <p className="text-[10px] text-on-surface-variant">Min: {part.minStock}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href="/inventory?restock=true"
            className="w-full py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/50 text-center font-semibold text-xs text-on-surface hover:bg-surface-bright transition-colors"
          >
            Create Supplier Purchase Order
          </Link>
        </div>
      </div>

      {/* Recent Job Cards Data Table */}
      <div className="p-6 bg-surface-container-low border border-outline-variant/40 rounded-2xl shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-on-surface text-lg">Active Job Card Roster</h3>
            <p className="text-xs text-on-surface-variant">Live workshop job status and mechanic assignments</p>
          </div>
          <Link
            href="/job-cards"
            className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline"
          >
            View All Cards <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/40 text-on-surface-variant uppercase text-[10px] tracking-wider bg-surface-container/60">
                <th className="p-3 rounded-l-xl">Job Number</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Vehicle Details</th>
                <th className="p-3">Assigned Mechanic</th>
                <th className="p-3">Status</th>
                <th className="p-3 rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {data?.recentJobCards.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-on-surface-variant">
                    No active job cards found.
                  </td>
                </tr>
              ) : (
                data?.recentJobCards.map((jc: any) => (
                  <tr key={jc.id} className="hover:bg-surface-container-high/40 transition-colors">
                    <td className="p-3 font-bold text-primary">{jc.jobNumber}</td>
                    <td className="p-3 font-medium text-on-surface">{jc.customer.name}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-on-surface-variant" />
                        <span>
                          {jc.vehicle.make} {jc.vehicle.model} ({jc.vehicle.plateNumber})
                        </span>
                      </div>
                    </td>
                    <td className="p-3 font-medium text-on-surface-variant">
                      {jc.mechanic?.name || "Unassigned"}
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusBadgeClass(jc.status)}`}>
                        {jc.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/job-cards?id=${jc.id}`}
                        className="px-3 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant/40 text-on-surface hover:text-primary font-semibold transition-colors"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
