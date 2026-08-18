"use client";

import { useEffect, useState } from "react";
import { Package, Plus, Search, AlertTriangle, ArrowDownUp, Edit2, Trash2, ShieldCheck, CheckCircle2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { formatCurrency, getStatusBadgeClass } from "@/lib/utils";

interface SparePart {
  id: string;
  name: string;
  partNumber: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  location?: string;
  supplier?: { id: string; name: string };
  history: any[];
}

export default function InventoryPage() {
  const [parts, setParts] = useState<SparePart[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    partNumber: "",
    category: "General Parts",
    costPrice: "1000",
    sellingPrice: "1600",
    stock: "10",
    minStock: "5",
    location: "Shelf A-1",
    supplierId: "",
  });

  const fetchInventory = () => {
    setLoading(true);
    const url = filter === "ALL" ? "/api/inventory" : `/api/inventory?filter=${filter}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setParts(Array.isArray(data) ? data : []);
        setLoading(false);
      });

    fetch("/api/suppliers")
      .then((res) => res.json())
      .then((data) => setSuppliers(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    fetchInventory();
  }, [filter]);

  const handleOpenCreate = () => {
    setEditingPart(null);
    setFormData({
      name: "",
      partNumber: "",
      category: "General Parts",
      costPrice: "1000",
      sellingPrice: "1600",
      stock: "10",
      minStock: "5",
      location: "Shelf A-1",
      supplierId: suppliers[0]?.id || "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: SparePart) => {
    setEditingPart(p);
    setFormData({
      name: p.name,
      partNumber: p.partNumber,
      category: p.category,
      costPrice: String(p.costPrice),
      sellingPrice: String(p.sellingPrice),
      stock: String(p.stock),
      minStock: String(p.minStock),
      location: p.location || "Shelf A-1",
      supplierId: p.supplier?.id || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingPart ? "PUT" : "POST";
    const payload = editingPart ? { id: editingPart.id, ...formData } : formData;

    const res = await fetch("/api/inventory", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setIsModalOpen(false);
      fetchInventory();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to save spare part");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this spare part?")) return;
    const res = await fetch(`/api/inventory?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchInventory();
  };

  const filteredParts = parts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.partNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
            Spare Parts & Inventory Control
          </h1>
          <p className="text-sm text-on-surface-variant">
            Track component stock, minimum alert thresholds, cost margins, and ledger logs.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-container to-brand-blue text-on-primary font-semibold text-xs shadow-glow hover:opacity-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Spare Part</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="p-4 bg-surface-container-low border border-outline-variant/40 rounded-2xl flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex items-center gap-2">
          {["ALL", "LOW_STOCK", "OUT_OF_STOCK"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === tab
                  ? "bg-primary-container/20 text-primary border border-primary-container/40"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Filter by part name or PN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-highest/60 border border-outline-variant/50 rounded-xl pl-10 pr-4 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="p-6 bg-surface-container-low border border-outline-variant/40 rounded-2xl shadow-lg">
        {loading ? (
          <div className="py-12 text-center text-on-surface-variant text-sm animate-pulse">
            Loading spare parts stock...
          </div>
        ) : filteredParts.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Package className="w-12 h-12 mx-auto text-on-surface-variant/50" />
            <p className="text-sm font-semibold text-on-surface">No spare parts found</p>
            <p className="text-xs text-on-surface-variant">Try clearing filters or add a new part.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/40 text-on-surface-variant uppercase text-[10px] tracking-wider bg-surface-container/60">
                  <th className="p-3.5 rounded-l-xl">Part Info</th>
                  <th className="p-3.5">Category & Location</th>
                  <th className="p-3.5">Cost vs Selling Price</th>
                  <th className="p-3.5">Current Stock Level</th>
                  <th className="p-3.5">Supplier Linkage</th>
                  <th className="p-3.5 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredParts.map((p) => {
                  const isLow = p.stock <= p.minStock && p.stock > 0;
                  const isOut = p.stock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-surface-container-high/40 transition-colors">
                      <td className="p-3.5 font-bold text-on-surface">
                        <p className="font-bold text-on-surface">{p.name}</p>
                        <p className="text-[10px] text-primary font-mono">PN: {p.partNumber}</p>
                      </td>
                      <td className="p-3.5 text-on-surface-variant">
                        <span className="font-medium text-on-surface">{p.category}</span>
                        <p className="text-[10px] text-on-surface-variant">Loc: {p.location || "Rack A-1"}</p>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-on-surface-variant line-through text-[11px]">₹{p.costPrice}</span>
                          <span className="font-extrabold text-emerald-400">₹{p.sellingPrice}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
                            isOut ? "bg-red-500/20 text-red-400 border border-red-500/30" : isLow ? "bg-tertiary-container/20 text-tertiary border border-tertiary/30" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          }`}>
                            {p.stock} units
                          </span>
                          <span className="text-[10px] text-on-surface-variant">(Min: {p.minStock})</span>
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-on-surface">
                        {p.supplier?.name || "Direct OEM"}
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg bg-surface-container-high border border-outline-variant/40 text-on-surface hover:text-secondary transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded-lg bg-surface-container-high border border-outline-variant/40 text-on-surface hover:text-error transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Spare Part Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPart ? "Edit Spare Part Stock" : "Add New Spare Part"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Part Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Liqui Moly 5W-40 Synthetic Oil (5L)"
                className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Part Number (PN) *</label>
              <input
                type="text"
                required
                value={formData.partNumber}
                onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                placeholder="LM-5W40-5L"
                className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface uppercase font-mono focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Cost Price (₹) *</label>
              <input
                type="number"
                required
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                placeholder="2600"
                className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Selling Price (₹) *</label>
              <input
                type="number"
                required
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                placeholder="3800"
                className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Current Stock *</label>
              <input
                type="number"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="24"
                className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Min Stock Alert</label>
              <input
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                placeholder="5"
                className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Rack / Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Shelf A-1"
                className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Supplier Linkage</label>
            <select
              value={formData.supplierId}
              onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
              className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="" className="bg-surface-container-low">No Supplier (Direct Stock)</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id} className="bg-surface-container-low text-on-surface">
                  {s.name} ({s.phone})
                </option>
              ))}
            </select>
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
              Save Spare Part
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
