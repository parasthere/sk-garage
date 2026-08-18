"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle2, AlertTriangle, Info, Check } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    setLoading(true);
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        setNotifications(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    const res = await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (res.ok) fetchNotifications();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
            Notification Telemetry
          </h1>
          <p className="text-sm text-on-surface-variant">
            Low stock warnings, new appointment alerts, and payment receipts.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container-high border border-outline-variant/40 text-on-surface hover:text-primary text-xs font-semibold"
        >
          <Check className="w-4 h-4" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-12 text-center text-on-surface-variant text-sm animate-pulse">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-12 bg-surface-container-low border border-outline-variant/40 rounded-2xl text-center space-y-2">
          <Bell className="w-10 h-10 mx-auto text-on-surface-variant/50" />
          <p className="text-sm font-semibold text-on-surface">No unread notifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                n.isRead
                  ? "bg-surface-container-low/50 border-outline-variant/30 opacity-70"
                  : "bg-surface-container-low border-primary/40 shadow-md"
              }`}
            >
              <div className="mt-0.5">
                {n.type === "WARNING" ? (
                  <AlertTriangle className="w-5 h-5 text-tertiary" />
                ) : n.type === "SUCCESS" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Info className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-on-surface text-sm">{n.title}</h4>
                  <span className="text-[10px] text-on-surface-variant">{formatDateTime(n.createdAt)}</span>
                </div>
                <p className="text-xs text-on-surface-variant">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
