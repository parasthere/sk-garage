"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Search, Mail, Phone, MapPin, Car, Eye, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import Modal from "@/components/ui/Modal";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  notes?: string;
  vehicles: any[];
  jobCards: any[];
  invoices: any[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });

  const fetchCustomers = () => {
    setLoading(true);
    fetch(`/api/customers?query=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((data) => {
        setCustomers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setFormData({ name: "", email: "", phone: "", address: "", city: "", notes: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      email: c.email,
      phone: c.phone,
      address: c.address || "",
      city: c.city || "",
      notes: c.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingCustomer ? "PUT" : "POST";
    const payload = editingCustomer ? { id: editingCustomer.id, ...formData } : formData;

    const res = await fetch("/api/customers", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setIsModalOpen(false);
      fetchCustomers();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to save customer");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    const res = await fetch(`/api/customers?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchCustomers();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
            Customer Directory
          </h1>
          <p className="text-sm text-on-surface-variant">
            Manage customer records, vehicles, and billing history.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-container to-brand-blue text-on-primary font-semibold text-xs shadow-glow hover:opacity-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-surface-container-low border border-outline-variant/40 rounded-2xl flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search by customer name, email, or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-highest/60 border border-outline-variant/50 rounded-xl pl-10 pr-4 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="p-6 bg-surface-container-low border border-outline-variant/40 rounded-2xl shadow-lg">
        {loading ? (
          <div className="py-12 text-center text-on-surface-variant text-sm animate-pulse">
            Loading customers database...
          </div>
        ) : customers.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Users className="w-12 h-12 mx-auto text-on-surface-variant/50" />
            <p className="text-sm font-semibold text-on-surface">No customers found</p>
            <p className="text-xs text-on-surface-variant">Try adjusting search or add a new customer.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/40 text-on-surface-variant uppercase text-[10px] tracking-wider bg-surface-container/60">
                  <th className="p-3.5 rounded-l-xl">Customer Name</th>
                  <th className="p-3.5">Contact Info</th>
                  <th className="p-3.5">City & Address</th>
                  <th className="p-3.5">Vehicles</th>
                  <th className="p-3.5">Job Cards</th>
                  <th className="p-3.5 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container-high/40 transition-colors">
                    <td className="p-3.5 font-bold text-on-surface">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary font-bold">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">{c.name}</p>
                          <p className="text-[10px] text-on-surface-variant">ID: {c.id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-on-surface font-medium">
                        <Phone className="w-3.5 h-3.5 text-secondary" /> {c.phone}
                      </div>
                      <div className="flex items-center gap-1.5 text-on-surface-variant text-[11px]">
                        <Mail className="w-3.5 h-3.5" /> {c.email}
                      </div>
                    </td>
                    <td className="p-3.5 text-on-surface-variant">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-tertiary" />
                        <span>{c.city || "Mumbai"}</span>
                      </div>
                      <p className="text-[10px] truncate max-w-xs">{c.address || "N/A"}</p>
                    </td>
                    <td className="p-3.5 font-semibold text-primary">
                      <span className="flex items-center gap-1 bg-primary-container/10 px-2.5 py-1 rounded-full border border-primary-container/30 w-fit">
                        <Car className="w-3.5 h-3.5" /> {c.vehicles.length} Vehicle(s)
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-on-surface">
                      {c.jobCards.length} Job(s)
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        title="View Customer Profile"
                        className="p-1.5 rounded-lg bg-surface-container-high border border-outline-variant/40 text-on-surface hover:text-primary transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(c)}
                        title="Edit Customer"
                        className="p-1.5 rounded-lg bg-surface-container-high border border-outline-variant/40 text-on-surface hover:text-secondary transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        title="Delete Customer"
                        className="p-1.5 rounded-lg bg-surface-container-high border border-outline-variant/40 text-on-surface hover:text-error transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? "Edit Customer Profile" : "Add New Customer"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Rahul Sharma"
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
                placeholder="+91 98765 43210"
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
                placeholder="rahul@example.com"
                className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Mumbai"
                className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Street Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="B-402, Green Meadows, Andheri West"
              className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Notes / Preferences</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="VIP customer, prefers morning service dropoff..."
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
              Save Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* Customer Detail Profile Modal */}
      <Modal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title="Customer Profile Details"
      >
        {selectedCustomer && (
          <div className="space-y-6 text-xs">
            <div className="p-4 rounded-xl bg-surface-container/80 border border-outline-variant/40 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-container/20 border border-primary-container/40 flex items-center justify-center text-primary text-xl font-bold">
                {selectedCustomer.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-bold text-on-surface">{selectedCustomer.name}</h3>
                <p className="text-on-surface-variant">{selectedCustomer.email} • {selectedCustomer.phone}</p>
                <p className="text-on-surface-variant text-[11px] mt-0.5">{selectedCustomer.address || "No address provided"}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-on-surface uppercase tracking-wider text-[11px] mb-2">Registered Vehicles</h4>
              {selectedCustomer.vehicles.length === 0 ? (
                <p className="text-on-surface-variant">No vehicles linked to customer.</p>
              ) : (
                <div className="space-y-2">
                  {selectedCustomer.vehicles.map((v: any) => (
                    <div key={v.id} className="p-3 rounded-xl bg-surface-container-highest/60 border border-outline-variant/30 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-on-surface">{v.make} {v.model} ({v.year})</p>
                        <p className="text-on-surface-variant">Plate: {v.plateNumber} | VIN: {v.vin || "N/A"}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-primary-container/20 text-primary font-bold text-[10px]">
                        {v.fuelType}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
