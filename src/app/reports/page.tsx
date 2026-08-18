"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, IndianRupee, Wrench, Users, ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-on-surface-variant text-sm animate-pulse">Loading analytics report...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
          Executive Reports & Analytics
        </h1>
        <p className="text-sm text-on-surface-variant">
          Workshop throughput metrics, revenue performance, and technician efficiency.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-surface-container-low border border-outline-variant/40 rounded-2xl shadow-lg space-y-2">
          <span className="text-xs font-bold text-on-surface-variant uppercase">Settled Workshop Revenue</span>
          <p className="text-3xl font-black text-emerald-400">{formatCurrency(data?.revenue || 0)}</p>
        </div>

        <div className="p-6 bg-surface-container-low border border-outline-variant/40 rounded-2xl shadow-lg space-y-2">
          <span className="text-xs font-bold text-on-surface-variant uppercase">Completed Vehicle Repairs</span>
          <p className="text-3xl font-black text-primary">{data?.completedJobs || 0} Jobs</p>
        </div>

        <div className="p-6 bg-surface-container-low border border-outline-variant/40 rounded-2xl shadow-lg space-y-2">
          <span className="text-xs font-bold text-on-surface-variant uppercase">Pending Workshop Pipeline</span>
          <p className="text-3xl font-black text-amber-400">{data?.pendingJobs || 0} Jobs</p>
        </div>
      </div>

      {/* Mechanic Performance Report */}
      <div className="p-6 bg-surface-container-low border border-outline-variant/40 rounded-2xl shadow-lg space-y-4">
        <h3 className="font-bold text-on-surface text-lg">Mechanic Productivity Leaderboard</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/40 text-on-surface-variant uppercase text-[10px] tracking-wider bg-surface-container/60">
                <th className="p-3.5 rounded-l-xl">Technician Name</th>
                <th className="p-3.5">Completed Job Cards</th>
                <th className="p-3.5 rounded-r-xl text-right">Work Value Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {data?.mechanicPerformance.map((m: any, idx: number) => (
                <tr key={idx} className="hover:bg-surface-container-high/40 transition-colors">
                  <td className="p-3.5 font-bold text-on-surface">{m.name}</td>
                  <td className="p-3.5 font-semibold text-primary">{m.completedJobs} Completed</td>
                  <td className="p-3.5 text-right font-black text-emerald-400">{formatCurrency(m.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
