"use client";

import { useEffect, useState } from "react";
import { Car, Plus, Search, User, ShieldCheck, Gauge, Edit2, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  vin?: string;
  color?: string;
  fuelType: string;
  mileage: number;
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  jobCards: any[];
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    customerId: "",
    make: "",
    model: "",
    year: "2023",
    plateNumber: "",
    vin: "",
    color: "",
    fuelType: "PETROL",
    mileage: "0",
  });

  const fetchData = () => {
    setLoading(true);
    fetch(`/api/vehicles?query=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((data) => {
        setVehicles(Array.isArray(data) ? data : []);
        setLoading(false);
      });

    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => setCustomers(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleOpenCreate = () => {
    setEditingVehicle(null);
    setFormData({
      customerId: customers[0]?.id || "",
      make: "",
      model: "",
      year: "2023",
      plateNumber: "",
      vin: "",
      color: "",
      fuelType: "PETROL",
      mileage: "0",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setFormData({
      customerId: v.customer.id,
      make: v.make,
      model: v.model,
      year: String(v.year),
      plateNumber: v.plateNumber,
      vin: v.vin || "",
      color: v.color || "",
      fuelType: v.fuelType,
      mileage: String(v.mileage),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingVehicle ? "PUT" : "POST";
    const payload = editingVehicle ? { id: editingVehicle.id, ...formData } : formData;

    const res = await fetch("/api/vehicles", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setIsModalOpen(false);
      fetchData();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to save vehicle");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    const res = await fetch(`/api/vehicles?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
            Vehicle Registry
          </h1>
          <p className="text-sm text-on-surface-variant">
            Customer vehicle records, VIN numbers, mileage, and service logs.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-container to-brand-blue text-on-primary font-semibold text-xs shadow-glow hover:opacity-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Register Vehicle</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-surface-container-low border border-outline-variant/40 rounded-2xl flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search by Make, Model, License Plate, or VIN number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-highest/60 border border-outline-variant/50 rounded-xl pl-10 pr-4 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Vehicles Roster Grid */}
      {loading ? (
        <div className="py-12 text-center text-on-surface-variant text-sm animate-pulse">
          Loading vehicle registry...
        </div>
      ) : vehicles.length === 0 ? (
        <div className="p-12 bg-surface-container-low border border-outline-variant/40 rounded-2xl text-center space-y-3">
          <Car className="w-12 h-12 mx-auto text-on-surface-variant/50" />
          <p className="text-sm font-semibold text-on-surface">No vehicles registered</p>
          <p className="text-xs text-on-surface-variant">Register a new vehicle to connect to customer jobs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="p-5 bg-surface-container-low border border-outline-variant/40 rounded-2xl shadow-lg space-y-4 hover:border-primary/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary">
                      <Car className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-on-surface text-base">
                        {v.make} {v.model}
                      </h3>
                      <p className="text-[11px] text-on-surface-variant">Year: {v.year} • Color: {v.color || "N/A"}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-secondary-container/20 text-secondary font-bold text-[10px] border border-secondary-container/30">
                    {v.fuelType}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-highest/50 border border-outline-variant/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-on-surface-variant text-[11px]">Plate Number:</span>
                    <span className="font-bold text-primary bg-background px-2 py-0.5 rounded border border-outline-variant">
                      {v.plateNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant text-[11px]">VIN:</span>
                    <span className="font-semibold text-on-surface text-[11px]">{v.vin || "Not Provided"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant text-[11px]">Odometer:</span>
                    <span className="font-semibold text-on-surface flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-secondary" /> {v.mileage.toLocaleString()} km
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-on-surface">
                  <User className="w-4 h-4 text-primary" />
                  <span>Owner: <strong className="text-on-surface">{v.customer?.name}</strong></span>
                </div>
              </div>

              <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between">
                <span className="text-[10px] text-on-surface-variant font-semibold">
                  {v.jobCards.length} Job Card(s)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(v)}
                    className="p-1.5 rounded-lg bg-surface-container-high border border-outline-variant/40 text-on-surface hover:text-secondary transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="p-1.5 rounded-lg bg-surface-container-high border border-outline-variant/40 text-on-surface hover:text-error transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Vehicle Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVehicle ? "Edit Vehicle Info" : "Register New Vehicle"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Owner / Customer *</label>
            <select
              required
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id} className="bg-surface-container-low text-on-surface">
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Make / Brand *</label>
              <input
                type="text"
                required
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                placeholder="BMW, Audi, Mercedes, Hyundai..."
                className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Model *</label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="3 Series 320d"
                className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">License Plate Number *</label>
              <input
                type="text"
                required
                value={formData.plateNumber}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                placeholder="MH-02-EE-8899"
                className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface uppercase font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">VIN Number</label>
              <input
                type="text"
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                placeholder="WBA3D51080K123456"
                className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface uppercase font-mono focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Model Year</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="2023"
                className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Fuel Type</label>
              <select
                value={formData.fuelType}
                onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="PETROL" className="bg-surface-container-low">PETROL</option>
                <option value="DIESEL" className="bg-surface-container-low">DIESEL</option>
                <option value="ELECTRIC" className="bg-surface-container-low">ELECTRIC</option>
                <option value="HYBRID" className="bg-surface-container-low">HYBRID</option>
                <option value="CNG" className="bg-surface-container-low">CNG</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Odometer (km)</label>
              <input
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                placeholder="28500"
                className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
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
              Save Vehicle
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
