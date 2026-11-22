"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { pages } from "@/lib/pages";
import { useAuth } from "@/context/AuthContext";
import {
  Bell,
  Search,
  UserCircle,
  Menu,
  ChevronRight,
  Sparkles,
  Command,
  X,
  ExternalLink,
  ShieldAlert,
  ArrowLeft,
  Lock,
} from "lucide-react";

export default function ERPLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, canAccess, loading: authLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cleanPath = useMemo(() => pathname.replace(/^\//, ""), [pathname]);

  // Current active page definition
  const activePage = useMemo(() => {
    return pages.find((p) => p.path === cleanPath) || pages[0];
  }, [cleanPath]);

  // Check if current user has permission to access this page
  const isAuthorized = useMemo(() => {
    if (authLoading || !user) return true; // wait for auth or let middleware handle login
    return canAccess(cleanPath);
  }, [authLoading, user, canAccess, cleanPath]);

  // Sibling pages in the current section/group for horizontal top tabs (only accessible ones)
  const groupPages = useMemo(() => {
    if (!activePage?.group || activePage.group === "Dashboard") return [];
    return pages.filter(
      (p) => p.group === activePage.group && canAccess(p.path)
    );
  }, [activePage, canAccess]);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filtered pages for Command Palette (only accessible pages)
  const matchingPages = useMemo(() => {
    const accessible = pages.filter((p) => canAccess(p.path));
    if (!paletteQuery.trim()) return accessible.slice(0, 16);
    const q = paletteQuery.toLowerCase();
    return accessible.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.group.toLowerCase().includes(q)
    );
  }, [paletteQuery, canAccess]);

  function handleSelectPage(path: string) {
    setCommandPaletteOpen(false);
    setPaletteQuery("");
    router.push("/" + path);
  }

  const userInitial = user?.name ? user.name[0].toUpperCase() : "U";

  if (!mounted) {
    return (
      <div suppressHydrationWarning className="min-h-screen flex bg-slate-50 text-slate-900">
        <aside className="w-72 bg-[#0d1627] hidden md:flex flex-col shrink-0 animate-pulse">
          <div className="h-[68px] px-5 flex items-center border-b border-white/10 gap-3">
            <div className="w-10 h-10 bg-blue-600/30 rounded-xl" />
            <div className="h-4 w-28 bg-white/20 rounded" />
          </div>
          <div className="p-4 space-y-3">
            <div className="h-8 bg-white/10 rounded-lg" />
            <div className="h-8 bg-white/10 rounded-lg" />
            <div className="h-8 bg-white/10 rounded-lg" />
          </div>
        </aside>
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="h-[68px] bg-white border-b border-slate-200/90 px-4 sm:px-8 flex items-center justify-between" />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2.5">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <div className="text-xs font-semibold text-slate-400">Loading workspace...</div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div suppressHydrationWarning className="min-h-screen flex bg-slate-50 text-slate-900 print:min-h-0 print:bg-white print:block">
      {/* Sticky/Fixed Collapsible Sidebar */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="min-w-0 flex-1 flex flex-col min-h-screen print:min-h-0 print:block">
        {/* Top Sticky Header */}
        <header className="h-[68px] bg-white border-b border-slate-200/90 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 md:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb path */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-slate-400 hidden sm:inline">
                ERP
              </span>
              <ChevronRight
                size={13}
                className="text-slate-300 hidden sm:inline"
              />
              <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px] uppercase tracking-wide">
                {activePage?.group || "Workspace"}
              </span>
              <ChevronRight size={13} className="text-slate-300" />
              <span className="font-bold text-slate-800 truncate max-w-[140px] sm:max-w-none">
                {activePage?.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Quick Command Palette Trigger (Cmd+K) */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-500 transition cursor-pointer"
            >
              <Search size={14} className="text-slate-400" />
              <span className="hidden sm:inline">Jump to any page...</span>
              <span className="sm:hidden">Search</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono bg-white border border-slate-300 text-slate-500 px-1.5 py-0.5 rounded font-semibold shadow-2xs">
                ⌘ K
              </kbd>
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
            </button>

            {/* Dynamic Authenticated User Profile */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {userInitial}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {user?.name || (authLoading ? "Loading..." : "User")}
                </div>
                <div className="text-[10px] text-blue-600 font-semibold tracking-wide">
                  {user?.role || "STAFF"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Section Horizontal Sub-Navigation Tabs */}
        {groupPages.length > 1 && (
          <nav className="bg-white border-b border-slate-200 px-4 sm:px-8 py-2 overflow-x-auto scrollbar-none sticky top-[68px] z-20 shadow-2xs print:hidden">
            <div className="flex items-center gap-1.5 min-w-max">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2 shrink-0">
                {activePage.group}:
              </span>
              {groupPages.map((p) => {
                const isActive = pathname === "/" + p.path;
                return (
                  <Link
                    key={p.path}
                    href={"/" + p.path}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                      isActive
                        ? "bg-blue-600 text-white font-semibold shadow-xs shadow-blue-500/20"
                        : "text-slate-600 hover:text-blue-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>{p.title}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}

        {/* Workspace Body or Access Denied Screen */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-[1600px] w-full mx-auto print:p-0 print:max-w-none print:w-full print:m-0">
          {!isAuthorized ? (
            <div className="max-w-lg mx-auto my-12 bg-white border border-rose-200 rounded-3xl p-8 shadow-sm text-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
                <Lock size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Access Restricted (প্রবেশাধিকার সংরক্ষিত)
              </h2>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                আপনার অ্যাকাউন্টে (<strong>{user?.name}</strong> -{" "}
                <span className="font-semibold text-rose-600">{user?.role}</span>)
                এই মডিউলটিতে প্রবেশের অনুমতি নেই।
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 my-5 text-left space-y-1">
                <div>
                  <strong>Requested Page:</strong> /{cleanPath}
                </div>
                <div>
                  <strong>Your Role:</strong> {user?.role}
                </div>
                <div>
                  <strong>Status:</strong> Unauthorized
                </div>
              </div>

              <p className="text-xs text-slate-400 mb-6">
                প্রয়োজনে অনুমতি অনুমোদনের জন্য আপনার সিস্টেম অ্যাডমিনের সাথে যোগাযোগ করুন।
              </p>

              <button
                onClick={() => router.push("/dashboard")}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-xs shadow-xs transition cursor-pointer"
              >
                <ArrowLeft size={15} />
                Return to Dashboard (ড্যাশবোর্ডে ফিরে যান)
              </button>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* Command Palette Modal (Cmd+K) */}
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Search Input */}
            <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
              <Search size={18} className="text-slate-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={paletteQuery}
                onChange={(e) => setPaletteQuery(e.target.value)}
                placeholder="Type to search pages, modules, or shortcuts..."
                className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
              />
              <kbd className="text-[10px] font-mono bg-white border border-slate-300 text-slate-400 px-1.5 py-0.5 rounded shadow-2xs">
                ESC
              </kbd>
            </div>

            {/* Results list */}
            <div className="max-h-96 overflow-y-auto p-2 space-y-1">
              {matchingPages.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400">
                  No matching pages found for &quot;{paletteQuery}&quot;
                </div>
              ) : (
                matchingPages.map((p) => (
                  <button
                    key={p.path}
                    onClick={() => handleSelectPage(p.path)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-blue-50/80 transition group cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 flex items-center gap-2">
                        <span>{p.title}</span>
                        <span className="text-[10px] text-slate-400 group-hover:text-blue-500 font-normal">
                          ({p.group})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {p.description}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono group-hover:text-blue-600">
                      /{p.path}
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Use arrows or mouse to select</span>
              <span>Food ERP Navigation</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
