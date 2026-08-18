"use client";

import { useEffect, useState } from "react";
import { UserCheck, Plus, Phone, Mail, Award, Wrench, IndianRupee, CheckCircle2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { formatCurrency, getStatusBadgeClass } from "@/lib/utils";

interface Mechanic {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  hourlyRate: number;
  status: string;
  completedJobsCount: number;
  activeJobsCount: number;
  totalRevenueGenerated: number;
}

export default function MechanicsPage() {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "General Maintenance",
    hourlyRate: "450",
    status: "AVAILABLE",
  });

  const fetchMechanics = () => {
    setLoading(true);
    fetch("/api/mechanics")
      .then((res) => res.json())
      .then((data) => {
        setMechanics(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMechanics();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/mechanics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setIsModalOpen(false);
      fetchMechanics();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to add mechanic");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
            Mechanics Roster & Performance
          </h1>
          <p className="text-sm text-on-surface-variant">
            Track technician specializations, assigned workshop jobs, and labor throughput.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-container to-brand-blue text-on-primary font-semibold text-xs shadow-glow hover:opacity-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Mechanic</span>
        </button>
      </div>

      {/* Roster Cards */}
      {loading ? (
        <div className="py-12 text-center text-on-surface-variant text-sm animate-pulse">
          Loading mechanic records...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mechanics.map((m) => (
            <div
              key={m.id}
              className="p-6 bg-surface-container-low border border-outline-variant/40 rounded-2xl shadow-lg space-y-4 hover:border-primary/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary font-bold text-lg">
                    {m.name.charAt(0)}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusBadgeClass(m.status)}`}>
                    {m.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-on-surface text-base">{m.name}</h3>
                  <p className="text-xs text-primary font-semibold flex items-center gap-1 mt-0.5">
                    <Award className="w-3.5 h-3.5" /> {m.specialization}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-highest/50 border border-outline-variant/30 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Phone:</span>
                    <span className="font-semibold text-on-surface">{m.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Rate:</span>
                    <span className="font-semibold text-secondary">₹{m.hourlyRate}/hr</span>
                  </div>
                </div>

                {/* DB Calculated Performance */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-surface-container/60 border border-outline-variant/30">
                    <span className="block font-black text-emerald-400 text-sm">{m.completedJobsCount}</span>
                    <span className="text-[10px] text-on-surface-variant">Jobs Done</span>
                  </div>
                  <div className="p-2 rounded-xl bg-surface-container/60 border border-outline-variant/30">
                    <span className="block font-black text-primary text-sm">{formatCurrency(m.totalRevenueGenerated)}</span>
                    <span className="text-[10px] text-on-surface-variant">Work Value</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Mechanic Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Mechanic"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Mechanic Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Vikram Singh"
                className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98111 22233"
                className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="vikram@skcar.com"
                className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Specialization</label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="Electrical, ECU Diagnostics, Engine..."
                className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Hourly Rate (₹)</label>
              <input
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                placeholder="450"
                className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="AVAILABLE" className="bg-surface-container-low">AVAILABLE</option>
                <option value="BUSY" className="bg-surface-container-low">BUSY</option>
                <option value="ON_LEAVE" className="bg-surface-container-low">ON_LEAVE</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-bright"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary-container to-brand-blue text-on-primary text-xs font-bold shadow-glow hover:opacity-95"
            >
              Save Mechanic
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
