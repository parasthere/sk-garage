"use client";

import { useEffect, useState } from "react";
import { Calendar, Plus, Clock, User, Car, CheckCircle2, AlertCircle, Wrench, XCircle } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { formatDateTime, getStatusBadgeClass } from "@/lib/utils";

interface Appointment {
  id: string;
  serviceType: string;
  appointmentDate: string;
  status: string;
  notes?: string;
  customer: { id: string; name: string; phone: string; email: string };
  vehicle: { id: string; make: string; model: string; plateNumber: string };
  mechanic?: { id: string; name: string };
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerId: "",
    vehicleId: "",
    mechanicId: "",
    serviceType: "Synthetic Engine Oil Change",
    appointmentDate: new Date().toISOString().slice(0, 16),
    notes: "",
  });

  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);

  const fetchAppointments = () => {
    setLoading(true);
    const url = selectedStatus === "ALL" ? "/api/appointments" : `/api/appointments?status=${selectedStatus}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setAppointments(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAppointments();

    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => setCustomers(Array.isArray(data) ? data : []));

    fetch("/api/mechanics")
      .then((res) => res.json())
      .then((data) => setMechanics(Array.isArray(data) ? data : []));
  }, [selectedStatus]);

  // Update available vehicles when customer changes
  useEffect(() => {
    if (formData.customerId) {
      const cust = customers.find((c) => c.id === formData.customerId);
      const vehi = cust?.vehicles || [];
      setAvailableVehicles(vehi);
      if (vehi.length > 0) {
        setFormData((prev) => ({ ...prev, vehicleId: vehi[0].id }));
      } else {
        setFormData((prev) => ({ ...prev, vehicleId: "" }));
      }
    }
  }, [formData.customerId, customers]);

  const handleOpenCreate = () => {
    const defaultCust = customers[0];
    setFormData({
      customerId: defaultCust?.id || "",
      vehicleId: defaultCust?.vehicles[0]?.id || "",
      mechanicId: mechanics[0]?.id || "",
      serviceType: "Synthetic Engine Oil Change",
      appointmentDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      notes: "",
    });
    setIsModalOpen(true);
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const res = await fetch("/api/appointments", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    if (res.ok) fetchAppointments();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleId) {
      alert("Please select a valid customer vehicle!");
      return;
    }

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setIsModalOpen(false);
      fetchAppointments();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to book appointment");
    }
  };

  const statusTabs = ["ALL", "SCHEDULED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
            Appointment Booking & Schedule
          </h1>
          <p className="text-sm text-on-surface-variant">
            Manage customer service bookings, mechanic assignments, and time slots.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-container to-brand-blue text-on-primary font-semibold text-xs shadow-glow hover:opacity-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Filter Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-outline-variant/30">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedStatus(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedStatus === tab
                ? "bg-primary-container/20 text-primary border border-primary-container/40 shadow-glow"
                : "text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="py-12 text-center text-on-surface-variant text-sm animate-pulse">
          Loading appointment schedule...
        </div>
      ) : appointments.length === 0 ? (
        <div className="p-12 bg-surface-container-low border border-outline-variant/40 rounded-2xl text-center space-y-3">
          <Calendar className="w-12 h-12 mx-auto text-on-surface-variant/50" />
          <p className="text-sm font-semibold text-on-surface">No appointments found</p>
          <p className="text-xs text-on-surface-variant">No bookings matching selected status tab.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((app) => (
            <div
              key={app.id}
              className="p-5 bg-surface-container-low border border-outline-variant/40 rounded-2xl shadow-lg space-y-4 hover:border-primary/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusBadgeClass(app.status)}`}>
                    {app.status}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-secondary font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDateTime(app.appointmentDate)}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-on-surface text-base">{app.serviceType}</h3>
                  {app.notes && <p className="text-[11px] text-on-surface-variant italic mt-1">"{app.notes}"</p>}
                </div>

                <div className="p-3 rounded-xl bg-surface-container-highest/50 border border-outline-variant/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant text-[11px] flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-primary" /> Customer:
                    </span>
                    <span className="font-bold text-on-surface">{app.customer?.name} ({app.customer?.phone})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant text-[11px] flex items-center gap-1">
                      <Car className="w-3.5 h-3.5 text-secondary" /> Vehicle:
                    </span>
                    <span className="font-semibold text-on-surface">{app.vehicle?.make} {app.vehicle?.model} ({app.vehicle?.plateNumber})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant text-[11px] flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5 text-tertiary" /> Mechanic:
                    </span>
                    <span className="font-semibold text-on-surface">{app.mechanic?.name || "Unassigned"}</span>
                  </div>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-end gap-2 text-xs">
                {app.status === "SCHEDULED" && (
                  <button
                    onClick={() => handleStatusUpdate(app.id, "CONFIRMED")}
                    className="px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30 hover:bg-blue-500/30"
                  >
                    Confirm Booking
                  </button>
                )}
                {app.status === "CONFIRMED" && (
                  <button
                    onClick={() => handleStatusUpdate(app.id, "IN_PROGRESS")}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30 hover:bg-amber-500/30"
                  >
                    Start In Workshop
                  </button>
                )}
                {app.status === "IN_PROGRESS" && (
                  <button
                    onClick={() => handleStatusUpdate(app.id, "COMPLETED")}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30 hover:bg-emerald-500/30"
                  >
                    Mark Completed
                  </button>
                )}
                {app.status !== "CANCELLED" && app.status !== "COMPLETED" && (
                  <button
                    onClick={() => handleStatusUpdate(app.id, "CANCELLED")}
                    className="p-1.5 rounded-xl bg-error-container/20 text-error border border-error/30 hover:bg-error-container/40"
                    title="Cancel Booking"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Book Appointment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Book Customer Appointment"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Select Customer *</label>
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

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Select Customer Vehicle *</label>
            <select
              required
              value={formData.vehicleId}
              onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
              className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
            >
              {availableVehicles.length === 0 ? (
                <option value="" className="bg-surface-container-low">No vehicles found for customer</option>
              ) : (
                availableVehicles.map((v) => (
                  <option key={v.id} value={v.id} className="bg-surface-container-low text-on-surface">
                    {v.make} {v.model} ({v.plateNumber})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Service Type *</label>
              <input
                type="text"
                required
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                placeholder="Full Engine Service, Brake Overhaul..."
                className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Assign Mechanic</label>
              <select
                value={formData.mechanicId}
                onChange={(e) => setFormData({ ...formData, mechanicId: e.target.value })}
                className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="" className="bg-surface-container-low">Assign Later</option>
                {mechanics.map((m) => (
                  <option key={m.id} value={m.id} className="bg-surface-container-low text-on-surface">
                    {m.name} ({m.specialization})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Appointment Date & Time *</label>
            <input
              type="datetime-local"
              required
              value={formData.appointmentDate}
              onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
              className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Special Instructions / Symptoms</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Customer reported AC cooling issues..."
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
              Confirm Appointment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
