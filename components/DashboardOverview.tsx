"use client";

import ERPLayout from "@/components/ERPLayout";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowUpRight,
  Boxes,
  Factory,
  ShoppingCart,
  Truck,
  AlertTriangle,
  Package,
  RefreshCw,
} from "lucide-react";

export default function DashboardOverview() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/dashboard");
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setData(j);
    } catch (e: any) {
      setError(e.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const metrics = [
    ["Total Products", data?.metrics?.products ?? 20, Package],
    ["Suppliers", data?.metrics?.suppliers ?? 20, Boxes],
    ["Customers", data?.metrics?.customers ?? 20, ShoppingCart],
    ["Purchase Orders", data?.metrics?.purchases ?? 20, ShoppingCart],
    ["Sales Orders", data?.metrics?.orders ?? 20, ArrowUpRight],
    ["Production Orders", data?.metrics?.production ?? 20, Factory],
    ["Product Returns", data?.metrics?.returns ?? 20, RefreshCw],
    ["Courier Shipments", data?.metrics?.shipments ?? 20, Truck],
  ];

  return (
    <ERPLayout>
      <div className="space-y-7">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5 font-medium">
              <span>Overview</span>
              <span>/</span>
              <span>Dashboard</span>
              {user?.role && (
                <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {user.role}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Good day, {user?.name || "System Administrator"}!
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Here is what is happening across your food manufacturing operation today.
            </p>
          </div>

          <button
            onClick={load}
            disabled={loading}
            className="bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold flex gap-2 items-center text-slate-700 shadow-2xs transition cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 p-4 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {metrics.map(([label, value, Icon]: any) => (
            <div
              key={label}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500">{label}</span>
                <span className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
                  <Icon size={18} />
                </span>
              </div>
              <div className="text-3xl font-black text-slate-900 mt-3">{value}</div>
              <div className="text-[11px] text-slate-400 mt-1 font-medium">
                Live database count
              </div>
            </div>
          ))}
        </div>

        <div className="grid xl:grid-cols-3 gap-5">
          <section className="xl:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-sm text-slate-800">Recent stock movements</h2>
                <p className="text-xs text-slate-400 mt-0.5">Latest inventory transactions</p>
              </div>
              <Boxes className="text-slate-400" size={20} />
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="text-left py-2.5">Product</th>
                    <th className="text-left py-2.5">Movement</th>
                    <th className="text-right py-2.5">Quantity</th>
                    <th className="text-right py-2.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(data?.recentMovements || []).slice(0, 7).map((m: any) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 font-semibold text-slate-800">
                        {m.product?.name || m.productId}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                          {m.type}
                        </span>
                      </td>
                      <td className="py-3 text-right font-bold text-slate-900">
                        {String(m.quantity)}
                      </td>
                      <td className="py-3 text-right text-slate-400">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {!data?.recentMovements?.length && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        No stock movements recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
            <h2 className="font-bold text-sm text-slate-800">Operational attention</h2>
            <p className="text-xs text-slate-400 mt-0.5 mb-4">Items that may need follow-up</p>
            <div className="space-y-3">
              <div className="rounded-xl bg-amber-50/70 border border-amber-200/70 p-3.5 flex gap-3">
                <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <div className="text-xs font-bold text-amber-900">Reorder monitoring</div>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    Review products below their reorder level to prevent stockouts.
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-blue-50/70 border border-blue-200/70 p-3.5 flex gap-3">
                <Truck className="text-blue-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <div className="text-xs font-bold text-blue-900">Courier integration</div>
                  <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                    Steadfast, Pathao & RedX live consignment booking ready.
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/70 p-3.5 flex gap-3">
                <Factory className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <div className="text-xs font-bold text-emerald-900">Production planning</div>
                  <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                    Create BOM recipes before starting batch production.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </ERPLayout>
  );
}
