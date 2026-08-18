"use client";

import { useEffect, useState } from "react";
import { Wrench, Plus, Car, User, ShieldCheck, CheckCircle2, Clock, AlertTriangle, Package, ChevronRight, DollarSign } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { formatCurrency, getStatusBadgeClass } from "@/lib/utils";

interface JobCard {
  id: string;
  jobNumber: string;
  status: string;
  mileageIn: number;
  mileageOut?: number;
  estimatedCost: number;
  actualCost: number;
  notes?: string;
  customer: { id: string; name: string; phone: string };
  vehicle: { id: string; make: string; model: string; plateNumber: string };
  mechanic?: { id: string; name: string };
  services: any[];
  parts: any[];
  invoice?: any;
}

export default function JobCardsPage() {
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [spareParts, setSpareParts] = useState<any[]>([]);
  const [servicesCatalog, setServicesCatalog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(null);

  // Form states
  const [createFormData, setCreateFormData] = useState({
    customerId: "",
    vehicleId: "",
    mechanicId: "",
    mileageIn: "",
    estimatedCost: "5000",
    notes: "",
  });
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);

  const [partFormData, setPartFormData] = useState({
    partId: "",
    quantity: "1",
  });

  const [serviceFormData, setServiceFormData] = useState({
    serviceId: "",
  });

  const fetchJobCards = () => {
    setLoading(true);
    fetch("/api/job-cards")
      .then((res) => res.json())
      .then((data) => {
        setJobCards(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchJobCards();

    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => setCustomers(Array.isArray(data) ? data : []));

    fetch("/api/mechanics")
      .then((res) => res.json())
      .then((data) => setMechanics(Array.isArray(data) ? data : []));

    fetch("/api/inventory")
      .then((res) => res.json())
      .then((data) => setSpareParts(Array.isArray(data) ? data : []));

    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => setServicesCatalog(data.services || []));
  }, []);

  useEffect(() => {
    if (createFormData.customerId) {
      const cust = customers.find((c) => c.id === createFormData.customerId);
      const vehi = cust?.vehicles || [];
      setAvailableVehicles(vehi);
      if (vehi.length > 0) {
        setCreateFormData((prev) => ({ ...prev, vehicleId: vehi[0].id, mileageIn: String(vehi[0].mileage || 20000) }));
      } else {
        setCreateFormData((prev) => ({ ...prev, vehicleId: "", mileageIn: "0" }));
      }
    }
  }, [createFormData.customerId, customers]);

  const handleOpenCreate = () => {
    const defaultCust = customers[0];
    setCreateFormData({
      customerId: defaultCust?.id || "",
      vehicleId: defaultCust?.vehicles[0]?.id || "",
      mechanicId: mechanics[0]?.id || "",
      mileageIn: String(defaultCust?.vehicles[0]?.mileage || 20000),
      estimatedCost: "5000",
      notes: "",
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/job-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createFormData),
    });

    if (res.ok) {
      setIsCreateModalOpen(false);
      fetchJobCards();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to create job card");
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    const res = await fetch("/api/job-cards", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });

    if (res.ok) fetchJobCards();
  };

  const handleAddPartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobCard) return;

    const res = await fetch("/api/job-cards", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedJobCard.id,
        action: "ADD_PART",
        partId: partFormData.partId,
        quantity: parseInt(partFormData.quantity),
      }),
    });

    if (res.ok) {
      setIsPartModalOpen(false);
      fetchJobCards();
      // Re-fetch spare parts to update stock levels
      fetch("/api/inventory").then((r) => r.json()).then((d) => setSpareParts(Array.isArray(d) ? d : []));
    } else {
      const err = await res.json();
      alert(err.error || "Failed to add part");
    }
  };

  const handleAddServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobCard) return;

    const res = await fetch("/api/job-cards", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedJobCard.id,
        action: "ADD_SERVICE",
        serviceId: serviceFormData.serviceId,
      }),
    });

    if (res.ok) {
      setIsServiceModalOpen(false);
      fetchJobCards();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to add service");
    }
  };

  const handleCreateInvoice = async (jc: JobCard) => {
    const res = await fetch("/api/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobCardId: jc.id,
        customerId: jc.customer.id,
      }),
    });

    if (res.ok) {
      alert("Invoice generated successfully! View under Billing & Payments.");
      fetchJobCards();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to generate invoice");
    }
  };

  const statusPipeline = ["INSPECTION", "APPROVED", "IN_PROGRESS", "WAITING_PARTS", "COMPLETED", "DELIVERED"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
            Job Cards & Service Workflow
          </h1>
          <p className="text-sm text-on-surface-variant">
            Workshop repair pipeline, spare parts inventory allocation, and labor costs.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-container to-brand-blue text-on-primary font-semibold text-xs shadow-glow hover:opacity-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Job Card</span>
        </button>
      </div>

      {/* Pipeline Status Cards Roster */}
      {loading ? (
        <div className="py-12 text-center text-on-surface-variant text-sm animate-pulse">
          Loading workshop job cards...
        </div>
      ) : (
        <div className="space-y-6">
          {jobCards.map((jc) => (
            <div
              key={jc.id}
              className="p-6 bg-surface-container-low border border-outline-variant/40 rounded-2xl shadow-lg space-y-4 hover:border-primary/40 transition-all"
            >
              {/* Top Meta Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/30 pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-black text-lg text-primary">{jc.jobNumber}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(jc.status)}`}>
                    {jc.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="text-right">
                    <span className="text-on-surface-variant text-[11px]">Actual Cost: </span>
                    <strong className="text-on-surface font-extrabold text-sm">{formatCurrency(jc.actualCost)}</strong>
                  </div>

                  <select
                    value={jc.status}
                    onChange={(e) => handleStatusUpdate(jc.id, e.target.value)}
                    className="bg-surface-container-highest/80 border border-outline-variant/60 rounded-xl px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary font-semibold"
                  >
                    {statusPipeline.map((st) => (
                      <option key={st} value={st} className="bg-surface-container-low text-on-surface">
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Details & Mechanics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-surface-container-highest/40 border border-outline-variant/30 space-y-1">
                  <p className="text-on-surface-variant text-[11px] font-semibold uppercase">Customer Details</p>
                  <p className="font-bold text-on-surface text-sm">{jc.customer?.name}</p>
                  <p className="text-on-surface-variant">{jc.customer?.phone}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container-highest/40 border border-outline-variant/30 space-y-1">
                  <p className="text-on-surface-variant text-[11px] font-semibold uppercase">Vehicle Telemetry</p>
                  <p className="font-bold text-on-surface text-sm">{jc.vehicle?.make} {jc.vehicle?.model}</p>
                  <p className="text-primary font-mono font-bold">{jc.vehicle?.plateNumber} • Odo: {jc.mileageIn} km</p>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container-highest/40 border border-outline-variant/30 space-y-1">
                  <p className="text-on-surface-variant text-[11px] font-semibold uppercase">Assigned Mechanic</p>
                  <p className="font-bold text-on-surface text-sm">{jc.mechanic?.name || "Unassigned"}</p>
                  <p className="text-on-surface-variant">{jc.notes || "No additional notes"}</p>
                </div>
              </div>

              {/* Added Services & Parts breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Services */}
                <div className="p-3.5 rounded-xl bg-surface-container-highest/30 border border-outline-variant/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-on-surface flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-secondary" /> Services ({jc.services.length})
                    </span>
                    <button
                      onClick={() => {
                        setSelectedJobCard(jc);
                        setServiceFormData({ serviceId: servicesCatalog[0]?.id || "" });
                        setIsServiceModalOpen(true);
                      }}
                      className="text-[11px] text-primary font-semibold hover:underline"
                    >
                      + Add Service
                    </button>
                  </div>
                  {jc.services.length === 0 ? (
                    <p className="text-on-surface-variant/70 italic text-[11px]">No services added yet.</p>
                  ) : (
                    <div className="space-y-1">
                      {jc.services.map((js: any) => (
                        <div key={js.id} className="flex justify-between text-[11px]">
                          <span className="text-on-surface">{js.service.name}</span>
                          <span className="font-semibold text-secondary">{formatCurrency(js.price)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Allocated Spare Parts */}
                <div className="p-3.5 rounded-xl bg-surface-container-highest/30 border border-outline-variant/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-on-surface flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-tertiary" /> Allocated Spare Parts ({jc.parts.length})
                    </span>
                    <button
                      onClick={() => {
                        setSelectedJobCard(jc);
                        setPartFormData({ partId: spareParts[0]?.id || "", quantity: "1" });
                        setIsPartModalOpen(true);
                      }}
                      className="text-[11px] text-primary font-semibold hover:underline"
                    >
                      + Add Part
                    </button>
                  </div>
                  {jc.parts.length === 0 ? (
                    <p className="text-on-surface-variant/70 italic text-[11px]">No spare parts attached.</p>
                  ) : (
                    <div className="space-y-1">
                      {jc.parts.map((jp: any) => (
                        <div key={jp.id} className="flex justify-between text-[11px]">
                          <span className="text-on-surface">
                            {jp.sparePart.name} x {jp.quantity}
                          </span>
                          <span className="font-semibold text-tertiary">{formatCurrency(jp.totalPrice)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <div>
                  {jc.invoice ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Invoice Generated ({jc.invoice.invoiceNumber})
                    </span>
                  ) : (
                    <button
                      onClick={() => handleCreateInvoice(jc)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:opacity-95 shadow-lg"
                    >
                      Generate Bill / Invoice
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Job Card Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Job Card"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Select Customer *</label>
            <select
              required
              value={createFormData.customerId}
              onChange={(e) => setCreateFormData({ ...createFormData, customerId: e.target.value })}
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
            <label className="text-xs font-semibold text-on-surface-variant">Select Vehicle *</label>
            <select
              required
              value={createFormData.vehicleId}
              onChange={(e) => setCreateFormData({ ...createFormData, vehicleId: e.target.value })}
              className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
            >
              {availableVehicles.map((v) => (
                <option key={v.id} value={v.id} className="bg-surface-container-low text-on-surface">
                  {v.make} {v.model} ({v.plateNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Odometer In (km) *</label>
              <input
                type="number"
                required
                value={createFormData.mileageIn}
                onChange={(e) => setCreateFormData({ ...createFormData, mileageIn: e.target.value })}
                className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Assign Mechanic</label>
              <select
                value={createFormData.mechanicId}
                onChange={(e) => setCreateFormData({ ...createFormData, mechanicId: e.target.value })}
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
            <label className="text-xs font-semibold text-on-surface-variant">Inspection Notes / Work Description</label>
            <textarea
              rows={3}
              value={createFormData.notes}
              onChange={(e) => setCreateFormData({ ...createFormData, notes: e.target.value })}
              placeholder="Engine noise inspection, synthetic oil change request..."
              className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-bright"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary-container to-brand-blue text-on-primary text-xs font-bold shadow-glow hover:opacity-95"
            >
              Create Job Card
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Spare Part Modal (Triggers Inventory Stock Deduction) */}
      <Modal
        isOpen={isPartModalOpen}
        onClose={() => setIsPartModalOpen(false)}
        title={`Add Spare Part to ${selectedJobCard?.jobNumber}`}
      >
        <form onSubmit={handleAddPartSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Select Spare Part *</label>
            <select
              required
              value={partFormData.partId}
              onChange={(e) => setPartFormData({ ...partFormData, partId: e.target.value })}
              className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
            >
              {spareParts.map((sp) => (
                <option key={sp.id} value={sp.id} className="bg-surface-container-low text-on-surface">
                  {sp.name} — ₹{sp.sellingPrice} (In Stock: {sp.stock})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Quantity *</label>
            <input
              type="number"
              min="1"
              required
              value={partFormData.quantity}
              onChange={(e) => setPartFormData({ ...partFormData, quantity: e.target.value })}
              className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300">
            <strong>Stock Deduction Notice:</strong> Adding this part will automatically deduct quantity from inventory stock and record a ledger transaction.
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsPartModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-bright"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-tertiary-container to-tertiary text-on-tertiary text-xs font-bold hover:opacity-95"
            >
              Deduct & Add Part
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Service Modal */}
      <Modal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        title={`Add Service to ${selectedJobCard?.jobNumber}`}
      >
        <form onSubmit={handleAddServiceSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Select Service Catalog Item *</label>
            <select
              required
              value={serviceFormData.serviceId}
              onChange={(e) => setServiceFormData({ ...serviceFormData, serviceId: e.target.value })}
              className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
            >
              {servicesCatalog.map((s) => (
                <option key={s.id} value={s.id} className="bg-surface-container-low text-on-surface">
                  {s.name} — ₹{s.price} ({s.estimatedMinutes} mins)
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsServiceModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-bright"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary-container to-brand-blue text-on-primary text-xs font-bold shadow-glow hover:opacity-95"
            >
              Add Service
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
