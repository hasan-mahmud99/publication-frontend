"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Truck,
  CreditCard,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  BadgePercent,
  Clock,
  Layers,
} from "lucide-react";

interface OrderStatusPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Record<string, any> | null;
  resource: "sales-orders" | "purchase-orders";
  partyName?: string;
  onUpdated: () => void;
}

export default function OrderStatusPaymentModal({
  isOpen,
  onClose,
  order,
  resource,
  partyName,
  onUpdated,
}: OrderStatusPaymentModalProps) {
  const isSales = resource === "sales-orders";

  // Allowed chronological transitions
  const allowedTransitions = useMemo(() => {
    if (!order) return [];
    const currentStatus = String(order.status || "DRAFT").toUpperCase();

    if (isSales) {
      const transitions: Record<string, { value: string; label: string; desc: string }[]> = {
        DRAFT: [
          { value: "CONFIRMED", label: "CONFIRMED (অর্ডার নিশ্চিতকরণ)", desc: "Confirm order and verify inventory reservation" },
          { value: "CANCELLED", label: "CANCELLED (অর্ডার বাতিল)", desc: "Cancel draft order" },
        ],
        CONFIRMED: [
          { value: "PROCESSING", label: "PROCESSING (প্রক্রিয়াধীন ও প্যাকেজিং)", desc: "Send order to packing and dispatch warehouse" },
          { value: "CANCELLED", label: "CANCELLED (অর্ডার বাতিল)", desc: "Cancel order before processing" },
        ],
        PROCESSING: [
          { value: "DISPATCHED", label: "DISPATCHED (ডেলিভারির জন্য প্রেরিত)", desc: "Dispatched via covered van or courier provider" },
        ],
        DISPATCHED: [
          { value: "DELIVERED", label: "DELIVERED (গ্রাহকের কাছে সরবরাহ সম্পন্ন)", desc: "Customer received products and signed invoice" },
        ],
        DELIVERED: [],
        CANCELLED: [],
      };
      return transitions[currentStatus] || [];
    } else {
      const transitions: Record<string, { value: string; label: string; desc: string }[]> = {
        DRAFT: [
          { value: "PENDING_APPROVAL", label: "PENDING_APPROVAL (অনুমোদনের অপেক্ষায়)", desc: "Submit PO for factory manager signoff" },
          { value: "CANCELLED", label: "CANCELLED (বাতিল)", desc: "Cancel requisition" },
        ],
        PENDING_APPROVAL: [
          { value: "APPROVED", label: "APPROVED (অনুমোদিত)", desc: "PO approved; sent to supplier for dispatch" },
          { value: "CANCELLED", label: "CANCELLED (বাতিল)", desc: "Reject / cancel purchase request" },
        ],
        APPROVED: [
          { value: "RECEIVED", label: "RECEIVED (মালামাল গৃহীত ও স্টকে জমা)", desc: "Quality check passed, stock credited to inventory" },
        ],
        RECEIVED: [
          { value: "COMPLETED", label: "COMPLETED (সম্পূর্ণ সম্পন্ন)", desc: "Order fulfilled and finalized" },
        ],
        COMPLETED: [],
        CANCELLED: [],
      };
      return transitions[currentStatus] || [];
    }
  }, [order, isSales]);

  // Form State
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<string>("UNPAID");
  const [newPaymentAmount, setNewPaymentAmount] = useState<number>(0);
  const [vatPaid, setVatPaid] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const totalAmount = Number(order?.total || 0);
  const currentPaid = Number(order?.paidAmount || (order?.paymentStatus === "PAID" ? totalAmount : 0));
  const currentDue = Number(order?.dueAmount || Math.max(0, totalAmount - currentPaid));

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status || (isSales ? "CONFIRMED" : "APPROVED"));
      setPaymentStatus(order.paymentStatus || "UNPAID");
      setNewPaymentAmount(0);
      setVatPaid(Boolean(order.vatPaid));
      setNotes("");
      setError("");
    }
  }, [order, isSales]);

  // Calculated updated numbers
  const calculatedTotalPaid = useMemo(() => {
    if (paymentStatus === "PAID") return totalAmount;
    if (paymentStatus === "UNPAID") return 0;
    return Math.min(totalAmount, Number((currentPaid + newPaymentAmount).toFixed(2)));
  }, [paymentStatus, totalAmount, currentPaid, newPaymentAmount]);

  const calculatedBalanceDue = useMemo(() => {
    return Math.max(0, Number((totalAmount - calculatedTotalPaid).toFixed(2)));
  }, [totalAmount, calculatedTotalPaid]);

  const deltaLedgerImpact = useMemo(() => {
    if (paymentStatus === "PAID") {
      return Math.max(0, Number((totalAmount - currentPaid).toFixed(2)));
    }
    if (paymentStatus === "PARTIAL") {
      return Math.max(0, Number(newPaymentAmount.toFixed(2)));
    }
    return 0;
  }, [paymentStatus, totalAmount, currentPaid, newPaymentAmount]);

  if (!isOpen || !order) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!order) return;

    if (paymentStatus === "PARTIAL" && newPaymentAmount <= 0 && currentPaid <= 0) {
      setError("Please enter the payment amount received/paid for partial payment.");
      return;
    }

    if (calculatedTotalPaid > totalAmount) {
      setError(`Paid amount cannot exceed total order bill (৳${totalAmount.toLocaleString()}).`);
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, any> = {
        status: selectedStatus,
        paymentStatus,
        paidAmount: calculatedTotalPaid,
        dueAmount: calculatedBalanceDue,
      };

      if (isSales) {
        payload.vatPaid = vatPaid;
      }

      if (notes.trim()) {
        payload.notes = order?.notes ? `${order.notes}\n[${new Date().toLocaleDateString("en-GB")}]: ${notes.trim()}` : notes.trim();
      }

      const res = await fetch(`/api/${resource}/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update order status");

      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update order");
    } finally {
      setSubmitting(false);
    }
  }

  const currentStatus = String(order.status || "").toUpperCase();
  const isTerminal = ["DELIVERED", "COMPLETED", "CANCELLED"].includes(currentStatus);

  return (
    <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-2xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Truck size={17} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Update Order Status & Payment (স্ট্যাটাস ও পেমেন্ট আপডেট)
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Order #{order.orderNo} • {partyName || (isSales ? "Customer" : "Supplier")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X size={17} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle size={15} className="text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Order Summary Card */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/90 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Amount</span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                ৳{totalAmount.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Paid</span>
              <span className="font-bold text-emerald-700 font-mono text-sm">
                ৳{currentPaid.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Due</span>
              <span className="font-bold text-rose-600 font-mono text-sm">
                ৳{currentDue.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Section 1: Chronological Order Status */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Clock size={13} className="text-blue-600" />
              <span>Fulfillment Status (ধারাবাহিক স্ট্যাটাস ক্রমানুসার)</span>
            </label>

            {isTerminal ? (
              <div className="p-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>
                  This order has reached final status: <strong>{currentStatus}</strong>. Core fulfillment completed.
                </span>
              </div>
            ) : allowedTransitions.length > 0 ? (
              <div className="space-y-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 cursor-pointer"
                >
                  <option value={currentStatus}>Current: {currentStatus} (অপরিবর্তিত রাখুন)</option>
                  {allowedTransitions.map((t) => (
                    <option key={t.value} value={t.value}>
                      ➜ Advance to: {t.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  Status can only advance chronologically in workflow order to maintain audit integrity.
                </p>
              </div>
            ) : (
              <div className="text-xs text-slate-500 font-medium">
                Current status: <strong>{currentStatus}</strong>
              </div>
            )}
          </div>

          {/* Section 2: Payment Status & Ledger Posting */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <label className="text-xs font-bold text-slate-700 block flex items-center gap-1.5">
              <CreditCard size={13} className="text-emerald-600" />
              <span>Payment Status & Money Ledger (পেমেন্ট ও লেজার কালেকশন)</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentStatus("UNPAID");
                  setNewPaymentAmount(0);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                  paymentStatus === "UNPAID"
                    ? "bg-rose-50 border-rose-300 text-rose-800 shadow-2xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                UNPAID (বকেয়া)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentStatus("PARTIAL");
                  if (newPaymentAmount === 0 && currentDue > 0) {
                    setNewPaymentAmount(Math.round(currentDue / 2));
                  }
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                  paymentStatus === "PARTIAL"
                    ? "bg-amber-50 border-amber-300 text-amber-800 shadow-2xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                PARTIAL (আংশিক)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentStatus("PAID");
                  setNewPaymentAmount(0);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                  paymentStatus === "PAID"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                PAID (পরিশোধিত)
              </button>
            </div>

            {/* If Partial Payment Selected: Show Input for new payment collected */}
            {paymentStatus === "PARTIAL" && (
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2 animate-in fade-in text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-amber-900">
                    Additional Payment {isSales ? "Received Now (এখন কত টাকা পেলেন?)" : "Paid Now (সরবরাহকারীকে প্রদান)"}
                  </span>
                  <span className="text-[11px] text-amber-700 font-mono">
                    Max: ৳{currentDue.toLocaleString()}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">৳</span>
                  <input
                    type="number"
                    step="any"
                    min={0}
                    max={currentDue}
                    value={newPaymentAmount}
                    onChange={(e) => setNewPaymentAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-amber-300 rounded-lg outline-none font-mono font-bold text-sm focus:border-amber-500"
                    placeholder="Enter collected amount"
                  />
                </div>
              </div>
            )}

            {/* Live Ledger Impact Preview */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Total Paid after update:</span>
                <span className="font-mono font-semibold text-emerald-700">
                  ৳{calculatedTotalPaid.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Remaining Due Balance:</span>
                <span
                  className={`font-mono font-semibold ${
                    calculatedBalanceDue > 0 ? "text-rose-600" : "text-emerald-700"
                  }`}
                >
                  ৳{calculatedBalanceDue.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {deltaLedgerImpact > 0 && (
                <div className="border-t border-slate-200 pt-1.5 mt-1 text-[11px] text-blue-700 font-semibold flex items-center gap-1">
                  <span>
                    ⚡ <strong>৳{deltaLedgerImpact.toLocaleString()}</strong> will be automatically credited to Account
                    Ledger ({isSales ? "INCOMING Sales Collection" : "OUTGOING Supplier Payment"}).
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: VAT Status (Sales Order) */}
          {isSales && (
            <div className="border-t border-slate-100 pt-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={vatPaid}
                  onChange={(e) => setVatPaid(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-800">
                  VAT Paid / অন্তর্ভুক্ত (১৫% মূসক চালানে পরিশোধিত চিহ্নিত করুন)
                </span>
              </label>
            </div>
          )}

          {/* Section 4: Optional Audit Notes */}
          <div className="border-t border-slate-100 pt-3">
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Status Change Note / Audit Memo (ঐচ্ছিক মন্তব্য)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Received via bKash TrxID #892819..."
              className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <CheckCircle2 size={14} />
              {submitting ? "Saving Updates..." : "Save Status & Update Ledger (সংরক্ষণ করুন)"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
