"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, Plus, Bell, Calendar, Wrench } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="h-20 bg-surface-container-low/80 backdrop-blur-md border-b border-outline-variant/30 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onMenuClick}
          className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-xl md:hidden transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search customers, vehicles, job cards, invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-highest/60 border border-outline-variant/50 rounded-xl pl-10 pr-4 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
      </div>

      {/* Right: Quick Action Buttons & Profile */}
      <div className="flex items-center gap-3 ml-4">
        <Link
          href="/appointments"
          className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container-high border border-outline-variant/40 text-on-surface hover:bg-surface-bright text-xs font-semibold transition-all"
        >
          <Calendar className="w-4 h-4 text-secondary" />
          <span>Book Appointment</span>
        </Link>

        <Link
          href="/job-cards?new=true"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-container to-brand-blue text-on-primary font-semibold text-xs shadow-glow hover:opacity-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Job Card</span>
        </Link>

        {/* Notifications Bell */}
        <Link
          href="/notifications"
          className="p-2.5 rounded-xl bg-surface-container-high/70 border border-outline-variant/40 text-on-surface-variant hover:text-on-surface relative transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-tertiary shadow-glow" />
        </Link>
      </div>
    </header>
  );
}
