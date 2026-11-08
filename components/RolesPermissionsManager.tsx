"use client";

import { useEffect, useMemo, useState } from "react";
import { getDefaultRolePermissions } from "@/lib/permissions";
import {
  Shield,
  ShieldCheck,
  UserCheck,
  Check,
  X,
  Save,
  Search,
  Lock,
  Layers,
  Package,
  Factory,
  Boxes,
  ShoppingCart,
  RotateCcw,
  FileText,
  Truck,
  BarChart3,
  Settings,
  AlertCircle,
  CheckCircle2,
  Users,
  UserPlus,
  Key,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  CircleDollarSign,
} from "lucide-react";

interface PermissionOption {
  id: string;
  name: string;
  description: string;
}

interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  icon: any;
  options: PermissionOption[];
}

const MODULES: ModuleDefinition[] = [
  {
    id: "products",
    name: "Products & Catalogue",
    description: "পণ্য তালিকা, ক্যাটাগরি ও মূল্য ব্যবস্থাপনা",
    icon: Package,
    options: [
      { id: "products.view", name: "View Products", description: "পণ্য তালিকা ও ক্যাটালগ দেখা" },
      { id: "products.create", name: "Add New Product", description: "নতুন পণ্য তৈরি ও এন্ট্রি" },
      { id: "products.edit", name: "Edit Pricing & Cost", description: "বিক্রয় ও উৎপাদন মূল্য হালনাগাদ" },
      { id: "products.delete", name: "Delete Product", description: "পণ্য মুছে ফেলা" },
    ],
  },
  {
    id: "inventory",
    name: "Inventory & Warehouses",
    description: "কাঁচামাল, প্রস্তুত পণ্য ও গুদাম ব্যবস্থাপনা",
    icon: Boxes,
    options: [
      { id: "inventory.view", name: "Stock Overview", description: "বর্তমান স্টক স্থিতি ও লেজার দেখা" },
      { id: "inventory.in", name: "Stock In (GRN)", description: "গুদামে মালামাল জমা করা" },
      { id: "inventory.out", name: "Stock Out", description: "গুদাম হতে পণ্য সরবরাহ / রিলিজ" },
      { id: "inventory.transfer", name: "Warehouse Transfer", description: "এক গুদাম হতে অন্য গুদামে স্থানান্তর" },
      { id: "inventory.adjust", name: "Stock Adjustment", description: "স্টক গণনা ও সমন্বয় অনুমোদন" },
    ],
  },
  {
    id: "manufacturing",
    name: "Production & Recipes (BOM)",
    description: "উৎপাদন ব্যাচ, রেসিপি ও কোয়ালিটি কন্ট্রোল",
    icon: Factory,
    options: [
      { id: "manufacturing.view", name: "View Orders", description: "উৎপাদন আদেশ ও ব্যাচ তালিকা দেখা" },
      { id: "manufacturing.create", name: "Create Work Order", description: "নতুন উৎপাদন পরিকল্পনা তৈরি" },
      { id: "manufacturing.qc", name: "Quality Approval", description: "ল্যাব ও কিউসি টেস্ট অনুমোদন" },
      { id: "manufacturing.bom", name: "Manage Recipes (BOM)", description: "রেসিপি বা ফর্মুলেশন প্রস্তুত" },
    ],
  },
  {
    id: "purchases",
    name: "Purchase & Suppliers",
    description: "সরবরাহকারী ও কাঁচামাল ক্রয় আদেশ",
    icon: ShoppingCart,
    options: [
      { id: "purchase.view", name: "View Purchase Orders", description: "পারচেজ অর্ডার তালিকা দেখা" },
      { id: "purchase.create", name: "Create PO", description: "নতুন ক্রয় আদেশ তৈরি" },
      { id: "purchase.approve", name: "Approve PO", description: "ক্রয় আদেশ অনুমোদন প্রদান" },
      { id: "purchase.grn", name: "Goods Received Note", description: "মাল প্রাপ্তির ভাউচার গ্রহণ" },
    ],
  },
  {
    id: "sales",
    name: "Sales & Distribution",
    description: "গ্রাহক, বিক্রয় চালান ও ইনভয়েস",
    icon: ShoppingCart,
    options: [
      { id: "sales.view", name: "View Sales Orders", description: "বিক্রয় আদেশ ও ইনভয়েস দেখা" },
      { id: "sales.create", name: "Create Sales Invoice", description: "নতুন বিক্রয় চালান তৈরি" },
      { id: "sales.approve", name: "Approve Order", description: "বিক্রয় আদেশ অনুমোদন ও চূড়ান্তকরণ" },
      { id: "sales.credit", name: "Customer Credit Approval", description: "গ্রাহকের বাকী ও ঋণসীমা অনুমোদন" },
      { id: "sales.dispatch", name: "Dispatch Delivery", description: "পণ্য ডেলিভারি ও গেটপাস প্রদান" },
    ],
  },
  {
    id: "returns",
    name: "Product Returns",
    description: "গ্রাহক ও বাজার ফেরত পণ্য নিয়ন্ত্রণ",
    icon: RotateCcw,
    options: [
      { id: "returns.view", name: "View Returns", description: "রিটার্ন আবেদনের তালিকা দেখা" },
      { id: "returns.inspect", name: "Return Inspection", description: "ফেরত পণ্যের কারণ পরীক্ষা" },
      { id: "returns.approve", name: "Approve Refund / Scrap", description: "রিপ্লেসমেন্ট বা স্ক্র্যাপ অনুমোদন" },
    ],
  },
  {
    id: "accounts",
    name: "Accounts & Finance",
    description: "নগদ টাকা জমা, খরচ, কালেকশন ও হিসাব লেজার",
    icon: CircleDollarSign,
    options: [
      { id: "accounts.view", name: "View Accounts Ledger", description: "টাকা জমা ও খরচের পূর্ণাঙ্গ লেজার দেখা" },
      { id: "accounts.transactions", name: "Record Money In / Out", description: "নতুন টাকা গ্রহণ বা পরিশোধ এন্ট্রি করা" },
    ],
  },
  {
    id: "vat",
    name: "VAT & Mushak 6.3",
    description: "জাতীয় রাজস্ব বোর্ডের কর চালান ও মূসক",
    icon: FileText,
    options: [
      { id: "vat.view", name: "View Mushak Invoices", description: "মূসক রেকর্ড ও চালানপত্র দেখা" },
      { id: "vat.create", name: "Issue Mushak 6.3", description: "নতুন মূসক-৬.৩ চালানপত্র তৈরি" },
      { id: "vat.print", name: "Print Tax Invoice", description: "অফিসিয়াল কর চালান প্রিন্ট ও ডাউনলোড" },
    ],
  },
  {
    id: "courier",
    name: "Courier & Tracking",
    description: "কুরিয়ার পার্সেল বুকিং ও ট্র্যাকিং",
    icon: Truck,
    options: [
      { id: "courier.view", name: "View Shipments", description: "কুরিয়ার চালান তালিকা দেখা" },
      { id: "courier.book", name: "Book Consignment", description: "নতুন কুরিয়ার পার্সেল বুকিং" },
      { id: "courier.track", name: "COD & Delivery Track", description: "ক্যাশ অন ডেলিভারি ও স্ট্যাটাস" },
    ],
  },
  {
    id: "reports",
    name: "Reports & Financials",
    description: "ব্যবসায়িক রিপোর্ট ও ডাটা এক্সপোর্ট",
    icon: BarChart3,
    options: [
      { id: "reports.inventory", name: "Inventory Reports", description: "স্টক ও ভ্যালুয়েশন রিপোর্ট" },
      { id: "reports.sales", name: "Sales Performance", description: "বিক্রয় ও লাভ-লোকসান বিশ্লেষণ" },
      { id: "reports.export", name: "Export CSV / Excel", description: "রিপোর্ট ও ডাটা ডাউনলোড" },
    ],
  },
  {
    id: "settings",
    name: "Settings & Administration",
    description: "ব্যবহারকারী, অনুমতি ও সিস্টেম অডিট",
    icon: Settings,
    options: [
      { id: "settings.users", name: "User Management", description: "ব্যবহারকারী তৈরি ও নিয়ন্ত্রণ" },
      { id: "settings.roles", name: "Roles & Permissions", description: "অনুমতি প্রদান ও অনুমোদন" },
      { id: "settings.audit", name: "Audit Logs", description: "সিস্টেমের সকল কার্যক্রমের হিস্টোরি" },
    ],
  },
];

