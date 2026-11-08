"use client";

import { useState, useMemo, useEffect } from "react";
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileText,
  DollarSign,
  Package,
  Layers,
  ArrowLeft,
  Save,
  ShieldCheck,
  Truck,
  CreditCard,
  Building2,
  Calendar,
  Search,
  Plus,
  RefreshCw,
} from "lucide-react";

interface SalesReturnBuilderProps {
  onBack: () => void;
  onSuccess: () => void;
  initialData?: Record<string, any> | null;
  salesOrders?: any[];
  products?: any[];
  customers?: any[];
}

export default function SalesReturnBuilder({
  onBack,
  onSuccess,
  initialData,
  salesOrders = [],
  products = [],
  customers = [],
}: SalesReturnBuilderProps) {
  const [returnNo] = useState(
    initialData?.returnNo || `SR-${Date.now().toString().slice(-6)}`
  );

  // Selected Sales Order
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    initialData?.salesOrderId || ""
  );

  // Customer details
  const [customerId, setCustomerId] = useState<string>(initialData?.customerId || "");
  const [customerName, setCustomerName] = useState<string>(initialData?.customerName || "");
  const [invoiceNo, setInvoiceNo] = useState<string>(initialData?.invoiceNo || "");

  // Product selection from order
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialData?.productId || ""
  );
  const [batchNo, setBatchNo] = useState<string>(initialData?.batchNo || "BATCH-26-01");

  // Quantities & Pricing
  const [soldQty, setSoldQty] = useState<number>(Number(initialData?.soldQty || 1));
  const [returnQty, setReturnQty] = useState<number>(Number(initialData?.quantity || 1));
  const [unitPrice, setUnitPrice] = useState<number>(Number(initialData?.unitPrice || 0));

  // Reason & Condition (Default to Resellable / Available Stock)
  const [reason, setReason] = useState<string>(
    initialData?.reason || "Wrong Quantity Difference"
  );
  const [condition, setCondition] = useState<string>(
    initialData?.condition || "SALEABLE"
  );
  const [disposition, setDisposition] = useState<string>(
    initialData?.disposition || "AVAILABLE_STOCK"
  );

  // Resolution & Financials
  const [resolutionType, setResolutionType] = useState<string>(
    initialData?.resolutionType || "REFUND"
  );
  const [refundMethod, setRefundMethod] = useState<string>(
    initialData?.refundMethod || "CASH"
  );

  // QC & Approval (Default to Approved & QC Passed for instant processing)
  const [status, setStatus] = useState<string>(initialData?.status || "APPROVED");
  const [qcStatus, setQcStatus] = useState<string>(initialData?.qcStatus || "PASSED");
  const [qcNotes, setQcNotes] = useState<string>(initialData?.qcNotes || "");

  // Courier Return Details
  const [courierConsignment, setCourierConsignment] = useState<string>(
    initialData?.courierConsignment || ""
  );
  const [courierCharge, setCourierCharge] = useState<number>(
    Number(initialData?.courierCharge || 0)
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Matched sales order record
  const selectedOrder = useMemo(() => {
    return salesOrders.find((so) => so.id === selectedOrderId || so.orderNo === selectedOrderId);
  }, [salesOrders, selectedOrderId]);

  // Order items parsed
  const orderItems = useMemo(() => {
    if (!selectedOrder) return [];
    if (selectedOrder.items) {
      try {
        const parsed =
          typeof selectedOrder.items === "string"
            ? JSON.parse(selectedOrder.items)
            : selectedOrder.items;
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((it: any) => ({
            productId: it.productId,
            name: it.productName || it.name || "Product",
            sku: it.sku || "—",
            quantity: Number(it.quantity || 1),
            unitPrice: Number(it.unitPrice || 0),
            unit: it.unit || "pcs",
          }));
        }
      } catch {}
    }

    if (selectedOrder.productId) {
      const p = products.find((pr) => pr.id === selectedOrder.productId);
      return [
        {
          productId: selectedOrder.productId,
          name: p?.name || "Product",
          sku: p?.sku || "—",
          quantity: Number(selectedOrder.quantity || 1),
          unitPrice: Number(selectedOrder.unitPrice || 0),
          unit: p?.unit || "pcs",
        },
      ];
    }
    return [];
  }, [selectedOrder, products]);

  // Handle Sales Order Selection Change
  function handleOrderSelect(orderId: string) {
    setSelectedOrderId(orderId);
    setError("");

    const order = salesOrders.find((so) => so.id === orderId);
    if (!order) return;

    // Auto-fill customer
    const c = customers.find((cust) => cust.id === order.customerId);
    setCustomerId(order.customerId || "");
    setCustomerName(c?.name || order.customerName || "Customer");
    setInvoiceNo(order.orderNo?.replace("SO-", "INV-") || `INV-${order.id?.slice(-6)}`);

    // Extract items
    let items: any[] = [];
    if (order.items) {
      try {
        items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
      } catch {}
    }

    if (Array.isArray(items) && items.length > 0) {
      const first = items[0];
      setSelectedProductId(first.productId || "");
      setSoldQty(Number(first.quantity || 1));
      setReturnQty(Math.min(1, Number(first.quantity || 1)));
      setUnitPrice(Number(first.unitPrice || 0));
    } else if (order.productId) {
      setSelectedProductId(order.productId);
      setSoldQty(Number(order.quantity || 1));
      setReturnQty(Math.min(1, Number(order.quantity || 1)));
      setUnitPrice(Number(order.unitPrice || 0));
    }
  }

  // Handle Item selection from within order
  function handleItemSelect(item: any) {
    setSelectedProductId(item.productId);
    setSoldQty(Number(item.quantity || 1));
    setReturnQty(Math.min(returnQty || 1, Number(item.quantity || 1)));
    setUnitPrice(Number(item.unitPrice || 0));
  }

  // Two-way synchronization between condition and disposition
  function handleConditionChange(newCond: string) {
    setCondition(newCond);
    if (newCond === "SALEABLE") {
      setDisposition("AVAILABLE_STOCK");
      setQcStatus("PASSED");
    } else if (newCond === "EXPIRED") {
      setDisposition("EXPIRED_QUARANTINE");
    } else {
      setDisposition("DAMAGED_SCRAP");
    }
  }

  function handleDispositionChange(newDisp: string) {
    setDisposition(newDisp);
    if (newDisp === "AVAILABLE_STOCK" || newDisp === "RESTOCK" || newDisp === "SALEABLE") {
      setCondition("SALEABLE");
      setQcStatus("PASSED");
    } else if (newDisp === "EXPIRED_QUARANTINE") {
      setCondition("EXPIRED");
    } else if (newDisp === "DAMAGED_SCRAP") {
      if (condition === "SALEABLE") setCondition("DAMAGED");
    }
  }

  // Calculations
  const calculatedRefund = useMemo(() => {
    return Number((returnQty * unitPrice).toFixed(2));
  }, [returnQty, unitPrice]);

  const vatAdjustment = useMemo(() => {
    return Number((calculatedRefund * 0.15).toFixed(2));
  }, [calculatedRefund]);

  const netCreditTotal = useMemo(() => {
    return Number((calculatedRefund + vatAdjustment).toFixed(2));
  }, [calculatedRefund, vatAdjustment]);

  // Validation
  const quantityError = useMemo(() => {
    if (returnQty <= 0) return "ফেরত পণ্যের পরিমাণ অন্তত ১ হতে হবে।";
    if (returnQty > soldQty) {
      return `ফেরত পরিমাণ (${returnQty}) বিক্রিত পরিমাণের (${soldQty}) চেয়ে বেশি হতে পারে না!`;
    }
    return "";
  }, [returnQty, soldQty]);

  // Save Return Record
  async function handleSaveReturn() {
    if (!selectedOrderId) {
      setError("দয়া করে মূল বিক্রয় আদেশ (Original Sales Order / Invoice) নির্বাচন করুন।");
      return;
    }
    if (!selectedProductId) {
      setError("দয়া করে বিক্রয় আদেশ হতে ফেরতযোগ্য পণ্য নির্বাচন করুন।");
      return;
    }
    if (quantityError) {
      setError(quantityError);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload: Record<string, any> = {
        returnNo,
        salesOrderId: selectedOrderId,
        invoiceNo,
        customerId,
        customerName,
        productId: selectedProductId,
        batchNo,
        soldQty,
        quantity: returnQty,
        unitPrice,
        refundAmount: calculatedRefund,
        reason,
        condition,
        disposition,
        resolutionType,
        refundMethod,
        status,
        qcStatus,
        qcNotes,
        vatAdjustment,
        courierConsignment,
        courierCharge,
      };

      if (status === "APPROVED") {
        payload.approvedBy = "Manager (Current User)";
        payload.approvedAt = new Date().toISOString();
      }

      if (qcStatus !== "PENDING") {
        payload.inspectedBy = "QC Inspector";
        payload.inspectionDate = new Date().toISOString();
      }

      const url = initialData?.id ? `/api/returns/${initialData.id}` : "/api/returns";
      const method = initialData?.id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save sales return");

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save return record");
    } finally {
      setSaving(false);
    }
  }

  const matchedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Food ERP Sales Return Workflow
              </span>
              <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                {returnNo}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              {initialData ? "Edit / Review Sales Return" : "New Customer Sales Return (বিক্রয় ফেরত)"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Original Invoice verification, Food Safety QC, inventory quarantine, and financial settlement.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveReturn}
            disabled={saving || !!quantityError}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-xs transition cursor-pointer ${
              saving || !!quantityError
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
            }`}
          >
            {saving ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>সংরক্ষণ হচ্ছে...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>রিটার্ন আবেদন সংরক্ষণ করুন</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Main Grid Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Input controls */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Select Original Sales Order / Invoice */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <FileText size={18} className="text-blue-600" />
              <h2 className="font-bold text-sm text-slate-900">
                ১. মূল বিক্রয় চালান নির্বাচন (Original Sales Invoice Linkage)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Select Sales Order / Invoice (বিক্রয় চালান নির্বাচন করুন) *
                </label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => handleOrderSelect(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="">-- বিক্রয় চালান বা অর্ডার নং পছন্দ করুন --</option>
                  {salesOrders.map((so) => {
                    const cust = customers.find((c) => c.id === so.customerId);
                    return (
                      <option key={so.id} value={so.id}>
                        {so.orderNo} • {cust?.name || so.customerName || "Customer"} (৳
                        {Number(so.total || 0).toLocaleString()} • {so.status})
                      </option>
                    );
                  })}
                </select>
                <p className="text-[11px] text-slate-400">
                  বাধ্যতামূলক নিয়ম: পূর্বের ভ্যালিড বিক্রয় চালান ব্যতীত সিস্টেমে কোনো রিটার্ন গ্রহণ করা যাবে না।
                </p>
              </div>

              {selectedOrder && (
                <>
                  <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs space-y-1">
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                      ক্রেতার তথ্য (Customer Info)
                    </span>
                    <div className="font-bold text-slate-900">{customerName}</div>
                    <div className="text-slate-600 text-[11px]">Invoice: {invoiceNo}</div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      চালানের আর্থিক অবস্থা
                    </span>
                    <div className="font-bold text-slate-900">
                      মোট বিক্রয়: ৳{Number(selectedOrder.total || 0).toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      পেমেন্ট: {selectedOrder.paymentStatus} (পেইড: ৳
                      {Number(selectedOrder.paidAmount || 0).toLocaleString()})
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* If Order has multiple items, pick which item */}
            {orderItems.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  চালানের অন্তর্ভুক্ত পণ্য নির্বাচন করুন (Select Product to Return):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {orderItems.map((it, idx) => {
                    const isSelected = selectedProductId === it.productId;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleItemSelect(it)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                          isSelected
                            ? "bg-rose-50/80 border-rose-400 text-rose-950 font-semibold shadow-xs ring-1 ring-rose-300"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div>
                          <div className="font-bold">{it.name}</div>
                          <div className="text-[10px] text-slate-500">
                            Sold: {it.quantity} {it.unit} @ ৳{it.unitPrice}
                          </div>
                        </div>
                        <span className="text-[11px] font-mono font-bold">
                          ৳{(it.quantity * it.unitPrice).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Return Quantity, Batch & Pricing */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Package size={18} className="text-amber-600" />
              <h2 className="font-bold text-sm text-slate-900">
                ২. ফেরত পণ্যের পরিমাণ ও ব্যাচ নম্বর (Quantity & Batch Tracking)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  বিক্রিত পরিমাণ (Sold Qty)
                </label>
                <input
                  type="number"
                  readOnly
                  value={soldQty}
                  className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-600"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 block">
                    ফেরত পরিমাণ (Return Qty) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setReturnQty(soldQty)}
                    className="text-[10px] text-rose-600 font-bold hover:underline"
                  >
                    সম্পূর্ণ ফেরত (100%)
                  </button>
                </div>
                <input
                  type="number"
                  min="0.1"
                  max={soldQty}
                  step="any"
                  value={returnQty}
                  onChange={(e) => setReturnQty(Number(e.target.value))}
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-mono font-bold focus:ring-2 ${
                    quantityError
                      ? "border-rose-400 bg-rose-50 text-rose-800 focus:ring-rose-400"
                      : "border-slate-300 bg-white text-slate-900 focus:ring-blue-500"
                  }`}
                />
                {quantityError && (
                  <span className="text-[10px] text-rose-600 font-semibold block">
                    {quantityError}
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  একক দর (Unit Price ৳)
                </label>
                <input
                  type="number"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block">
                  পণ্য ব্যাচ নম্বর (Batch Number Verification) *
                </label>
                <input
                  type="text"
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value)}
                  placeholder="যেমন: CH-001 বা BATCH-2026-OCT"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:bg-white"
                />
                <p className="text-[10.5px] text-slate-400">
                  চালানের ব্যাচ যাচাই: ফেরত আসা পণ্য আসল ব্যাচের কি না তা সুনিশ্চিত করুন।
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  হিসাবকৃত ফেরত মূল্য (Value)
                </label>
                <div className="h-9 flex items-center px-3 bg-slate-100 rounded-xl border border-slate-200 text-xs font-mono font-black text-rose-700">
                  ৳{calculatedRefund.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Food Safety & Return Reason */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShieldCheck size={18} className="text-emerald-600" />
              <h2 className="font-bold text-sm text-slate-900">
                ৩. ফেরত নেওয়ার কারণ ও ফুড সেফটি অবস্থা (Food Safety & Quality Inspection)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  ফেরতের কারণ (Return Reason) *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                >
                  <option value="Damaged Product">Damaged Product (প্যাকেট ছেঁড়া, বোতল ভাঙা বা লিক)</option>
                  <option value="Expired Product">Expired Product (মেয়াদোত্তীর্ণ পণ্য)</option>
                  <option value="Wrong Product Delivered">Wrong Product (ভুল পণ্য বা সাইজ সরবরাহ)</option>
                  <option value="Wrong Quantity Difference">Wrong Quantity (পরিমাণ কম-বেশি অমিল)</option>
                  <option value="Opened Package">Opened Package (প্যাকেট খোলা বা আংশিক ব্যবহৃত)</option>
                  <option value="Quality Complaint">Quality Complaint (স্বাদ, গন্ধ, রং বা মান সমস্যা)</option>
                  <option value="Courier Return / RTO">Courier Return / RTO (কুরিয়ার হতে পার্সেল ফেরত)</option>
                  <option value="Customer Cancellation">Customer Changed Mind (গ্রাহক অস্বীকৃতি)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  পণ্যের বর্তমান অবস্থা (Product Physical Condition) *
                </label>
                <select
                  value={condition}
                  onChange={(e) => handleConditionChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold"
                >
                  <option value="SALEABLE">SALEABLE (সিল করা ও অক্ষত - বিক্রয়যোগ্য স্টক)</option>
                  <option value="DAMAGED">DAMAGED (ভাঙা, লিক বা নষ্ট - স্ক্র্যাপ কোয়ারেন্টাইন)</option>
                  <option value="EXPIRED">EXPIRED (মেয়াদ শেষ - ধ্বংসের জন্য কোয়ারেন্টাইন)</option>
                  <option value="OPENED_PACKAGE">OPENED_PACKAGE (খোলা প্যাকেট - বিক্রির স্টকে যাবে না)</option>
                  <option value="WRONG_PRODUCT">WRONG_PRODUCT (ভুল পণ্য)</option>
                </select>
              </div>

              <div className="sm:col-span-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1 text-amber-900">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle size={14} className="text-amber-600" />
                  <span>ফুড সেফটি বিশেষ সতর্কবার্তা:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  সস বা মসলা জাতীয় খাদ্য পণ্যের ক্ষেত্রে প্যাকেট খোলা, বোতল লিক বা ব্যবহৃত পণ্য
                  <strong> কোনো অবস্থাতেই পুনরায় বিক্রয়যোগ্য (Available Stock)-এ নেওয়া যাবে না।</strong> এগুলো
                  সরাসরি Damaged/Scrap কোয়ারেন্টাইন ওয়্যারহাউসে নথিভুক্ত থাকবে।
                </p>
              </div>

              {/* Disposition selection */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block">
                  স্টক পোস্টিং গন্তব্য (Inventory Disposition Destination)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center gap-2 ${
                      disposition === "AVAILABLE_STOCK"
                        ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-xs ring-1 ring-emerald-300"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="disposition"
                      value="AVAILABLE_STOCK"
                      checked={disposition === "AVAILABLE_STOCK"}
                      onChange={(e) => handleDispositionChange(e.target.value)}
                      className="text-emerald-600"
                    />
                    <div>
                      <div>Available Stock</div>
                      <div className="text-[10px] font-normal opacity-80">পুনর্বিক্রয়যোগ্য স্টক</div>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center gap-2 ${
                      disposition === "DAMAGED_SCRAP"
                        ? "bg-rose-50 border-rose-400 text-rose-950 font-bold shadow-xs ring-1 ring-rose-300"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="disposition"
                      value="DAMAGED_SCRAP"
                      checked={disposition === "DAMAGED_SCRAP"}
                      onChange={(e) => handleDispositionChange(e.target.value)}
                      className="text-rose-600"
                    />
                    <div>
                      <div>Damaged Scrap</div>
                      <div className="text-[10px] font-normal opacity-80">নষ্ট কোয়ারেন্টাইন</div>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center gap-2 ${
                      disposition === "EXPIRED_QUARANTINE"
                        ? "bg-purple-50 border-purple-400 text-purple-950 font-bold shadow-xs ring-1 ring-purple-300"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="disposition"
                      value="EXPIRED_QUARANTINE"
                      checked={disposition === "EXPIRED_QUARANTINE"}
                      onChange={(e) => handleDispositionChange(e.target.value)}
                      className="text-purple-600"
                    />
                    <div>
                      <div>Expired Quarantine</div>
                      <div className="text-[10px] font-normal opacity-80">মেয়াদোত্তীর্ণ অপসরণ</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Settlement / Resolution Type */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <DollarSign size={18} className="text-blue-600" />
              <h2 className="font-bold text-sm text-slate-900">
                ৪. আর্থিক নিষ্পত্তি পদ্ধতি (Settlement Resolution Type)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                className={`p-4 rounded-xl border text-xs cursor-pointer transition space-y-1 ${
                  resolutionType === "REFUND"
                    ? "bg-rose-50 border-rose-400 text-rose-950 font-bold shadow-xs ring-1 ring-rose-300"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="resType"
                    value="REFUND"
                    checked={resolutionType === "REFUND"}
                    onChange={(e) => setResolutionType(e.target.value)}
                    className="text-rose-600"
                  />
                  <span>💵 Cash/Bank Refund</span>
                </div>
                <p className="text-[10.5px] font-normal text-slate-500 pl-5">
                  টাকা নগদ বা ব্যাংকের মাধ্যমে কাস্টমারকে ফেরত দেওয়া হবে।
                </p>
              </label>

              <label
                className={`p-4 rounded-xl border text-xs cursor-pointer transition space-y-1 ${
                  resolutionType === "CREDIT_BALANCE"
                    ? "bg-blue-50 border-blue-400 text-blue-950 font-bold shadow-xs ring-1 ring-blue-300"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="resType"
                    value="CREDIT_BALANCE"
                    checked={resolutionType === "CREDIT_BALANCE"}
                    onChange={(e) => setResolutionType(e.target.value)}
                    className="text-blue-600"
                  />
                  <span>💳 Customer Credit Balance</span>
                </div>
                <p className="text-[10.5px] font-normal text-slate-500 pl-5">
                  টাকা ফেরত না নিয়ে পরবর্তী অর্ডারে সমন্বয়ের জন্য ওয়ালেটে ক্রেডিট রাখা হবে।
                </p>
              </label>

              <label
                className={`p-4 rounded-xl border text-xs cursor-pointer transition space-y-1 ${
                  resolutionType === "REPLACEMENT"
                    ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-xs ring-1 ring-emerald-300"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="resType"
                    value="REPLACEMENT"
                    checked={resolutionType === "REPLACEMENT"}
                    onChange={(e) => setResolutionType(e.target.value)}
                    className="text-emerald-600"
                  />
                  <span>📦 Replacement Order</span>
                </div>
                <p className="text-[10.5px] font-normal text-slate-500 pl-5">
                  টাকা নয়, সমপরিমাণ নতুন পণ্য প্রতিস্থাপন হিসেবে ডেলিভারি দেওয়া হবে।
                </p>
              </label>
            </div>

            {resolutionType === "REFUND" && (
              <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    রিফান্ড পরিশোধের মাধ্যম (Refund Payment Method)
                  </label>
                  <select
                    value={refundMethod}
                    onChange={(e) => setRefundMethod(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                  >
                    <option value="CASH">Cash Settlement (নগদ ক্যাশ)</option>
                    <option value="BANK_TRANSFER">Bank Transfer (ব্যাংক ট্রান্সফার)</option>
                    <option value="BKASH">bKash Merchant</option>
                    <option value="NAGAD">Nagad</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Cols: Summary, Approval & Courier info */}
        <div className="lg:col-span-4 space-y-6">
          {/* Financial Impact Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Financial Impact (আর্থিক প্রভাব)
              </span>
              <span className="text-xs font-mono text-rose-400 font-bold">
                {resolutionType}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>ফেরত পণ্য মূল্য ({returnQty} Units):</span>
                <span className="font-mono font-semibold">
                  ৳{calculatedRefund.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>মূসক ক্রেডিট নোট (১৫% ভ্যাট সমন্বয়):</span>
                <span className="font-mono font-semibold text-emerald-400">
                  ৳{vatAdjustment.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-700 flex justify-between font-bold text-sm">
                <span>মোট নিষ্পত্তি মূল্য:</span>
                <span className="font-mono text-rose-300 text-base">
                  ৳{netCreditTotal.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-[11px] text-slate-300 space-y-1 mt-3">
                <div className="font-semibold text-white">Accounts Effect:</div>
                {resolutionType === "REFUND" && (
                  <p>• AccountTransaction: OUTGOING (৳{calculatedRefund})</p>
                )}
                {resolutionType === "CREDIT_BALANCE" && (
                  <p>• Customer Credit Ledger: +৳{calculatedRefund} Wallet Credit</p>
                )}
                {resolutionType === "REPLACEMENT" && (
                  <p>• Auto-generate replacement Sales Order @ ৳0 charge</p>
                )}
                <p>• Mushak 6.7 Credit Note: ৳{vatAdjustment} VAT Adjustment</p>
              </div>
            </div>
          </div>

          {/* QC Inspection & Workflow Status Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShieldCheck size={18} className="text-blue-600" />
              <h2 className="font-bold text-sm text-slate-900">
                অনুমোদন ও ওয়ার্কফ্লো নিয়ন্ত্রণ (Approval Gate)
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  QC Inspection Status (ল্যাব / কিউসি মানদণ্ড)
                </label>
                <select
                  value={qcStatus}
                  onChange={(e) => setQcStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  <option value="PENDING">PENDING (পরীক্ষা অপেক্ষমাণ)</option>
                  <option value="PASSED">PASSED (মানসম্মত / বিক্রয়যোগ্য অনুমোদন)</option>
                  <option value="FAILED">FAILED (মানহীন / ড্যামেজ নিশ্চিত)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Workflow Approval Status (অনুমোদনের পর্যায়) *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-bold ${
                    status === "APPROVED"
                      ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                      : "bg-slate-50 border-slate-300 text-slate-800"
                  }`}
                >
                  <option value="PENDING">PENDING (প্রাথমিক আবেদন)</option>
                  <option value="INSPECTED">INSPECTED (পরীক্ষিত)</option>
                  <option value="APPROVED">APPROVED (অনুমোদিত - স্টক ও একাউন্টসে পোস্টিং)</option>
                  <option value="REJECTED">REJECTED (বাতিলকৃত)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  QC & Inspection Notes (মন্তব্য)
                </label>
                <textarea
                  rows={2}
                  value={qcNotes}
                  onChange={(e) => setQcNotes(e.target.value)}
                  placeholder="পণ্যের ত্রুটি, ক্যাপ সিল বা বোতলের অবস্থা..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[10.5px] text-rose-800 space-y-1">
                <strong>কঠোর নীতি:</strong>
                <p>
                  স্ট্যাটাস <strong>&quot;APPROVED&quot;</strong> না করা পর্যন্ত কোনো ইনভেন্টরি বাড়বে না এবং
                  কোনো রিফান্ড বা ক্রেডিট সমন্বয় হবে না।
                </p>
              </div>
            </div>
          </div>

          {/* Courier Details (Optional) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Truck size={18} className="text-slate-600" />
              <h2 className="font-bold text-sm text-slate-900">
                কুরিয়ার ট্র্যাকিং (Courier RTO Tracking)
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Consignment / Tracking ID</label>
                <input
                  type="text"
                  value={courierConsignment}
                  onChange={(e) => setCourierConsignment(e.target.value)}
                  placeholder="যেমন: STEADFAST-987123"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">রিটার্ন কুরিয়ার চার্জ (৳)</label>
                <input
                  type="number"
                  value={courierCharge}
                  onChange={(e) => setCourierCharge(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
