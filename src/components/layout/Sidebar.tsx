"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Calendar, 
  Wrench, 
  UserCheck, 
  Package, 
  Receipt, 
  Truck, 
  SlidersHorizontal,
  BarChart3, 
  Bell, 
  Settings,
  LogOut,
  ShieldCheck
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Vehicles", href: "/vehicles", icon: Car },
    { name: "Appointments", href: "/appointments", icon: Calendar },
    { name: "Job Cards", href: "/job-cards", icon: Wrench },
    { name: "Mechanics", href: "/mechanics", icon: UserCheck },
    { name: "Services", href: "/services", icon: SlidersHorizontal },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Billing & Payments", href: "/billing", icon: Receipt },
    { name: "Suppliers", href: "/suppliers", icon: Truck },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-surface-container-low border-r border-outline-variant/40 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-outline-variant/30">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-container to-brand-blue flex items-center justify-center shadow-glow">
              <Car className="w-6 h-6 text-on-primary" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-on-surface tracking-wider leading-tight group-hover:text-primary transition-colors">
                SK CAR <span className="text-primary-container">GARAGE</span>
              </h1>
              <p className="text-[10px] text-on-surface-variant tracking-widest uppercase">Pro Management</p>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-primary-container/20 text-primary border border-primary-container/40 shadow-glow"
                    : "text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-on-surface-variant"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-outline-variant/30 bg-surface-container-lowest/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center text-primary font-semibold">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-on-surface truncate">Garage Admin</p>
                <p className="text-[10px] text-on-surface-variant truncate">admin@skcar.com</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
