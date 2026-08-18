"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal, Plus, Clock, Wrench, Package, CheckCircle2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  estimatedMinutes: number;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    type: "SERVICE",
    name: "",
    description: "",
    category: "General",
    price: "1500",
    estimatedMinutes: "60",
  });

  const fetchServices = () => {
    setLoading(true);
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        setServices(data.services || []);
        setPackages(data.packages || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setIsModalOpen(false);
      fetchServices();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to save service");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
            Service Catalog & Maintenance Packages
          </h1>
          <p className="text-sm text-on-surface-variant">
            Define garage labor rates, periodic services, and bundled maintenance packages.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-container to-brand-blue text-on-primary font-semibold text-xs shadow-glow hover:opacity-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="py-12 text-center text-on-surface-variant text-sm animate-pulse">
          Loading service catalog...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div
              key={s.id}
              className="p-6 bg-surface-container-low border border-outline-variant/40 rounded-2xl shadow-lg space-y-4 hover:border-primary/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-primary-container/20 text-primary font-bold text-[10px] uppercase border border-primary-container/30">
                    {s.category}
                  </span>
                  <span className="text-xs text-on-surface-variant font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-secondary" /> {s.estimatedMinutes} mins
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-on-surface text-base">{s.name}</h3>
                  <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{s.description || "Standard garage procedure."}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between">
                <span className="text-[11px] text-on-surface-variant font-semibold">Standard Rate:</span>
                <span className="text-lg font-black text-emerald-400">{formatCurrency(s.price)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Service Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Service to Catalog"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Service Title *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Synthetic Engine Oil Change, Brake Overhaul..."
              className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="Engine" className="bg-surface-container-low">Engine</option>
                <option value="Periodic" className="bg-surface-container-low">Periodic Maintenance</option>
                <option value="Brake" className="bg-surface-container-low">Brake System</option>
                <option value="AC" className="bg-surface-container-low">AC & Heating</option>
                <option value="Suspension" className="bg-surface-container-low">Suspension & Steering</option>
                <option value="Electrical" className="bg-surface-container-low">Electrical & ECU</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Price (₹) *</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="2500"
                className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Estimated Duration (Minutes)</label>
            <input
              type="number"
              value={formData.estimatedMinutes}
              onChange={(e) => setFormData({ ...formData, estimatedMinutes: e.target.value })}
              placeholder="60"
              className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of labor & work scope..."
              className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
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
              Save Service
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
