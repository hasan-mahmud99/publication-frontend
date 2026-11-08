"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Package,
  ShoppingCart,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Save,
  Check,
  Info,
  DollarSign,
  FileText,
  BadgePercent,
} from "lucide-react";
import SearchableCombobox from "./SearchableCombobox";

export interface OrderItemRow {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  availableStock: number;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface OrderBuilderProps {
  type: "sales" | "purchase";
  onBack: () => void;
  onSaved: () => void;
  initialData?: any;
  products: {
    id: string;
    name: string;
    sku: string;
    category?: string;
    sellingPrice?: number;
    costPrice?: number;
    unit?: string;
    currentStock?: number;
    reorderLevel?: number;
  }[];
  customers: {
    id: string;
    name: string;
    phone?: string;
    customerType?: string;
    address?: string;
    creditLimit?: number;
  }[];
  suppliers: {
    id: string;
    name: string;
    phone?: string;
    bin?: string;
    address?: string;
  }[];
  onQuickAddProduct?: () => void;
  onQuickAddCustomer?: () => void;
  onQuickAddSupplier?: () => void;
}

export default function OrderBuilder({
  type,
  onBack,
  onSaved,
  initialData,
  products,
  customers,
  suppliers,
  onQuickAddProduct,
  onQuickAddCustomer,
  onQuickAddSupplier,
}: OrderBuilderProps) {
  const isSales = type === "sales";

  // Form Header State
  const [orderNo, setOrderNo] = useState(
    initialData?.orderNo ||
      `${isSales ? "SO" : "PO"}-${Date.now().toString().slice(-6)}`
  );
  const [partyId, setPartyId] = useState(
    isSales
      ? initialData?.customerId || (customers[0]?.id ?? "")
      : initialData?.supplierId || (suppliers[0]?.id ?? "")
  );
  const [orderDate, setOrderDate] = useState(
    initialData?.orderDate
      ? new Date(initialData.orderDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [status, setStatus] = useState(
    initialData?.status || (isSales ? "CONFIRMED" : "RECEIVED")
  );
  const [paymentStatus, setPaymentStatus] = useState(
    initialData?.paymentStatus || "UNPAID"
  );
  const [paidAmount, setPaidAmount] = useState<number>(
    Number(initialData?.paidAmount || 0)
  );
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [applyVat, setApplyVat] = useState(false);

  // Line items state
  const [items, setItems] = useState<OrderItemRow[]>(() => {
    if (initialData?.items) {
      try {
        const parsed =
          typeof initialData.items === "string"
            ? JSON.parse(initialData.items)
            : initialData.items;
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((it: any, idx: number) => ({
            id: `item-${idx}-${Date.now()}`,
            productId: it.productId || "",
            productName: it.productName || "",
            sku: it.sku || "",
            unit: it.unit || "pcs",
            availableStock: Number(it.availableStock ?? 0),
            quantity: Number(it.quantity || 1),
            unitPrice: Number(it.unitPrice || 0),
            total: Number(it.total || 0),
          }));
        }
      } catch {}
    }

    if (initialData?.productId) {
      const prod = products.find((p) => p.id === initialData.productId);
      const qty = Number(initialData.quantity || 1);
      const price = Number(initialData.unitPrice || 0);
      return [
        {
          id: `item-0-${Date.now()}`,
          productId: initialData.productId,
          productName: prod?.name || "Product",
          sku: prod?.sku || "",
          unit: prod?.unit || "pcs",
          availableStock: Number(prod?.currentStock || 0),
          quantity: qty,
          unitPrice: price,
          total: Number((qty * price).toFixed(2)),
        },
      ];
    }

    // Default 1 blank row
    const firstProd = products[0];
    const defaultPrice = isSales
      ? Number(firstProd?.sellingPrice || 0)
      : Number(firstProd?.costPrice || 0);

    return [
      {
        id: `item-0-${Date.now()}`,
        productId: firstProd?.id || "",
        productName: firstProd?.name || "",
        sku: firstProd?.sku || "",
        unit: firstProd?.unit || "pcs",
        availableStock: Number(firstProd?.currentStock || 0),
        quantity: 1,
        unitPrice: defaultPrice,
        total: defaultPrice,
      },
    ];
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Selected party object
  const selectedParty = useMemo(() => {
    if (isSales) {
      return customers.find((c) => c.id === partyId);
    }
    return suppliers.find((s) => s.id === partyId);
  }, [isSales, partyId, customers, suppliers]);

  // Add another item row
  function handleAddItem() {
    // Pick next product not already in list, or just first product
    const existingIds = new Set(items.map((it) => it.productId));
    const nextProd = products.find((p) => !existingIds.has(p.id)) || products[0];
    const defaultPrice = isSales
      ? Number(nextProd?.sellingPrice || 0)
      : Number(nextProd?.costPrice || 0);

    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random()}`,
        productId: nextProd?.id || "",
        productName: nextProd?.name || "",
        sku: nextProd?.sku || "",
        unit: nextProd?.unit || "pcs",
        availableStock: Number(nextProd?.currentStock || 0),
        quantity: 1,
        unitPrice: defaultPrice,
        total: defaultPrice,
      },
    ]);
  }

  // Remove item row
  function handleRemoveItem(id: string) {
    if (items.length <= 1) {
      setError("An order must have at least one product item.");
      return;
    }
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  // Update specific item field
  function handleItemChange(id: string, field: keyof OrderItemRow, val: any) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: val };

        if (field === "productId") {
          const prod = products.find((p) => p.id === val);
          if (prod) {
            updated.productName = prod.name;
            updated.sku = prod.sku;
            updated.unit = prod.unit || "pcs";
            updated.availableStock = Number(prod.currentStock || 0);
            const price = isSales
              ? Number(prod.sellingPrice || 0)
              : Number(prod.costPrice || 0);
            updated.unitPrice = price;
            updated.total = Number((Number(updated.quantity || 1) * price).toFixed(2));
          }
        }

        if (field === "quantity" || field === "unitPrice") {
          const qty = Number(field === "quantity" ? val : updated.quantity) || 0;
          const price = Number(field === "unitPrice" ? val : updated.unitPrice) || 0;
          updated.total = Number((qty * price).toFixed(2));
        }

        return updated;
      })
    );
  }

  // Calculations
  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => sum + Number(it.total || 0), 0);
  }, [items]);

  const vatAmount = useMemo(() => {
    if (!applyVat) return 0;
    return Number((subtotal * 0.15).toFixed(2));
  }, [subtotal, applyVat]);

  const grandTotal = useMemo(() => {
    return Number((subtotal + vatAmount).toFixed(2));
  }, [subtotal, vatAmount]);

  const totalQuantity = useMemo(() => {
    return items.reduce((sum, it) => sum + Number(it.quantity || 0), 0);
  }, [items]);

  // Validation: Check if any sales item exceeds available stock
  const stockErrors = useMemo(() => {
    if (!isSales) return [];
    const errors: string[] = [];
    for (const it of items) {
      if (!it.productId) continue;
      if (it.availableStock <= 0) {
        errors.push(`"${it.productName}" is OUT OF STOCK (0 ${it.unit} available).`);
      } else if (it.quantity > it.availableStock) {
        errors.push(
          `"${it.productName}" exceeds available stock (Requested: ${it.quantity} ${it.unit}, Available: ${it.availableStock} ${it.unit}).`
        );
      }
    }
    return errors;
  }, [isSales, items]);

  async function handleSaveOrder() {
    setError("");

    if (!orderNo.trim()) {
      setError("Order number is required");
      return;
    }

    if (!partyId) {
      setError(isSales ? "Please select a customer" : "Please select a supplier");
      return;
    }

    if (items.length === 0) {
      setError("Please add at least one product item to the order.");
      return;
    }

    // Check stock for sales orders
    if (isSales && stockErrors.length > 0) {
      setError(stockErrors[0]);
      return;
    }

    // Check zero quantities
    for (const it of items) {
      if (Number(it.quantity) <= 0) {
        setError(`Quantity for "${it.productName}" must be at least 1.`);
        return;
      }
    }

    if (paymentStatus === "PARTIAL" && (paidAmount <= 0 || isNaN(paidAmount))) {
      setError("আংশিক পেমেন্টের জন্য পরিশোধিত টাকা (Paid Amount) উল্লেখ করতে হবে।");
      return;
    }

    if (paymentStatus === "PARTIAL" && paidAmount > grandTotal) {
      setError(`পরিশোধিত টাকা (৳${paidAmount}) সর্বমোট বিলের (৳${grandTotal}) চেয়ে বেশি হতে পারে না।`);
      return;
    }

    setSaving(true);

    try {
      const endpoint = isSales ? "/api/sales-orders" : "/api/purchase-orders";
      const finalPaid =
        paymentStatus === "PAID"
          ? grandTotal
          : paymentStatus === "PARTIAL"
          ? Number(paidAmount || 0)
          : 0;
      const finalDue = Math.max(0, Number((grandTotal - finalPaid).toFixed(2)));

      const payload: Record<string, any> = {
        orderNo,
        orderDate: new Date(orderDate),
        status,
        paymentStatus,
        paidAmount: finalPaid,
        dueAmount: finalDue,
        notes,
        total: grandTotal,
        productId: items[0].productId,
        quantity: totalQuantity,
        unitPrice: items[0].unitPrice,
        items: JSON.stringify(items),
      };

      if (isSales) {
        payload.customerId = partyId;
        payload.vatAmount = vatAmount;
        payload.vatPaid = applyVat && paymentStatus === "PAID";
      } else {
        payload.supplierId = partyId;
      }

      const method = initialData?.id ? "PATCH" : "POST";
      const url = initialData?.id ? `${endpoint}/${initialData.id}` : endpoint;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to save order");
      }

      onSaved();
    } catch (err: any) {
      setError(err.message || "Failed to save order");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="space-y-1">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition cursor-pointer mb-1 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to {isSales ? "Sales Orders" : "Purchase Orders"}
          </button>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl text-white shadow-xs ${isSales ? "bg-blue-600" : "bg-emerald-600"}`}>
              {isSales ? <ShoppingCart size={20} /> : <Building2 size={20} />}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {initialData ? "Edit Order" : isSales ? "New Sales Order (নতুন বিক্রয় চালান)" : "New Purchase Order (নতুন ক্রয় আদেশ)"}
              </h1>
              <p className="text-xs text-slate-500">
                {isSales
                  ? "Sell multiple items to customer, verify live stock positions, and generate invoice."
                  : "Purchase multiple items from supplier, track receiving stock, and record payable."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onBack}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveOrder}
            disabled={saving || (isSales && stockErrors.length > 0)}
            className={`rounded-xl px-5 py-2.5 text-xs font-bold text-white flex items-center gap-2 shadow-xs transition cursor-pointer ${
              isSales
                ? "bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300"
                : "bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300"
            }`}
          >
            <Save size={15} />
            {saving ? "Saving Order..." : "Confirm & Save Order (অর্ডার চূড়ান্ত করুন)"}
          </button>
        </div>
      </div>

      {/* Error / Alert notification */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
          <button onClick={() => setError("")} className="text-rose-500 hover:text-rose-800">
            &times;
          </button>
        </div>
      )}

      {/* Primary Order Meta Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <FileText size={14} className="text-slate-400" /> General Order Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Order No */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Order Number (চালান / অর্ডার নং) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
              placeholder="e.g. SO-100234"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-mono font-medium"
            />
          </div>

          {/* Party Selector (Customer or Supplier) */}
          <div className="sm:col-span-1 lg:col-span-2">
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {isSales ? "Customer (গ্রাহক নির্বাচন)" : "Supplier (সরবরাহকারী নির্বাচন)"}{" "}
              <span className="text-rose-500">*</span>
            </label>
            {isSales ? (
              <SearchableCombobox
                value={partyId}
                onChange={(val) => setPartyId(val)}
                options={customers.map((c) => ({
                  value: c.id,
                  label: c.name,
                  sublabel: c.phone ? `Phone: ${c.phone} • Type: ${c.customerType}` : c.customerType,
                  badge: c.customerType || undefined,
                }))}
                placeholder="-- Select Customer --"
                searchPlaceholder="Search customer by name or phone..."
                onAddNew={onQuickAddCustomer}
                addNewTitle="+ Add Customer (নতুন গ্রাহক)"
              />
            ) : (
              <SearchableCombobox
                value={partyId}
                onChange={(val) => setPartyId(val)}
                options={suppliers.map((s) => ({
                  value: s.id,
                  label: s.name,
                  sublabel: s.phone ? `Phone: ${s.phone} • BIN: ${s.bin || "N/A"}` : s.bin,
                }))}
                placeholder="-- Select Supplier --"
                searchPlaceholder="Search supplier by name or phone..."
                onAddNew={onQuickAddSupplier}
                addNewTitle="+ Add Supplier (নতুন সরবরাহকারী)"
              />
            )}
            {selectedParty && (
              <div className="mt-1.5 text-[11px] text-slate-500 flex flex-wrap gap-x-3 gap-y-0.5">
                <span>📞 {(selectedParty as any).phone || "No phone"}</span>
                <span>📍 {(selectedParty as any).address || "No address"}</span>
                {isSales && (
                  <span className="font-semibold text-blue-700">
                    Credit Limit: ৳{Number((selectedParty as any).creditLimit || 0).toLocaleString()}
                  </span>
                )}
                {!isSales && (selectedParty as any).bin && (
                  <span className="font-semibold text-emerald-700">
                    BIN: {(selectedParty as any).bin}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Order Date */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Order Date (তারিখ)
            </label>
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Order Statuses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Order Status (অর্ডার স্ট্যাটাস)
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer"
            >
              {isSales ? (
                <>
                  <option value="DRAFT">DRAFT (খসড়া)</option>
                  <option value="CONFIRMED">CONFIRMED (নিশ্চিতকৃত / Stock Deducted)</option>
                  <option value="PROCESSING">PROCESSING (প্রক্রিয়াধীন)</option>
                  <option value="DISPATCHED">DISPATCHED (ডেলিভারিতে প্রেরিত)</option>
                  <option value="DELIVERED">DELIVERED (সরবরাহ সম্পন্ন)</option>
                  <option value="CANCELLED">CANCELLED (বাতিল)</option>
                </>
              ) : (
                <>
                  <option value="DRAFT">DRAFT (খসড়া)</option>
                  <option value="PENDING_APPROVAL">PENDING_APPROVAL (অনুমোদন বাকি)</option>
                  <option value="APPROVED">APPROVED (অনুমোদিত)</option>
                  <option value="RECEIVED">RECEIVED (মালামাল গৃহীত / Stock Added)</option>
                  <option value="COMPLETED">COMPLETED (সম্পন্ন)</option>
                  <option value="CANCELLED">CANCELLED (বাতিল)</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Payment Status (মূল্য পরিশোধ)
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => {
                const val = e.target.value;
                setPaymentStatus(val);
                if (val === "PAID") {
                  setPaidAmount(grandTotal);
                } else if (val === "UNPAID") {
                  setPaidAmount(0);
                } else if (val === "PARTIAL" && (!paidAmount || paidAmount === 0)) {
                  setPaidAmount(Math.round(grandTotal / 2));
                }
              }}
              className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer"
            >
              <option value="UNPAID">UNPAID (বকেয়া)</option>
              <option value="PAID">PAID (সম্পূর্ণ পরিশোধিত / Cash In/Out)</option>
              <option value="PARTIAL">PARTIAL (আংশিক পরিশোধ)</option>
            </select>
          </div>

          {/* Conditional Amount Box for Partial Payment */}
          {paymentStatus === "PARTIAL" && (
            <div className="bg-amber-50/70 border border-amber-300 p-3 rounded-xl animate-in fade-in space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-amber-950 flex items-center gap-1">
                  <span>Paid Amount (পরিশোধিত টাকা)</span>
                  <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10.5px] text-slate-500 font-mono">
                  Bill Total: ৳{grandTotal.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">৳</span>
                <input
                  type="number"
                  step="any"
                  min={0}
                  max={grandTotal}
                  value={paidAmount || ""}
                  onChange={(e) => setPaidAmount(Math.max(0, Number(e.target.value)))}
                  placeholder="Enter collected/paid amount"
                  className="w-full pl-7 pr-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500 font-mono font-bold text-slate-900"
                />
              </div>
              <div className="text-[11px] text-slate-600 flex justify-between pt-0.5">
                <span>Remaining Due (বকেয়া):</span>
                <span className="font-mono font-bold text-rose-600">
                  ৳{Math.max(0, grandTotal - (paidAmount || 0)).toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          <div className={paymentStatus === "PARTIAL" ? "sm:col-span-1" : "sm:col-span-2"}>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Order Notes & Instructions (মন্তব্য ও নির্দেশনা)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Urgent morning dispatch via Tejgaon gate..."
              className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Multi-Item Line Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
        <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Package size={17} className="text-blue-600" />
              <span>Order Line Items ({items.length} Products)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select products from warehouse stock, specify quantities, and review live stock availability.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl px-3.5 py-1.5 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
          >
            <Plus size={14} /> Add Another Product (পণ্য যোগ করুন)
          </button>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10.5px]">
              <tr>
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-4 min-w-[280px]">Product / Item Selection</th>
                <th className="py-3 px-3 min-w-[140px] text-center">Available Stock</th>
                <th className="py-3 px-3 w-32 text-center">Quantity</th>
                <th className="py-3 px-3 w-36 text-right">Unit Price (৳)</th>
                <th className="py-3 px-4 w-36 text-right">Line Total (৳)</th>
                <th className="py-3 px-3 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((row, index) => {
                const isOutOfStock = isSales && row.availableStock <= 0;
                const isOverselling = isSales && row.availableStock > 0 && row.quantity > row.availableStock;

                return (
                  <tr
                    key={row.id}
                    className={`transition ${
                      isOverselling || isOutOfStock
                        ? "bg-amber-50/50 hover:bg-amber-50"
                        : "hover:bg-slate-50/60"
                    }`}
                  >
                    {/* Index */}
                    <td className="py-3.5 px-3 text-center text-slate-400 font-mono">
                      {index + 1}
                    </td>

                    {/* Product Selector */}
                    <td className="py-3.5 px-4">
                      <SearchableCombobox
                        value={row.productId}
                        onChange={(val) => handleItemChange(row.id, "productId", val)}
                        options={products.map((p) => {
                          const stock = Number(p.currentStock ?? 0);
                          const isOut = stock <= 0;
                          const isLow = stock > 0 && stock <= Number(p.reorderLevel || 15);
                          const badge = isOut
                            ? "Out of Stock (0)"
                            : isLow
                            ? `Low: ${stock} ${p.unit}`
                            : `Stock: ${stock} ${p.unit}`;

                          return {
                            value: p.id,
                            label: p.name,
                            sublabel: `SKU: ${p.sku} • ৳${Number(isSales ? p.sellingPrice || 0 : p.costPrice || 0).toFixed(2)}`,
                            badge,
                          };
                        })}
                        placeholder="-- Select Product from Inventory --"
                        searchPlaceholder="Search product by name, SKU..."
                        onAddNew={onQuickAddProduct}
                        addNewTitle="+ Add New Product (নতুন পণ্য)"
                      />
                    </td>

                    {/* Available Stock Indicator */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex flex-col items-center justify-center">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            ❌ Out of Stock (0)
                          </span>
                        ) : row.availableStock <= 15 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            ⚠️ {row.availableStock} {row.unit}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            📦 {row.availableStock} {row.unit}
                          </span>
                        )}

                        {isSales && row.availableStock > 0 && (
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            Remaining: {Math.max(0, row.availableStock - row.quantity)} {row.unit}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Quantity Input */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleItemChange(
                                row.id,
                                "quantity",
                                Math.max(1, Number(row.quantity || 1) - 1)
                              )
                            }
                            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer transition text-xs"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            step="any"
                            value={row.quantity}
                            onChange={(e) =>
                              handleItemChange(row.id, "quantity", e.target.value)
                            }
                            className={`w-16 text-center font-bold text-xs py-1.5 px-1 border rounded-lg outline-none focus:ring-2 ${
                              isOverselling || isOutOfStock
                                ? "border-amber-400 bg-amber-50 text-amber-950 focus:ring-amber-200"
                                : "border-slate-200 bg-white focus:ring-blue-100"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleItemChange(
                                row.id,
                                "quantity",
                                Number(row.quantity || 0) + 1
                              )
                            }
                            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer transition text-xs"
                          >
                            +
                          </button>
                        </div>
                        {isOverselling && (
                          <span className="text-[10px] font-bold text-amber-700 mt-1">
                            ⚠️ Exceeds Stock!
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Unit Price Input */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="relative inline-block w-full">
                        <span className="absolute left-2.5 top-2 text-slate-400 text-xs">৳</span>
                        <input
                          type="number"
                          step="any"
                          value={row.unitPrice}
                          onChange={(e) =>
                            handleItemChange(row.id, "unitPrice", e.target.value)
                          }
                          className="w-full text-right font-medium text-xs pl-6 pr-2.5 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                        />
                      </div>
                    </td>

                    {/* Line Total */}
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-sm">
                      ৳{Number(row.total || 0).toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Delete Row Button */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(row.id)}
                        disabled={items.length <= 1}
                        className="text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-slate-400 p-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="Remove product item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Add item row footer button */}
        <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleAddItem}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-blue-50 transition"
          >
            <Plus size={14} /> Add Another Product Line (আরেকটি পণ্য যোগ করুন)
          </button>
          <span className="text-[11px] text-slate-400">
            Total Items: <strong className="text-slate-700">{items.length}</strong> | Total Quantity:{" "}
            <strong className="text-slate-700">{totalQuantity}</strong>
          </span>
        </div>
      </div>

      {/* Bottom Summary & Financial Calculation Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Inventory Impact & Notes */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Info size={14} className="text-blue-500" />
            {isSales ? "Live Inventory Stock Impact" : "Inventory Ingestion Preview"}
          </h3>

          <div className="space-y-2">
            {items.map((it) => (
              <div
                key={it.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 text-xs"
              >
                <div className="flex items-center gap-2">
                  <Package size={14} className="text-slate-400" />
                  <span className="font-semibold text-slate-800">{it.productName || "Unnamed product"}</span>
                </div>
                <div className="text-slate-600 font-mono text-[11px]">
                  {isSales ? (
                    <span>
                      Stock: <strong>{it.availableStock}</strong> → After Sale:{" "}
                      <strong className={it.availableStock - it.quantity < 0 ? "text-rose-600" : "text-emerald-700"}>
                        {it.availableStock - it.quantity} {it.unit}
                      </strong>
                    </span>
                  ) : (
                    <span>
                      Current: <strong>{it.availableStock}</strong> → After Receipt:{" "}
                      <strong className="text-emerald-700">
                        {it.availableStock + it.quantity} {it.unit}
                      </strong>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={applyVat}
                onChange={(e) => setApplyVat(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>Apply Standard VAT 15.0% (আদর্শ মূসক ১৫% প্রযোজ্য)</span>
            </label>
            <p className="text-[11px] text-slate-400 ml-6 mt-0.5">
              Calculates 15% VAT for official Mushak 6.3 Tax Invoice reconciliation.
            </p>
          </div>
        </div>

        {/* Right: Financial Totals Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/80">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Order Financial Summary</span>
              <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
                {orderNo}
              </span>
            </div>

            <div className="space-y-3 pt-4 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Items Subtotal ({items.length} Lines)</span>
                <span className="font-mono font-semibold">
                  ৳{subtotal.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {applyVat && (
                <div className="flex justify-between text-amber-300">
                  <span>VAT Amount (15%)</span>
                  <span className="font-mono font-semibold">
                    ৳{vatAmount.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-slate-300">
                <span>Total Quantity Ordered</span>
                <span className="font-mono font-semibold">{totalQuantity} Units</span>
              </div>

              {paymentStatus === "PARTIAL" && (
                <div className="border-t border-slate-700/80 pt-2.5 space-y-1.5 text-xs">
                  <div className="flex justify-between text-emerald-300">
                    <span>Paid Amount (পরিশোধিত)</span>
                    <span className="font-mono font-semibold">
                      ৳{Number(paidAmount || 0).toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-rose-300 font-bold">
                    <span>Remaining Due (বকেয়া)</span>
                    <span className="font-mono">
                      ৳{Math.max(0, grandTotal - Number(paidAmount || 0)).toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700 space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block font-medium">Grand Total</span>
                <span className="text-[11px] text-slate-400">সর্বমোট প্রদেয় / আদায়যোগ্য টাকা</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
                ৳{grandTotal.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl py-2.5 text-xs font-semibold transition cursor-pointer text-center"
              >
                Back to List
              </button>
              <button
                type="button"
                onClick={handleSaveOrder}
                disabled={saving || (isSales && stockErrors.length > 0)}
                className={`flex-1 rounded-xl py-2.5 text-xs font-bold text-white transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer ${
                  isSales
                    ? "bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500"
                    : "bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500"
                }`}
              >
                <Save size={15} />
                {saving ? "Saving..." : "Confirm & Save Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
