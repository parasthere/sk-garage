"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Car, Lock, Mail, ShieldCheck, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@skcar.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-container-high via-background to-surface-container-lowest">
      <div className="w-full max-w-md bg-surface-container-low/90 backdrop-blur-2xl border border-outline-variant/50 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Brand Logo Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-container to-brand-blue flex items-center justify-center shadow-glow mb-4">
            <Car className="w-10 h-10 text-on-primary" />
          </div>
          <h1 className="text-2xl font-black text-on-surface tracking-wider">
            SK CAR <span className="text-primary-container">GARAGE</span>
          </h1>
          <p className="text-xs text-on-surface-variant uppercase tracking-widest font-medium">
            Pro Automotive Cockpit Login
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-error-container/30 border border-error/40 flex items-center gap-3 text-error text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@skcar.com"
                className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-container-highest/60 border border-outline-variant/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-container to-brand-blue text-on-primary font-bold text-sm shadow-glow hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>{loading ? "Authenticating..." : "Access Garage Dashboard"}</span>
          </button>
        </form>

        {/* Demo Credentials Quick Paste */}
        <div className="p-4 rounded-2xl bg-surface-container/60 border border-outline-variant/30 text-xs space-y-2">
          <p className="font-bold text-primary">Demo Manager Credentials:</p>
          <div className="flex justify-between text-on-surface-variant">
            <span>Email: <strong className="text-on-surface">admin@skcar.com</strong></span>
            <span>Pass: <strong className="text-on-surface">password123</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
