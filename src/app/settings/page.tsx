"use client";

import { useEffect, useState } from "react";
import { Settings, Save, Building, Phone, Mail, FileText, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [garage, setGarage] = useState({
    name: "SK Car Garage",
    address: "Plot 45, Auto Tech Park, Phase II, Mumbai",
    phone: "+91 98765 43210",
    email: "service@skcargarage.com",
    gstNumber: "27AAACS1234F1Z5",
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.name) setGarage(data);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(garage),
    });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
          Garage Profile & System Settings
        </h1>
        <p className="text-sm text-on-surface-variant">
          Configure business details, GSTIN tax credentials, contact info, and official invoice branding.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>Garage profile settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 bg-surface-container-low border border-outline-variant/40 rounded-2xl shadow-lg space-y-6">
        <div className="space-y-4">
          <h3 className="font-bold text-on-surface text-base border-b border-outline-variant/30 pb-2">
            Garage Profile & Branding
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Garage Business Name *</label>
            <div className="relative">
              <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                required
                value={garage.name}
                onChange={(e) => setGarage({ ...garage, name: e.target.value })}
                className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Support Phone Number *</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="text"
                  required
                  value={garage.phone}
                  onChange={(e) => setGarage({ ...garage, phone: e.target.value })}
                  className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Official Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="email"
                  required
                  value={garage.email}
                  onChange={(e) => setGarage({ ...garage, email: e.target.value })}
                  className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">GST Identification Number (GSTIN)</label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                value={garage.gstNumber}
                onChange={(e) => setGarage({ ...garage, gstNumber: e.target.value })}
                placeholder="27AAACS1234F1Z5"
                className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-on-surface uppercase font-mono focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Full Garage Address (For Invoices)</label>
            <textarea
              rows={3}
              value={garage.address}
              onChange={(e) => setGarage({ ...garage, address: e.target.value })}
              className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-container to-brand-blue text-on-primary text-xs font-bold shadow-glow hover:opacity-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
