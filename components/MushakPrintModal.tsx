"use client";

import { useMemo, useRef } from "react";
import { Printer, X, Download, ShieldCheck, FileText } from "lucide-react";

interface MushakPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  record?: Record<string, any> | null;
  registerRecords?: Record<string, any>[] | null;
  mode?: "invoice" | "register";
  title?: string;
  customer?: Record<string, any> | null;
  products?: { id: string; name: string; sku: string; unit?: string }[];
}

export default function MushakPrintModal({
  isOpen,
  onClose,
  record,
  registerRecords,
  mode = "invoice",
  title = "Mushak 6.3",
  customer,
  products = [],
}: MushakPrintModalProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const formattedDate = useMemo(() => {
    const raw = record?.transactionDate || record?.orderDate || record?.createdAt || new Date();
    try {
      return new Date(raw).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "07/11/2026";
    }
  }, [record]);

  const timeStr = useMemo(() => {
    return new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }, []);

  const vatRate = Number(record?.vatRate || 15);

  // Parse multi-item list from record.items or fallback to single item
  const parsedItems = useMemo(() => {
    if (!record) return [];

    if (record.items) {
      try {
        const parsed = typeof record.items === "string" ? JSON.parse(record.items) : record.items;
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((it: any) => {
            const qty = Number(it.quantity || 1);
            const unitPrice = Number(it.unitPrice || 0);
            const lineTotal = Number(it.total || qty * unitPrice);
            const lineVat = Number(((lineTotal * vatRate) / 100).toFixed(2));
            return {
              name: it.productName || it.name || "খাদ্য প্রক্রিয়াজাত পণ্য সামগ্রী",
              sku: it.sku || "—",
              unit: it.unit || "বোতল / প্যাকেট",
              quantity: qty,
              unitPrice: unitPrice,
              total: lineTotal,
              vatAmount: lineVat,
              grandTotal: Number((lineTotal + lineVat).toFixed(2)),
            };
          });
        }
      } catch {}
    }

    // Fallback single item
    const matchedProd = products.find((p) => p.id === record.productId);
    const singleQty = Number(record.quantity || 1);
    const taxable = Number(record.taxableAmount || record.total || 0);
    const unitPrice = Number(record.unitPrice || (singleQty > 0 ? taxable / singleQty : taxable));
    const lineVat = Number(record.vatAmount || ((taxable * vatRate) / 100).toFixed(2));

    return [
      {
        name:
          matchedProd?.name ||
          record.productName ||
          record.entity ||
          "খাদ্য প্রক্রিয়াজাত টমেটো সস ও মসলা পণ্য সামগ্রী (Food & Spice Products)",
        sku: matchedProd?.sku || record.sku || "—",
        unit: matchedProd?.unit || record.unit || "বোতল / প্যাকেট",
        quantity: singleQty,
        unitPrice: unitPrice,
        total: taxable,
        vatAmount: lineVat,
        grandTotal: Number((taxable + lineVat).toFixed(2)),
      },
    ];
  }, [record, vatRate, products]);

  // Aggregated totals for the table and tfoot
  const taxableAmount = useMemo(() => {
    return parsedItems.reduce((sum, it) => sum + Number(it.total || 0), 0);
  }, [parsedItems]);

  const totalVatAmount = useMemo(() => {
    return parsedItems.reduce((sum, it) => sum + Number(it.vatAmount || 0), 0);
  }, [parsedItems]);

  const grandTotal = useMemo(() => {
    return Number((taxableAmount + totalVatAmount).toFixed(2));
  }, [taxableAmount, totalVatAmount]);

  if (!isOpen) return null;

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-2xs overflow-y-auto print:static print:inset-auto print:bg-white print:p-0 print:block print:overflow-visible printable-modal-overlay">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[96vh] flex flex-col overflow-hidden border border-slate-300 print:max-w-none print:max-h-none print:shadow-none print:border-none print:w-full print:block print:overflow-visible print:rounded-none printable-modal-box">
        {/* Modal Controls Bar (Hidden during actual print) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <FileText size={18} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-sm">
                {mode === "invoice" ? "মূসক-৬.৩ কর চালানপত্র প্রিভিউ" : "মূসক রেজিস্টার প্রিন্ট প্রিভিউ"}
              </div>
              <div className="text-[11px] text-slate-400">
                গণপ্রজাতন্ত্রী বাংলাদেশ সরকার, জাতীয় রাজস্ব বোর্ড (NBR Format) • {parsedItems.length} Products
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <Printer size={15} /> প্রিন্ট চালান / PDF সেভ করুন
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div
          ref={printAreaRef}
          id="mushak-printable-area"
          className="p-8 sm:p-12 overflow-y-auto flex-1 bg-white text-slate-900 font-sans print:p-0 print:overflow-visible print:m-0 print:block"
        >
          {mode === "invoice" ? (
            /* =================== মূসক-৬.৩ কর চালানপত্র (VAT Tax Invoice) =================== */
            <div className="max-w-[800px] mx-auto border-2 border-slate-800 p-6 sm:p-8 bg-white text-[13px] leading-relaxed relative print:border-2 print:p-4 print:max-w-none">
              {/* Copy Watermark / Header Badge */}
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-3 mb-4">
                <div className="text-[11px] font-bold border border-slate-800 px-2 py-0.5 rounded">
                  মূল কপি (ক্রেতার জন্য)
                </div>
                <div className="text-center flex-1 mx-2">
                  <div className="font-bold text-sm tracking-wide">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</div>
                  <div className="font-bold text-xs text-slate-700">জাতীয় রাজস্ব বোর্ড</div>
                  <div className="font-black text-base text-slate-900 uppercase tracking-wider mt-1">
                    কর চালানপত্র
                  </div>
                  <div className="text-[11px] text-slate-600">
                    [বিধি ৪০ এর উপ-বিধি (১) এর দফা (গ) ও দফা (চ) দ্রষ্টব্য]
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-sm px-2.5 py-1 bg-slate-900 text-white rounded">
                    মূসক-৬.৩
                  </span>
                </div>
              </div>

              {/* Organization & Registered Person Info */}
              <div className="grid grid-cols-2 gap-4 text-xs pb-3 border-b border-slate-400">
                <div>
                  <div>
                    <span className="font-bold">নিবন্ধিত ব্যক্তির নাম:</span> ফুড ম্যানুফ্যাকচারিং ইন্ডাস্ট্রিজ লি.
                  </div>
                  <div>
                    <span className="font-bold">নিবন্ধিত ব্যক্তির বিআইএন:</span>{" "}
                    <span className="font-mono font-bold tracking-wider">০০০-১২৩৪৫৬৭-০১০১</span>
                  </div>
                  <div>
                    <span className="font-bold">ঠিকানা:</span> প্লট-১২, তেজগাঁও শিল্প এলাকা, ঢাকা-১২০৮
                  </div>
                  <div>
                    <span className="font-bold">পণ্য সরবরাহের স্থান:</span> কেন্দ্রীয় কারখানা ওয়্যারহাউস, তেজগাঁও
                  </div>
                </div>

                <div className="text-right">
                  <div>
                    <span className="font-bold">চালানপত্র নম্বর:</span>{" "}
                    <span className="font-mono font-bold text-slate-900">
                      {record?.transactionNo || record?.orderNo || "TX-VAT-2026-001"}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold">ইস্যুর তারিখ:</span> {formattedDate}
                  </div>
                  <div>
                    <span className="font-bold">ইস্যুর সময়:</span> {timeStr}
                  </div>
                  <div>
                    <span className="font-bold">যানবাহনের বিবরণ:</span> কাভার্ড ভ্যান (ঢাকা মেট্রো-উ-১২-৩৪৫৬)
                  </div>
                </div>
              </div>

              {/* Buyer / Customer Info */}
              <div className="my-3 p-2.5 bg-slate-50 border border-slate-300 rounded text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-bold">ক্রেতার নাম:</span>{" "}
                    <span className="font-semibold text-slate-800">
                      {customer?.name || record?.customerName || record?.customerId || "মেসার্স স্বপ্ন সুপার শপ (তেজগাঁও শাখা)"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">ক্রেতার বিআইএন (যদি থাকে):</span>{" "}
                    <span className="font-mono font-semibold">
                      {customer?.bin || record?.customerBin || "১০২৯৩৮৪৭৫৬১"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-bold">ক্রেতার গন্তব্য/ঠিকানা:</span>{" "}
                    <span>
                      {customer?.address || record?.customerAddress || "তেজগাঁও-গুলশান লিংক রোড, ঢাকা"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Itemized Multi-Item Table */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left border-collapse border border-slate-800 text-[11.5px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-800 text-center font-bold">
                      <th className="border border-slate-800 p-1.5 w-8">ক্রমিক</th>
                      <th className="border border-slate-800 p-1.5 text-left">পণ্য বা সেবার বিবরণ</th>
                      <th className="border border-slate-800 p-1.5 w-16">সরবরাহের একক</th>
                      <th className="border border-slate-800 p-1.5 w-14">পরিমাণ</th>
                      <th className="border border-slate-800 p-1.5 text-right w-20">একক মূল্য (টাকা)</th>
                      <th className="border border-slate-800 p-1.5 text-right w-24">মোট মূল্য (টাকা)</th>
                      <th className="border border-slate-800 p-1.5 text-right w-16">মূসক হার</th>
                      <th className="border border-slate-800 p-1.5 text-right w-24">মূসক পরিমাণ (টাকা)</th>
                      <th className="border border-slate-800 p-1.5 text-right w-28">সর্বমোট মূল্য (টাকা)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedItems.map((item, index) => (
                      <tr key={index} className="border-b border-slate-400">
                        <td className="border border-slate-800 p-2 text-center font-semibold">{index + 1}</td>
                        <td className="border border-slate-800 p-2 font-medium">
                          {item.name}
                          {item.sku && item.sku !== "—" && (
                            <div className="text-[10px] text-slate-500 font-mono">
                              SKU: {item.sku}
                            </div>
                          )}
                        </td>
                        <td className="border border-slate-800 p-2 text-center">{item.unit}</td>
                        <td className="border border-slate-800 p-2 text-center font-mono">
                          {item.quantity.toLocaleString()}
                        </td>
                        <td className="border border-slate-800 p-2 text-right font-mono">
                          {item.unitPrice.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="border border-slate-800 p-2 text-right font-mono font-semibold">
                          {item.total.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="border border-slate-800 p-2 text-center font-mono">{vatRate}%</td>
                        <td className="border border-slate-800 p-2 text-right font-mono font-semibold text-blue-900">
                          {item.vatAmount.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="border border-slate-800 p-2 text-right font-mono font-bold text-slate-900">
                          {item.grandTotal.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-800">
                      <td colSpan={5} className="border border-slate-800 p-2 text-right">
                        মোট যোগফল (সর্বমোট):
                      </td>
                      <td className="border border-slate-800 p-2 text-right font-mono">
                        {taxableAmount.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="border border-slate-800 p-2 text-center">—</td>
                      <td className="border border-slate-800 p-2 text-right font-mono text-blue-900">
                        {totalVatAmount.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="border border-slate-800 p-2 text-right font-mono text-slate-900 text-sm">
                        {grandTotal.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Amount In Words & Declarations */}
              <div className="mt-4 text-xs border border-slate-300 p-2.5 rounded bg-slate-50">
                <span className="font-bold">কথায় (In Words):</span>{" "}
                <span className="italic font-medium">
                  {grandTotal.toLocaleString("en-BD", { minimumFractionDigits: 2 })} টাকা মাত্র (ট্যাক্স ও মূসক সহ সর্বমোট প্রদেয়)।
                </span>
              </div>

              <div className="mt-3 text-[11px] text-slate-600">
                * মূসক ও সম্পূরক শুল্ক আইন, ২০১২ মোতাবেক কর চালানপত্র ব্যতীত পণ্য কারখানা বা গোডাউন হতে অপসারণ দণ্ডনীয় অপরাধ।
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-12 mt-12 pt-4 text-xs text-center border-t border-dashed border-slate-400 print-keep-together">
                <div>
                  <div className="border-t border-slate-800 pt-1 font-bold inline-block px-8">
                    পণ্য গ্রহণকারীর স্বাক্ষর ও সীল
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">ক্রেতা প্রতিনিধি</div>
                </div>
                <div>
                  <div className="border-t border-slate-800 pt-1 font-bold inline-block px-8">
                    দায়িত্বপ্রাপ্ত কর্মকর্তার স্বাক্ষর ও নাম
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    ফুড ম্যানুফ্যাকচারিং ইন্ডাস্ট্রিজ লি. (অনুমোদিত সীল)
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* =================== মূসক রেজিস্টার প্রিন্ট (Mushak 6.1 / 6.2 Register) =================== */
            <div className="border border-slate-800 p-6 bg-white text-xs">
              <div className="text-center border-b-2 border-slate-800 pb-3 mb-4">
                <div className="font-bold text-sm">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার, জাতীয় রাজস্ব বোর্ড</div>
                <div className="font-black text-lg text-slate-900 mt-1">{title}</div>
                <div className="text-xs text-slate-600 mt-0.5">
                  প্রতিষ্ঠান: ফুড ম্যানুফ্যাকচারিং ইন্ডাস্ট্রিজ লি. | বিআইএন: ০০০-১২৩৪৫৬৭-০১০১ | তারিখ: {formattedDate}
                </div>
              </div>

              <table className="w-full text-left border-collapse border border-slate-800 text-[11px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-800 text-center font-bold">
                    <th className="border border-slate-800 p-1.5 w-8">ক্রমিক</th>
                    <th className="border border-slate-800 p-1.5">চালান নং</th>
                    <th className="border border-slate-800 p-1.5">ধরন</th>
                    <th className="border border-slate-800 p-1.5">ফরম</th>
                    <th className="border border-slate-800 p-1.5 text-right">করযোগ্য মূল্য (টাকা)</th>
                    <th className="border border-slate-800 p-1.5 text-center">হার</th>
                    <th className="border border-slate-800 p-1.5 text-right">মূসক পরিমাণ (টাকা)</th>
                    <th className="border border-slate-800 p-1.5 text-right">সর্বমোট (টাকা)</th>
                    <th className="border border-slate-800 p-1.5 text-center">তারিখ</th>
                  </tr>
                </thead>
                <tbody>
                  {(registerRecords || []).map((row, idx) => {
                    const taxable = Number(row.taxableAmount || row.total || 0);
                    const rate = Number(row.vatRate || 15);
                    const vat = Number(row.vatAmount || Math.round((taxable * rate) / 100));
                    const total = taxable + vat;
                    return (
                      <tr key={row.id || idx} className="border-b border-slate-300">
                        <td className="border border-slate-800 p-1.5 text-center font-semibold">{idx + 1}</td>
                        <td className="border border-slate-800 p-1.5 font-mono font-medium">{row.transactionNo || row.orderNo}</td>
                        <td className="border border-slate-800 p-1.5 font-medium">{row.transactionType || "SALES_VAT"}</td>
                        <td className="border border-slate-800 p-1.5 text-center font-medium">{row.mushakForm || "Mushak 6.2"}</td>
                        <td className="border border-slate-800 p-1.5 text-right font-mono">{taxable.toLocaleString()}</td>
                        <td className="border border-slate-800 p-1.5 text-center font-mono">{rate}%</td>
                        <td className="border border-slate-800 p-1.5 text-right font-mono font-semibold">{vat.toLocaleString()}</td>
                        <td className="border border-slate-800 p-1.5 text-right font-mono font-bold">{total.toLocaleString()}</td>
                        <td className="border border-slate-800 p-1.5 text-center font-mono text-[10px]">
                          {row.transactionDate ? new Date(row.transactionDate).toLocaleDateString("en-GB") : formattedDate}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="grid grid-cols-2 gap-8 mt-12 pt-4 text-xs text-center border-t border-slate-400">
                <div>
                  <div className="border-t border-slate-800 pt-1 font-bold inline-block px-6">প্রস্তুতকারীর স্বাক্ষর</div>
                  <div className="text-[10px] text-slate-500">ভ্যাট ও হিসাব সহকারী</div>
                </div>
                <div>
                  <div className="border-t border-slate-800 pt-1 font-bold inline-block px-6">অনুমোদনকারী কর্মকর্তার স্বাক্ষর</div>
                  <div className="text-[10px] text-slate-500">ব্যবস্থাপক (হিসাব ও অর্থ)</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Print Button Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-between items-center shrink-0 print:hidden">
          <div className="text-xs text-slate-500">
            টিপস: ব্রাউজারের প্রিন্ট ডায়ালগে <strong>&ldquo;Save as PDF&rdquo;</strong> সিলেক্ট করে ফাইল আকারে সংরক্ষণ করতে পারবেন।
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              বন্ধ করুন
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Printer size={15} /> প্রিন্ট করুন (A4)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
