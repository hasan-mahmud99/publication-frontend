"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Factory, LockKeyhole, Mail, Eye, EyeOff, ShieldCheck, UserCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Login failed");

      // Refresh auth context and redirect
      await refreshUser();
      window.location.href = "/dashboard";
    } catch (e: any) {
      setError(e.message || "Invalid email or password");
    } finally {
      setBusy(false);
    }
  }

  function fillDemo(demoEmail: string, demoPass: string) {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Left Branding Side */}
      <section className="hidden lg:flex bg-[#101b32] text-white p-14 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Factory size={22} />
          </div>
          <span className="font-bold tracking-wide text-lg">FOOD ERP</span>
        </div>

        <div>
          <div className="text-blue-400 text-xs uppercase tracking-[.25em] mb-4 font-semibold">
            Role-Based Enterprise Platform
          </div>
          <h1 className="text-5xl font-extrabold leading-tight max-w-xl tracking-tight">
            Control every batch. Move every product.
          </h1>
          <p className="text-slate-300 mt-6 max-w-lg leading-relaxed text-sm">
            A unified, role-governed workspace for food manufacturing, inventory, VAT &
            Mushak 6.3, purchasing, sales and delivery operations.
          </p>
        </div>

        <div className="text-xs text-slate-500">
          © 2026 Food Manufacturing ERP • Secure Access
        </div>
      </section>

      {/* Right Login Form */}
      <section className="flex items-center justify-center p-6 sm:p-12">
        <form onSubmit={submit} className="w-full max-w-md space-y-5">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-sm">
              <Factory size={20} />
            </div>
            <b className="text-base tracking-wide text-slate-900">FOOD ERP</b>
          </div>

          <div>
            <div className="text-xs text-blue-600 font-bold uppercase tracking-widest">
              Secure Sign-in
            </div>
            <h2 className="text-3xl font-extrabold mt-1 text-slate-900 tracking-tight">
              Sign in to your account
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your assigned credentials to access your designated workspace.
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Email Address (ইমেইল)
            </label>
            <div className="flex items-center gap-3 border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 rounded-xl px-3 bg-slate-50/50 transition">
              <Mail size={16} className="text-slate-400 shrink-0" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="py-3 w-full outline-none text-xs text-slate-800 bg-transparent placeholder-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Password (পাসওয়ার্ড)
            </label>
            <div className="flex items-center gap-3 border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 rounded-xl px-3 bg-slate-50/50 transition">
              <LockKeyhole size={16} className="text-slate-400 shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="py-3 w-full outline-none text-xs text-slate-800 bg-transparent placeholder-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl py-3 font-bold text-xs shadow-xs transition cursor-pointer"
          >
            {busy ? "Authenticating..." : "Sign in (লগইন করুন)"}
          </button>

          {/* Quick Demo Credentials Switcher */}
          <div className="pt-3 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Quick Test Accounts (ক্লিক করে টেস্ট করুন):
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemo("admin@example.com", "ChangeMe123!")}
                className="text-left p-2 rounded-lg bg-slate-50 hover:bg-purple-50 border border-slate-200/80 hover:border-purple-300 transition cursor-pointer"
              >
                <div className="font-bold text-[11px] text-purple-700">System Admin</div>
                <div className="text-[10px] text-slate-500 truncate">admin@example.com</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemo("farhana.sales@example.com", "ChangeMe123!")}
                className="text-left p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 transition cursor-pointer"
              >
                <div className="font-bold text-[11px] text-blue-700">Sales Director</div>
                <div className="text-[10px] text-slate-500 truncate">farhana.sales@example.com</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemo("tanvir.manager@example.com", "ChangeMe123!")}
                className="text-left p-2 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200/80 hover:border-amber-300 transition cursor-pointer"
              >
                <div className="font-bold text-[11px] text-amber-700">Factory Manager</div>
                <div className="text-[10px] text-slate-500 truncate">tanvir.manager@example.com</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemo("nusrat.inventory@example.com", "ChangeMe123!")}
                className="text-left p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-300 transition cursor-pointer"
              >
                <div className="font-bold text-[11px] text-emerald-700">Inventory Lead</div>
                <div className="text-[10px] text-slate-500 truncate">nusrat.inventory@example.com</div>
              </button>
            </div>
            <div className="text-[10px] text-slate-400 mt-2 text-center">
              All demo users default password: <code className="font-mono font-bold">ChangeMe123!</code>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}
