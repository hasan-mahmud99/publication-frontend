"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { pages } from "@/lib/pages";
import { useAuth } from "@/context/AuthContext";
import {
  Package,
  LayoutDashboard,
  LogOut,
  Factory,
  Boxes,
  ShoppingCart,
  Truck,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  Layers,
  RotateCcw,
  Shield,
  CircleDollarSign,
} from "lucide-react";

const icons: Record<string, any> = {
  Dashboard: LayoutDashboard,
  Products: Package,
  Inventory: Boxes,
  Purchase: ShoppingCart,
  Manufacturing: Factory,
  Sales: ShoppingCart,
  Returns: RotateCcw,
  "Accounts & Finance": CircleDollarSign,
  "VAT & Mushak": FileText,
  Courier: Truck,
  Reports: FileText,
  Settings: Settings,
};

export default function Sidebar({
  mobileOpen = false,
  onCloseMobile,
}: {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}) {
  const pathname = usePathname();
  const { user, logout, canAccess, loading: authLoading } = useAuth();
  const [filterQuery, setFilterQuery] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Filter pages that this user is authorized to access
  const accessiblePages = useMemo(() => {
    if (!user) return [];
    return pages.filter((p) => canAccess(p.path));
  }, [user, canAccess]);

  // Distinct groups in order for accessible pages only
  const groups = useMemo(() => {
    const list: string[] = [];
    for (const p of accessiblePages) {
      if (!list.includes(p.group)) list.push(p.group);
    }
    return list;
  }, [accessiblePages]);

  // Determine current active page
  const activePage = useMemo(() => {
    const current = pathname.replace(/^\//, "");
    return pages.find((p) => p.path === current) || pages[0];
  }, [pathname]);

  // Ensure active group is opened when pathname changes
  useEffect(() => {
    if (activePage?.group) {
      setOpenGroups((prev) => ({
        ...prev,
        [activePage.group]: true,
      }));
    }
  }, [activePage?.group]);

  function toggleGroup(group: string) {
    setOpenGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  }

  function toggleAll(expand: boolean) {
    const next: Record<string, boolean> = {};
    for (const g of groups) next[g] = expand;
    setOpenGroups(next);
  }

  // Filter pages if user typed in search (among accessible pages)
  const filteredPages = useMemo(() => {
    if (!filterQuery.trim()) return accessiblePages;
    const q = filterQuery.toLowerCase();
    return accessiblePages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.group.toLowerCase().includes(q)
    );
  }, [filterQuery, accessiblePages]);

  // Group pages by their group name
  const pagesByGroup = useMemo(() => {
    const map: Record<string, typeof pages[number][]> = {};
    for (const p of filteredPages) {
      if (!map[p.group]) map[p.group] = [];
      map[p.group].push(p);
    }
    return map;
  }, [filteredPages]);

  const userInitial = user?.name ? user.name[0].toUpperCase() : "U";

  // Role Badge Color
  const roleBadgeColor = useMemo(() => {
    switch (user?.role) {
      case "ADMIN":
        return "bg-purple-900/60 text-purple-300 border-purple-700/60";
      case "FACTORY_MANAGER":
        return "bg-amber-900/60 text-amber-300 border-amber-700/60";
      case "SALES_DIRECTOR":
        return "bg-blue-900/60 text-blue-300 border-blue-700/60";
      case "INVENTORY_LEAD":
        return "bg-emerald-900/60 text-emerald-300 border-emerald-700/60";
      case "ACCOUNTANT":
        return "bg-teal-900/60 text-teal-300 border-teal-700/60";
      case "QC_OFFICER":
        return "bg-indigo-900/60 text-indigo-300 border-indigo-700/60";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  }, [user?.role]);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Main Sidebar */}
      <aside
        suppressHydrationWarning
        className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-[#0d1627] text-white flex flex-col z-50 border-r border-slate-800 transition-transform duration-200 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand / Logo header */}
        <div className="h-[68px] px-5 flex items-center justify-between border-b border-white/10 shrink-0">
          <Link
            href="/dashboard"
            onClick={onCloseMobile}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center font-black text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
              <Factory size={20} />
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-wide text-white leading-tight">
                FOOD ERP
              </div>
              <div className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">
                Manufacturing OS
              </div>
            </div>
          </Link>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* In-sidebar Quick Search & Controls */}
        <div className="px-3 pt-3 pb-2 shrink-0 border-b border-white/5 space-y-2">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search menus..."
              className="w-full bg-slate-900/80 border border-slate-800 rounded-lg pl-7 pr-7 py-1.5 text-xs text-white placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-slate-900 transition"
            />
            {filterQuery && (
              <button
                onClick={() => setFilterQuery("")}
                className="absolute right-2 top-2 text-slate-400 hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-medium">
              <Layers size={11} /> {accessiblePages.length} modules available
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleAll(true)}
                className="hover:text-blue-400 transition cursor-pointer"
              >
                Expand all
              </button>
              <span>•</span>
              <button
                onClick={() => toggleAll(false)}
                className="hover:text-blue-400 transition cursor-pointer"
              >
                Collapse
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1 text-xs select-none">
          {groups.map((group) => {
            const groupItems = pagesByGroup[group] || [];
            if (groupItems.length === 0) return null;

            const Icon = icons[group] || Layers;
            const isGroupActive = activePage?.group === group;
            const isOpen = openGroups[group] ?? isGroupActive;

            // Direct link for single-item groups like Dashboard
            if (groupItems.length === 1 && group === "Dashboard") {
              const item = groupItems[0];
              const isActive = pathname === "/" + item.path;
              return (
                <Link
                  key={item.path}
                  href={"/" + item.path}
                  onClick={onCloseMobile}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon size={17} className={isActive ? "text-white" : "text-blue-400"} />
                  <span>{item.title}</span>
                </Link>
              );
            }

            return (
              <div key={group} className="rounded-xl overflow-hidden">
                {/* Accordion Group Header */}
                <button
                  type="button"
                  onClick={() => toggleGroup(group)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer ${
                    isGroupActive
                      ? "bg-slate-800/80 text-white font-semibold"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      size={16}
                      className={isGroupActive ? "text-blue-400" : "text-slate-400"}
                    />
                    <span className="truncate text-[13px]">{group}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-semibold border border-slate-700/50">
                      {groupItems.length}
                    </span>
                    {isOpen ? (
                      <ChevronDown size={14} className="text-slate-400" />
                    ) : (
                      <ChevronRight size={14} className="text-slate-500" />
                    )}
                  </div>
                </button>

                {/* Sub-items (expanded) */}
                {isOpen && (
                  <div className="pl-4 pr-1 py-1 space-y-0.5 border-l border-slate-800/80 ml-4 my-1">
                    {groupItems.map((item) => {
                      const isItemActive = pathname === "/" + item.path;
                      return (
                        <Link
                          key={item.path}
                          href={"/" + item.path}
                          onClick={onCloseMobile}
                          title={item.description}
                          className={`flex items-center justify-between rounded-md px-2.5 py-1.5 text-[12.5px] transition ${
                            isItemActive
                              ? "bg-blue-600 text-white font-medium shadow-sm shadow-blue-600/30"
                              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                          }`}
                        >
                          <span className="truncate">{item.title}</span>
                          {isItemActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white ml-2 shrink-0" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {filterQuery && filteredPages.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-xs">
              <Search size={22} className="mx-auto mb-2 opacity-50" />
              No matching pages found
            </div>
          )}
        </nav>

        {/* Footer with logged-in user profile & sign out */}
        <div className="p-3 border-t border-white/10 shrink-0 bg-[#09101f]">
          <div className="flex items-center justify-between gap-2 px-2.5 py-2 mb-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                {userInitial}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {user?.name || (authLoading ? "Loading..." : "User")}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {user?.email || "No email"}
                </div>
              </div>
            </div>

            <span
              className={`text-[9.5px] font-bold border rounded px-1.5 py-0.5 shrink-0 ${roleBadgeColor}`}
            >
              {user?.role || "STAFF"}
            </span>
          </div>

          <button
            onClick={logout}
            className="w-full border border-slate-800 hover:border-rose-900/60 rounded-xl px-3 py-2 flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 hover:text-rose-300 hover:bg-rose-950/30 transition cursor-pointer"
          >
            <LogOut size={14} /> Sign out (লগআউট)
          </button>
        </div>
      </aside>
    </>
  );
}
