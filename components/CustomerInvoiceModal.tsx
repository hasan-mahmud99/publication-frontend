"use client";

import { useMemo, useRef } from "react";
import {
  Printer,
  X,
  FileText,
  Building2,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  CreditCard,
  Package,
} from "lucide-react";

interface CustomerInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Record<string, any> | null;
  customer?: Record<string, any> | null;
  supplier?: Record<string, any> | null;
  products?: { id: string; name: string; sku: string; unit?: string }[];
  type?: "sales" | "purchase";
}

export default function CustomerInvoiceModal({
  isOpen,
  onClose,
  order,
  customer,
  supplier,
  products = [],
  type,
}: CustomerInvoiceModalProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const isPurchase = Boolean(type === "purchase" || order?.supplierId || order?.orderNo?.startsWith("PO-"));

  const formattedDate = useMemo(() => {
    const raw = order?.orderDate || order?.createdAt || new Date();
    try {
      return new Date(raw).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "07 Nov 2026";
    }
  }, [order]);

  const invoiceNo = useMemo(() => {
    if (!order) return "INV-000000";
    if (isPurchase) {
      return order.orderNo?.replace("PO-", "PBILL-") || `PBILL-${order.id?.slice(-6)}`;
    }
    return order.orderNo?.replace("SO-", "INV-") || `INV-${order.id?.slice(-6)}`;
  }, [order, isPurchase]);

  // Parse multi-item or single-item products
  const parsedItems = useMemo(() => {
    if (!order) return [];
    if (order.items) {
      try {
        const parsed = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((it: any) => ({
            name: it.productName || it.name || "Food Product",
            sku: it.sku || "—",
            unit: it.unit || "pcs",
            quantity: Number(it.quantity || 1),
            unitPrice: Number(it.unitPrice || 0),
            total: Number(it.total || 0),
          }));
        }
      } catch {}
    }

    // Fallback single item
    const matchedProd = products.find((p) => p.id === order.productId);
    const qty = Number(order.quantity || 1);
    const price = Number(order.unitPrice || 0);
    return [
      {
        name: matchedProd?.name || order.productName || "Food Product Item",
        sku: matchedProd?.sku || order.sku || "—",
        unit: matchedProd?.unit || "bottle",
        quantity: qty,
        unitPrice: price,
        total: Number(order.total || qty * price),
      },
    ];
  }, [order, products]);

  // Financial calculations
  const itemsSubtotal = useMemo(() => {
    return parsedItems.reduce((sum, it) => sum + Number(it.total || 0), 0);
  }, [parsedItems]);

  const vatAmount = Number(order?.vatAmount || (itemsSubtotal * 0.15).toFixed(2));
  const isVatPaid = Boolean(order?.vatPaid);
  const grandTotal = Number(order?.total || itemsSubtotal + vatAmount);

  const paymentStatus = String(order?.paymentStatus || "UNPAID").toUpperCase();
  const totalPaid = useMemo(() => {
    if (paymentStatus === "PAID") return grandTotal;
    if (paymentStatus === "UNPAID") return 0;
    return Number(order?.paidAmount || 0);
  }, [paymentStatus, grandTotal, order?.paidAmount]);

  const balanceDue = useMemo(() => {
    if (paymentStatus === "PAID") return 0;
    if (paymentStatus === "UNPAID") return grandTotal;
    return Math.max(0, Number((grandTotal - totalPaid).toFixed(2)));
  }, [paymentStatus, grandTotal, totalPaid]);

  if (!isOpen || !order) return null;

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-2xs overflow-y-auto print:static print:inset-auto print:bg-white print:p-0 print:block print:overflow-visible printable-modal-overlay">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[96vh] flex flex-col overflow-hidden border border-slate-300 print:max-w-none print:max-h-none print:shadow-none print:border-none print:w-full print:block print:overflow-visible print:rounded-none printable-modal-box">
        {/* Modal Controls Header (Hidden in print) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Receipt size={18} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-sm">
                {isPurchase
                  ? "Purchase Order Invoice / Supplier Bill (ক্রয় চালান ও বিল ভাউচার)"
                  : "Customer Sales Invoice (গ্রাহক বিক্রয় চালান ও ইনভয়েস)"}
              </div>
              <div className="text-[11px] text-slate-400">
                {isPurchase
                  ? "Official Purchase Order Bill Voucher with Itemized Breakdown & Ledger Records"
                  : "Official Commercial Invoice with Live VAT & Payment Status Breakdown"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <Printer size={15} /> প্রিন্ট ইনভয়েস / PDF সেভ করুন
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div
          ref={invoiceRef}
          id="customer-invoice-printable-area"
          className="p-8 sm:p-12 overflow-y-auto flex-1 bg-white text-slate-900 font-sans print:p-0 print:overflow-visible print:m-0 print:block"
        >
          <div className="max-w-[820px] mx-auto border border-slate-200 p-8 rounded-xl shadow-xs print:border-0 print:p-0 print:shadow-none print:max-w-none">
            {/* Top Company Header & Brand Banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 pb-6 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                    FE
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase">
                    Food Manufacturing Industries Ltd.
                  </h1>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Leading Food Processing & Packaging Solution • Dhaka, Bangladesh
                </p>
                <div className="text-[11px] text-slate-600 space-y-0.5 mt-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-slate-400" />
                    <span>Plot 12, Tejgaon Industrial Area, Dhaka-1208, Bangladesh</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone size={12} className="text-slate-400" />
                    <span>+880 2-9887766 • BIN: 000-1234567-0101</span>
                  </div>
                </div>
              </div>

              <div className="sm:text-right shrink-0">
                <div className="inline-block px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-black tracking-wider uppercase mb-2">
                  {isPurchase ? "Purchase Order / Bill" : "Commercial Invoice"}
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  {isPurchase ? "Bill / PO Number" : "Invoice Number"}
                </div>
                <div className="text-sm font-black text-blue-700 font-mono tracking-wide">{invoiceNo}</div>
                <div className="text-[11.5px] text-slate-600 mt-1 flex sm:justify-end items-center gap-1">
                  <Calendar size={12} className="text-slate-400" />
                  <span>Date: {formattedDate}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Order Ref: <span className="font-bold text-slate-700">{order.orderNo}</span>
                </div>
              </div>
            </div>

            {/* Bill To / Party Information Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80 mb-6 text-xs">
              {isPurchase ? (
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                    Vendor / Supplier Details (সরবরাহকারীর বিবরণ)
                  </span>
                  <div className="font-bold text-sm text-slate-900">
                    {supplier?.name || order.supplierName || "Valued Supplier / Vendor"}
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    {supplier?.address || order.supplierAddress || "Bangladesh"}
                  </div>
                  {supplier?.phone && (
                    <div className="text-slate-600 mt-0.5 font-mono">
                      Phone: {supplier.phone}
                    </div>
                  )}
                  {supplier?.bin && (
                    <div className="text-slate-600 mt-0.5 font-mono">
                      BIN: {supplier.bin}
                    </div>
                  )}
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    Party Role: VENDOR / SUPPLIER
                  </div>
                </div>
              ) : (
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                    Bill To / Customer Details (ক্রেতার বিবরণ)
                  </span>
                  <div className="font-bold text-sm text-slate-900">
                    {customer?.name || order.customerName || "Valued Customer"}
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    {customer?.address || order.customerAddress || "Dhaka, Bangladesh"}
                  </div>
                  {customer?.phone && (
                    <div className="text-slate-600 mt-0.5 font-mono">
                      Phone: {customer.phone}
                    </div>
                  )}
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    Customer Type: {customer?.customerType || order.customerType || "RETAIL"}
                  </div>
                </div>
              )}

              <div className="sm:text-right flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                    Delivery & Fulfillment Status
                  </span>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-slate-200 text-slate-800">
                    <Package size={13} />
                    <span>{order.status || "CONFIRMED"}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                    Payment Status
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold ${
                      paymentStatus === "PAID"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : paymentStatus === "PARTIAL"
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-rose-100 text-rose-800 border border-rose-300"
                    }`}
                  >
                    {paymentStatus === "PAID" && "✓ PAID (পরিশোধিত)"}
                    {paymentStatus === "PARTIAL" && "⚠️ PARTIAL (আংশিক পরিশোধ)"}
                    {paymentStatus === "UNPAID" && "❌ UNPAID (বকেয়া)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="mb-6 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-800 bg-slate-100 text-[10.5px] font-bold text-slate-700 uppercase tracking-wider">
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 w-28 text-center">SKU</th>
                    <th className="py-2.5 px-3 w-24 text-center">Quantity</th>
                    <th className="py-2.5 px-3 w-28 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 w-32 text-right">Total (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {parsedItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {item.name}
                        <div className="text-[10px] text-slate-400 font-normal">Standard packaging</div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-600">{item.sku}</td>
                      <td className="py-3 px-3 text-center font-semibold text-slate-800">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        ৳{item.unitPrice.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        ৳{item.total.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary & Due Breakdown */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-slate-200 pt-4 mb-6">
              {/* Payment Instructions & VAT Status */}
              <div className="flex-1 space-y-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                    <CreditCard size={13} className="text-blue-600" />
                    <span>Payment Methods & Settlement</span>
                  </div>
                  <div className="text-[11px] text-slate-600 leading-relaxed">
                    • Bank Transfer: Prime Bank (A/C: 104230009871, Tejgaon Branch)
                    <br />
                    • Mobile Banking: bKash / Nagad Merchant: 01712-345678
                    <br />• Cash Settlement / Cheque in favor of:{" "}
                    <strong>Food Manufacturing Industries Ltd.</strong>
                  </div>
                </div>

                {/* VAT Status Banner */}
                <div
                  className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                    isVatPaid
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-amber-50 border-amber-200 text-amber-800"
                  }`}
                >
                  {isVatPaid ? (
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                  )}
                  <div>
                    <span className="font-bold">
                      {isVatPaid ? "VAT Paid: YES (১৫% মূসক অন্তর্ভুক্ত ও পরিশোধিত)" : "VAT Status: PENDING / DUE"}
                    </span>
                    <div className="text-[10.5px] opacity-90">
                      {isVatPaid
                        ? "NBR Mushak 6.3 Tax Invoice generated and compliant with VAT Act 2012."
                        : "VAT amount is payable upon invoice finalization."}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Calculation Totals Box */}
              <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-xl border border-slate-200/90 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal (আইটেম মূল্য):</span>
                  <span className="font-mono font-medium">
                    ৳{itemsSubtotal.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>VAT (১৫% মূসক):</span>
                  <span className="font-mono font-medium">
                    ৳{vatAmount.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-2 text-sm">
                  <span>Total Amount (সর্বমোট বিল):</span>
                  <span className="font-mono text-blue-700">
                    ৳{grandTotal.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Paid vs Due Amount Breakdown */}
                <div className="border-t border-slate-200 pt-2 mt-2 space-y-1.5">
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Paid Amount (পরিশোধিত):</span>
                    <span className="font-mono">
                      ৳{totalPaid.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div
                    className={`flex justify-between font-bold text-sm p-2 rounded-lg ${
                      balanceDue > 0 ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    <span>Net Due (অবশিষ্ট বকেয়া):</span>
                    <span className="font-mono">
                      ৳{balanceDue.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Signatures */}
            <div className="border-t border-slate-200 pt-6 mt-6 print-keep-together">
              <div className="text-[10px] text-slate-400 space-y-0.5">
                <p>• Goods once sold can only be returned under official Return Authorization policy within 7 days.</p>
                <p>• This is a computer-generated tax invoice verified by the Antigravity Food ERP system.</p>
              </div>

              <div className="grid grid-cols-2 gap-8 mt-10 pt-2 text-xs text-center print-keep-together">
                <div>
                  <div className="border-t border-dashed border-slate-400 w-48 mx-auto mb-1"></div>
                  <span className="font-semibold text-slate-700">
                    {isPurchase ? "Supplier / Vendor Signature" : "Customer Receiver Signature"}
                  </span>
                  <div className="text-[10.5px] text-slate-400">
                    {isPurchase ? "সরবরাহকারীর স্বাক্ষর ও সিল" : "গ্রাহকের স্বাক্ষর ও সিল"}
                  </div>
                </div>
                <div>
                  <div className="border-t border-dashed border-slate-400 w-48 mx-auto mb-1"></div>
                  <span className="font-semibold text-slate-700">
                    {isPurchase ? "Receiving Officer Signature" : "Authorized Officer Signature"}
                  </span>
                  <div className="text-[10.5px] text-slate-400">
                    {isPurchase ? "পণ্য গ্রহণকারী কর্মকর্তার স্বাক্ষর ও সিল" : "কর্তৃপক্ষের স্বাক্ষর ও সিল"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