// All permission IDs flattened
const ALL_PERMS = MODULES.flatMap((m) => m.options.map((o) => o.id));

export default function RolesPermissionsManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [userPerms, setUserPerms] = useState<Record<string, boolean>>({});
  const [selectedRole, setSelectedRole] = useState("STAFF");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  // Modals state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submittingUser, setSubmittingUser] = useState(false);

  // Add User Form State
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STAFF",
    isActive: true,
  });

  // Edit User Form State
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STAFF",
    isActive: true,
  });

  // Load all users
  async function loadUsers(preferUserId?: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.data) {
        setUsers(data.data);
        if (preferUserId) {
          const match = data.data.find((u: any) => u.id === preferUserId);
          if (match) {
            selectUser(match);
            return;
          }
        }
        if (!selectedUserId && data.data.length > 0) {
          selectUser(data.data[0]);
        } else if (selectedUserId) {
          const current = data.data.find((u: any) => u.id === selectedUserId);
          if (current) selectUser(current);
        }
      }
    } catch (e: any) {
      setError(e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function selectUser(user: any) {
    setSelectedUserId(user.id);
    setSelectedRole(user.role || "STAFF");
    setIsActive(user.isActive !== false);

    // Initialize edit form with user details
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "STAFF",
      isActive: user.isActive !== false,
    });

    // Parse stored permissions JSON
    let perms: Record<string, boolean> = {};
    if (user.permissions) {
      try {
        const parsed = JSON.parse(user.permissions);
        if (typeof parsed === "object") perms = parsed;
      } catch {}
    } else {
      // Default permissions based on role template
      perms = getDefaultRolePermissions(user.role || "STAFF");
    }
    setUserPerms(perms);
    setNotice("");
    setError("");
  }

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId),
    [users, selectedUserId]
  );

  const filteredUsers = useMemo(() => {
    if (!searchUser.trim()) return users;
    const q = searchUser.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, searchUser]);

  // Toggle single permission checkbox
  function togglePermission(permId: string) {
    setUserPerms((prev) => ({
      ...prev,
      [permId]: !prev[permId],
    }));
  }

  // Toggle all permissions for an entire module
  function toggleModule(module: ModuleDefinition) {
    const allChecked = module.options.every((opt) => !!userPerms[opt.id]);
    setUserPerms((prev) => {
      const updated = { ...prev };
      for (const opt of module.options) {
        updated[opt.id] = !allChecked;
      }
      return updated;
    });
  }

  // Preset role appliers
  function applyPreset(presetName: string) {
    const updated = getDefaultRolePermissions(presetName);
    setSelectedRole(presetName === "READONLY" ? "STAFF" : presetName);
    setUserPerms(updated);
    setNotice(`Applied ${presetName} permission template. Click 'Save & Approve' to confirm.`);
  }

  // Count active permissions for selected user
  const activeCount = useMemo(() => {
    return Object.values(userPerms).filter(Boolean).length;
  }, [userPerms]);

  // Save permissions to server
  async function handleSave() {
    if (!selectedUserId) return;
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = {
        role: selectedRole,
        isActive: isActive,
        permissions: JSON.stringify(userPerms),
      };

      const res = await fetch(`/api/users/${selectedUserId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update permissions");

      setNotice(`অনুমোদন সফল হয়েছে! ${selectedUser?.name}-এর অনুমতি সংরক্ষণ করা হয়েছে।`);

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUserId ? { ...u, role: selectedRole, isActive, permissions: JSON.stringify(userPerms) } : u
        )
      );
    } catch (e: any) {
      setError(e.message || "Could not save permissions");
    } finally {
      setSaving(false);
    }
  }

  // Handle Add New User
  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.email.trim() || !addForm.password.trim()) {
      setError("Please provide username, email, and password.");
      return;
    }

    setSubmittingUser(true);
    setError("");
    setNotice("");

    try {
      // Default permissions based on chosen role template
      const initialPerms = getDefaultRolePermissions(addForm.role);

      const payload = {
        name: addForm.name.trim(),
        email: addForm.email.trim().toLowerCase(),
        password: addForm.password.trim(),
        role: addForm.role,
        isActive: addForm.isActive,
        permissions: JSON.stringify(initialPerms),
      };

      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create user");

      setIsAddUserModalOpen(false);
      setAddForm({ name: "", email: "", password: "", role: "STAFF", isActive: true });
      setNotice(`নতুন ব্যবহারকারী '${json.data.name}' সফলভাবে যুক্ত হয়েছে!`);

      // Reload and select this new user
      await loadUsers(json.data.id);
    } catch (err: any) {
      setError(err.message || "Could not create user");
    } finally {
      setSubmittingUser(false);
    }
  }

  // Handle Edit User & Password
  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUserId) return;
    if (!editForm.name.trim() || !editForm.email.trim()) {
      setError("Username and email cannot be empty.");
      return;
    }

    setSubmittingUser(true);
    setError("");
    setNotice("");

    try {
      const payload: Record<string, any> = {
        name: editForm.name.trim(),
        email: editForm.email.trim().toLowerCase(),
        role: editForm.role,
        isActive: editForm.isActive,
      };

      if (editForm.password && editForm.password.trim()) {
        payload.password = editForm.password.trim();
      }

      const res = await fetch(`/api/users/${selectedUserId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update user details");

      setIsEditUserModalOpen(false);
      setNotice(
        `ব্যবহারকারী '${json.data.name}'-এর তথ্য ${
          editForm.password ? "এবং পাসওয়ার্ড " : ""
        }সফলভাবে আপডেট করা হয়েছে!`
      );

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUserId
            ? { ...u, name: json.data.name, email: json.data.email, role: json.data.role, isActive: json.data.isActive }
            : u
        )
      );
      setSelectedRole(json.data.role);
      setIsActive(json.data.isActive);
    } catch (err: any) {
      setError(err.message || "Could not update user");
    } finally {
      setSubmittingUser(false);
    }
  }

  // Handle Delete User
  async function handleDeleteUser() {
    if (!selectedUserId || !selectedUser) return;
    const ok = window.confirm(
      `Are you sure you want to delete user '${selectedUser.name}' (${selectedUser.email})? This action cannot be undone.`
    );
    if (!ok) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const res = await fetch(`/api/users/${selectedUserId}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to delete user");
      }

      setNotice(`ব্যবহারকারী '${selectedUser.name}' মুছে ফেলা হয়েছে।`);
      const remaining = users.filter((u) => u.id !== selectedUserId);
      setUsers(remaining);
      if (remaining.length > 0) {
        selectUser(remaining[0]);
      } else {
        setSelectedUserId("");
      }
    } catch (err: any) {
      setError(err.message || "Could not delete user");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400 mb-1">Settings / Access Control</div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="text-blue-600" size={28} />
            Roles & Permissions Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            মডিউল অনুযায়ী ব্যবহারকারীদের নির্দিষ্ট অপশনে এক্সেস অনুমতি অনুমোদন ও পাসওয়ার্ড নিয়ন্ত্রণ করুন।
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setAddForm({ name: "", email: "", password: "", role: "STAFF", isActive: true });
              setShowPassword(false);
              setIsAddUserModalOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer shrink-0"
          >
            <UserPlus size={16} />
            + Add New User (নতুন ব্যবহারকারী)
          </button>

          {selectedUser && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer shrink-0"
            >
              <Save size={16} />
              {saving ? "সংরক্ষণ হচ্ছে..." : "অনুমোদন ও সংরক্ষণ করুন"}
            </button>
          )}
        </div>
      </div>

      {notice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span className="font-medium">{notice}</span>
          </div>
          <button onClick={() => setNotice("")} className="text-emerald-600 hover:text-emerald-900">
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4 py-3 text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
          <button onClick={() => setError("")} className="text-rose-600 hover:text-rose-900">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Users List */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-slate-500" />
              <h2 className="font-bold text-sm text-slate-800">Users ({users.length})</h2>
            </div>
            <button
              onClick={() => {
                setAddForm({ name: "", email: "", password: "", role: "STAFF", isActive: true });
                setShowPassword(false);
                setIsAddUserModalOpen(true);
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <UserPlus size={13} />
              Add User
            </button>
          </div>

          {/* User Search Input */}
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
            <input
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              placeholder="Search user name, email, or role..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* Users Scrollable List */}
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No users found</div>
            ) : (
              filteredUsers.map((u) => {
                const isSelected = u.id === selectedUserId;
                let permCount = 0;
                try {
                  if (u.permissions) permCount = Object.values(JSON.parse(u.permissions)).filter(Boolean).length;
                } catch {}

                return (
                  <button
                    key={u.id}
                    onClick={() => selectUser(u)}
                    className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between gap-3 border cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/90 border-blue-400 text-blue-900 shadow-2xs"
                        : "bg-white hover:bg-slate-50 border-transparent hover:border-slate-200 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {u.name ? u.name[0].toUpperCase() : "U"}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs truncate text-slate-900 flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {!u.isActive && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded font-bold">
                              Inactive
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">{u.email}</div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded ${
                          u.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700"
                            : u.role === "FACTORY_MANAGER"
                            ? "bg-amber-100 text-amber-700"
                            : u.role === "SALES_DIRECTOR"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {u.role}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {permCount > 0 ? `${permCount} perms` : "Default"}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Permission Assignment Matrix & User Card */}
        <div className="lg:col-span-8 space-y-5">
          {selectedUser ? (
            <>
              {/* Selected User Header Card */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                      {selectedUser.name ? selectedUser.name[0].toUpperCase() : "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-base text-slate-900">{selectedUser.name}</h2>
                        <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">
                          {selectedRole}
                        </span>
                        {!isActive && (
                          <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full font-semibold">
                            Suspended
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{selectedUser.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Role Controls */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setEditForm({
                          name: selectedUser.name || "",
                          email: selectedUser.email || "",
                          password: "",
                          role: selectedRole,
                          isActive: isActive,
                        });
                        setShowPassword(false);
                        setIsEditUserModalOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Edit2 size={13} className="text-slate-500" />
                      Edit User & Password (সম্পাদনা)
                    </button>

                    <button
                      type="button"
                      onClick={handleDeleteUser}
                      title="Delete User"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200 transition cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Quick Presets & Stats Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs text-slate-400 font-semibold mr-1">Templates:</span>
                    <button
                      onClick={() => applyPreset("ADMIN")}
                      className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 transition border border-purple-200 cursor-pointer"
                    >
                      Full Admin
                    </button>
                    <button
                      onClick={() => applyPreset("SALES_DIRECTOR")}
                      className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-200 cursor-pointer"
                    >
                      Sales Team
                    </button>
                    <button
                      onClick={() => applyPreset("FACTORY_MANAGER")}
                      className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 transition border border-amber-200 cursor-pointer"
                    >
                      Factory & QC
                    </button>
                    <button
                      onClick={() => applyPreset("INVENTORY_LEAD")}
                      className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition border border-emerald-200 cursor-pointer"
                    >
                      Inventory Lead
                    </button>
                    <button
                      onClick={() => applyPreset("ACCOUNTANT")}
                      className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 transition border border-teal-200 cursor-pointer"
                    >
                      VAT & Accounts
                    </button>
                    <button
                      onClick={() => applyPreset("READONLY")}
                      className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                    >
                      View Only
                    </button>
                  </div>

                  <div className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg">
                    {activeCount} of {ALL_PERMS.length} permissions approved
                  </div>
                </div>
              </div>

              {/* Modules Matrix Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MODULES.map((module) => {
                  const Icon = module.icon;
                  const moduleOptionIds = module.options.map((o) => o.id);
                  const checkedCount = moduleOptionIds.filter((id) => !!userPerms[id]).length;
                  const isAllChecked = checkedCount === module.options.length;

                  return (
                    <div
                      key={module.id}
                      className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:border-slate-300 transition"
                    >
                      {/* Module Header with Toggle All */}
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                            <Icon size={18} />
                          </div>
                          <div>
                            <h3 className="font-bold text-xs text-slate-900">{module.name}</h3>
                            <p className="text-[11px] text-slate-400">{module.description}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleModule(module)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded transition shrink-0 cursor-pointer ${
                            isAllChecked
                              ? "bg-blue-600 text-white"
                              : checkedCount > 0
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {isAllChecked ? "Deselect All" : "Select All"}
                        </button>
                      </div>

                      {/* Checkboxes List */}
                      <div className="mt-3 space-y-2">
                        {module.options.map((opt) => {
                          const isChecked = !!userPerms[opt.id];
                          return (
                            <label
                              key={opt.id}
                              className={`flex items-start gap-2.5 p-2 rounded-lg transition cursor-pointer select-none ${
                                isChecked ? "bg-blue-50/60" : "hover:bg-slate-50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(opt.id)}
                                className="mt-0.5 w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                              />
                              <div className="min-w-0">
                                <div
                                  className={`text-xs font-semibold ${
                                    isChecked ? "text-blue-900" : "text-slate-700"
                                  }`}
                                >
                                  {opt.name}
                                </div>
                                <div className="text-[10.5px] text-slate-400 leading-tight">
                                  {opt.description}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Sticky Save Bar */}
              <div className="sticky bottom-4 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-lg flex items-center justify-between z-20">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-emerald-600" />
                  <span className="text-xs text-slate-600 font-medium">
                    Ready to grant <strong>{activeCount}</strong> permissions to <strong>{selectedUser.name}</strong>
                  </span>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl px-6 py-2.5 text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Save size={15} />
                  {saving ? "Saving..." : "Save & Approve Permissions (অনুমোদন করুন)"}
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
              <Shield size={32} className="mx-auto mb-2 opacity-40" />
              Select a user from the left column to configure their role and permissions.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add New User */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Add New User</h3>
                  <p className="text-[11px] text-slate-500">নতুন ব্যবহারকারী ও পাসওয়ার্ড তৈরি করুন</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name / Username (ব্যবহারকারীর নাম) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Ahmed"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address (ইমেইল) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. tanvir@fooderp.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Password (পাসওয়ার্ড) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter secure initial password..."
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  The user can login with this email & password.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    System Role (পদবী)
                  </label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="FACTORY_MANAGER">FACTORY_MANAGER</option>
                    <option value="INVENTORY_LEAD">INVENTORY_LEAD</option>
                    <option value="SALES_DIRECTOR">SALES_DIRECTOR</option>
                    <option value="QC_OFFICER">QC_OFFICER</option>
                    <option value="ACCOUNTANT">ACCOUNTANT</option>
                    <option value="STAFF">STAFF</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Status
                  </label>
                  <select
                    value={addForm.isActive ? "true" : "false"}
                    onChange={(e) => setAddForm({ ...addForm, isActive: e.target.value === "true" })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="true">Active (সক্রিয়)</option>
                    <option value="false">Suspended (স্থগিত)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingUser}
                  className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <UserPlus size={14} />
                  {submittingUser ? "Creating..." : "Create User (ব্যবহারকারী তৈরি করুন)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User & Change Password */}
      {isEditUserModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Edit User & Password</h3>
                  <p className="text-[11px] text-slate-500">
                    ব্যবহারকারীর নাম, ইমেইল এবং পাসওয়ার্ড পরিবর্তন করুন
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name / Username (ব্যবহারকারীর নাম) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Ahmed"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address (ইমেইল) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. tanvir@fooderp.com"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Set New Password (নতুন পাসওয়ার্ড)
                  </label>
                  <span className="text-[10px] text-slate-400">Leave blank to keep unchanged</span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password (optional)..."
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[10.5px] text-amber-600 mt-1 flex items-center gap-1">
                  <Key size={12} />
                  পাসওয়ার্ড পরিবর্তন না করতে চাইলে ঘরটি খালি রাখুন।
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    System Role (পদবী)
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="FACTORY_MANAGER">FACTORY_MANAGER</option>
                    <option value="INVENTORY_LEAD">INVENTORY_LEAD</option>
                    <option value="SALES_DIRECTOR">SALES_DIRECTOR</option>
                    <option value="QC_OFFICER">QC_OFFICER</option>
                    <option value="ACCOUNTANT">ACCOUNTANT</option>
                    <option value="STAFF">STAFF</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Status
                  </label>
                  <select
                    value={editForm.isActive ? "true" : "false"}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === "true" })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="true">Active (সক্রিয়)</option>
                    <option value="false">Suspended (স্থগিত)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditUserModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingUser}
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save size={14} />
                  {submittingUser ? "Updating..." : "Update Credentials (আপডেট করুন)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
