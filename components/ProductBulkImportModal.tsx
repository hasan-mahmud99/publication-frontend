"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  Upload,
  Download,
  X,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileCheck,
  RefreshCw,
  Trash2,
  Package,
} from "lucide-react";

interface ProductBulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (summary: { created: number; updated: number; skipped: number }) => void;
}

interface ParsedProductRow {
  rowNum: number;
  sku: string;
  name: string;
  category: string;
  unit: string;
  sellingPrice: number;
  costPrice: number;
  currentStock: number;
  reorderLevel: number;
  isActive: boolean;
  errors: string[];
  isValid: boolean;
}

export default function ProductBulkImportModal({
  isOpen,
  onClose,
  onSuccess,
}: ProductBulkImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedProductRow[]>([]);
  const [updateExisting, setUpdateExisting] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [filterView, setFilterView] = useState<"all" | "valid" | "invalid">("all");

  if (!isOpen) return null;

  // Generate and download ready-to-use Excel template
  function handleDownloadTemplate() {
    try {
      const headers = [
        "SKU",
        "Product Name",
        "Category",
        "Unit",
        "Selling Price (৳)",
        "Cost Price (৳)",
        "Current Stock",
        "Reorder Level",
        "Active (YES/NO)",
      ];

      const sampleData = [
        [
          "PRD-TOM-500",
          "Tomato Ketchup Special 500g",
          "Sauces & Condiments",
          "bottle",
          140,
          105,
          500,
          50,
          "YES",
        ],
        [
          "PRD-CHL-200",
          "Hot Chili Powder 200g",
          "Spices & Seasoning",
          "packet",
          120,
          90,
          350,
          40,
          "YES",
        ],
        [
          "PRD-MST-1000",
          "Pure Mustard Oil 1 Litre",
          "Edible Oils",
          "bottle",
          290,
          240,
          150,
          20,
          "YES",
        ],
        [
          "PRD-MNG-400",
          "Sweet Mango Chutney 400g",
          "Pickles & Chutneys",
          "jar",
          180,
          135,
          200,
          25,
          "YES",
        ],
        [
          "PRD-GAR-250",
          "Garlic Ginger Paste 250g",
          "Cooking Pastes",
          "packet",
          85,
          65,
          400,
          60,
          "YES",
        ],
      ];

      const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);

      // Set column widths for clean readability
      ws["!cols"] = [
        { wch: 18 }, // SKU
        { wch: 32 }, // Name
        { wch: 22 }, // Category
        { wch: 12 }, // Unit
        { wch: 18 }, // Selling Price
        { wch: 16 }, // Cost Price
        { wch: 15 }, // Current Stock
        { wch: 15 }, // Reorder Level
        { wch: 16 }, // Active
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Products_Import");

      XLSX.writeFile(wb, "food_products_import_template.xlsx");
    } catch (err: any) {
      setGlobalError(err.message || "Failed to generate Excel template");
    }
  }

  // Parse uploaded file
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setGlobalError("");
    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const sheetName = wb.SheetNames[0];
      if (!sheetName) throw new Error("Excel sheet contains no worksheets.");

      const ws = wb.Sheets[sheetName];
      const rawRows: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

      if (rawRows.length === 0) {
        throw new Error("The selected Excel file contains no data rows.");
      }

      // Map rows and validate
      const skuSet = new Set<string>();
      const processed: ParsedProductRow[] = [];

      rawRows.forEach((row, idx) => {
        // Resolve headers case-insensitively with flexible aliases
        const normalized: Record<string, any> = {};
        for (const [k, v] of Object.entries(row)) {
          normalized[k.trim().toLowerCase()] = v;
        }

        const sku = String(
          normalized["sku"] ||
            normalized["item code"] ||
            normalized["code"] ||
            normalized["product code"] ||
            normalized["পণ্য কোড"] ||
            ""
        ).trim().toUpperCase();

        const name = String(
          normalized["product name"] ||
            normalized["name"] ||
            normalized["item name"] ||
            normalized["title"] ||
            normalized["পণ্যের নাম"] ||
            ""
        ).trim();

        const category = String(
          normalized["category"] ||
            normalized["group"] ||
            normalized["ক্যাটাগরি"] ||
            "General"
        ).trim();

        const unit = String(
          normalized["unit"] || normalized["uom"] || normalized["একক"] || "pcs"
        ).trim();

        const rawSellPrice =
          normalized["selling price (৳)"] ??
          normalized["selling price"] ??
          normalized["price"] ??
          normalized["mrp"] ??
          normalized["বিক্রয় মূল্য"] ??
          0;
        const sellingPrice = isNaN(Number(rawSellPrice)) ? 0 : Math.max(0, Number(rawSellPrice));

        const rawCostPrice =
          normalized["cost price (৳)"] ??
          normalized["cost price"] ??
          normalized["cost"] ??
          normalized["ক্রয় মূল্য"] ??
          0;
        const costPrice = isNaN(Number(rawCostPrice)) ? 0 : Math.max(0, Number(rawCostPrice));

        const rawStock =
          normalized["current stock"] ??
          normalized["stock"] ??
          normalized["qty"] ??
          normalized["quantity"] ??
          normalized["মজুদ"] ??
          0;
        const currentStock = isNaN(Number(rawStock)) ? 0 : Math.max(0, Number(rawStock));

        const rawReorder =
          normalized["reorder level"] ??
          normalized["min stock"] ??
          normalized["reorder"] ??
          normalized["রিঅর্ডার লেভেল"] ??
          10;
        const reorderLevel = isNaN(Number(rawReorder)) ? 0 : Math.max(0, Number(rawReorder));

        const rawActive = String(
          normalized["active (yes/no)"] ??
            normalized["active"] ??
            normalized["status"] ??
            "YES"
        ).trim().toUpperCase();
        const isActive = !["NO", "FALSE", "0", "INACTIVE", "না"].includes(rawActive);

        const errors: string[] = [];
        if (!sku) errors.push("SKU is required.");
        if (!name) errors.push("Product Name is required.");
        if (sku && skuSet.has(sku)) {
          errors.push(`Duplicate SKU "${sku}" repeated in this file.`);
        }
        if (sku) skuSet.add(sku);

        processed.push({
          rowNum: idx + 2, // Excel row numbering
          sku,
          name,
          category,
          unit,
          sellingPrice,
          costPrice,
          currentStock,
          reorderLevel,
          isActive,
          errors,
          isValid: errors.length === 0,
        });
      });

      setParsedRows(processed);
    } catch (err: any) {
      setGlobalError(err.message || "Failed to read Excel file");
      setParsedRows([]);
    }
  }

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.filter((r) => !r.isValid).length;

  const filteredRows = parsedRows.filter((r) => {
    if (filterView === "valid") return r.isValid;
    if (filterView === "invalid") return !r.isValid;
    return true;
  });

  // Execute bulk import
  async function handleImport() {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      setGlobalError("No valid product rows to import. Please review your file.");
      return;
    }

    setIsSubmitting(true);
    setGlobalError("");

    try {
      const payload = {
        products: validRows.map((r) => ({
          sku: r.sku,
          name: r.name,
          category: r.category,
          unit: r.unit,
          sellingPrice: r.sellingPrice,
          costPrice: r.costPrice,
          currentStock: r.currentStock,
          reorderLevel: r.reorderLevel,
          isActive: r.isActive,
        })),
        updateExisting,
      };

      const res = await fetch("/api/products/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Bulk import failed.");

      onSuccess({
        created: json.summary?.created ?? validRows.length,
        updated: json.summary?.updated ?? 0,
        skipped: json.summary?.skipped ?? 0,
      });
      onClose();
    } catch (err: any) {
      setGlobalError(err.message || "Failed to complete bulk import.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setFileName("");
    setParsedRows([]);
    setGlobalError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-2xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-300 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h2 className="font-bold text-base">Bulk Product Import via Excel</h2>
              <p className="text-xs text-slate-400">
                এক্সেল শিট হতে একসাথে শত শত পণ্য ও প্রাথমিক স্টক আমদানি করুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
            >
              <Download size={14} className="text-emerald-400" />
              <span>নমুনা এক্সেল ডাউনলোড (Template)</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {globalError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{globalError}</span>
            </div>
          )}

          {/* Upload Dropzone */}
          {parsedRows.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/40 rounded-2xl p-10 text-center transition cursor-pointer group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition text-emerald-600">
                <Upload size={26} />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">
                এক্সেল বা সিএসভি ফাইল নির্বাচন করুন অথবা টেনে এনে ছেড়ে দিন
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                সমর্থিত ফরম্যাট: <strong>.xlsx, .xls, .csv</strong> (Microsoft Excel & OpenOffice)
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold shadow-xs">
                <FileCheck size={14} /> ফাইল ব্রাউজ করুন
              </div>
            </div>
          ) : (
            /* File loaded and overview bar */
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <FileSpreadsheet size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">{fileName}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
                      <span>মোট রেকর্ড: {parsedRows.length}টি</span>
                      <span className="text-emerald-700 font-semibold">বৈধ: {validCount}টি</span>
                      {invalidCount > 0 && (
                        <span className="text-rose-600 font-semibold">ত্রুটিযুক্ত: {invalidCount}টি</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReset}
                    className="px-3 py-1.5 border border-slate-300 bg-white hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Trash2 size={13} className="text-slate-500" /> অন্য ফাইল নির্বাচন
                  </button>
                </div>
              </div>

              {/* Import Options & Filters */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">প্রদর্শন ফিল্টার:</span>
                  <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
                    <button
                      onClick={() => setFilterView("all")}
                      className={`px-3 py-1 rounded-md font-semibold transition ${
                        filterView === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
                      }`}
                    >
                      সকল ({parsedRows.length})
                    </button>
                    <button
                      onClick={() => setFilterView("valid")}
                      className={`px-3 py-1 rounded-md font-semibold transition ${
                        filterView === "valid" ? "bg-white text-emerald-700 shadow-2xs" : "text-slate-600"
                      }`}
                    >
                      সঠিক ({validCount})
                    </button>
                    {invalidCount > 0 && (
                      <button
                        onClick={() => setFilterView("invalid")}
                        className={`px-3 py-1 rounded-md font-semibold transition ${
                          filterView === "invalid" ? "bg-white text-rose-700 shadow-2xs" : "text-slate-600"
                        }`}
                      >
                        ত্রুটি ({invalidCount})
                      </button>
                    )}
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={updateExisting}
                    onChange={(e) => setUpdateExisting(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span>ডাটাবেজে একই SKU থাকলে আগের তথ্য হালনাগাদ করুন (Update Existing)</span>
                </label>
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 sticky top-0 z-10 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">Row</th>
                      <th className="py-2.5 px-3 w-28">SKU</th>
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3 w-28">Category</th>
                      <th className="py-2.5 px-3 w-16 text-center">Unit</th>
                      <th className="py-2.5 px-3 w-24 text-right">Selling Price</th>
                      <th className="py-2.5 px-3 w-24 text-right">Cost Price</th>
                      <th className="py-2.5 px-3 w-20 text-center">Opening Stock</th>
                      <th className="py-2.5 px-3 w-28 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredRows.map((row) => (
                      <tr
                        key={row.rowNum}
                        className={`hover:bg-slate-50 transition-colors ${
                          !row.isValid ? "bg-rose-50/40" : ""
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                          {row.rowNum}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                          {row.sku || <span className="text-rose-500 italic">Missing</span>}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">
                          <div>{row.name || <span className="text-rose-500 italic">Missing Name</span>}</div>
                          {row.errors.length > 0 && (
                            <div className="text-[10px] text-rose-600 mt-0.5 font-medium">
                              {row.errors.join("; ")}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 truncate max-w-[120px]">
                          {row.category}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600 font-mono">
                          {row.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                          ৳{row.sellingPrice.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                          ৳{row.costPrice.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">
                          {row.currentStock}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 size={11} /> Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              <AlertTriangle size={11} /> Invalid
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex justify-between items-center shrink-0">
          <div className="text-xs text-slate-500">
            {parsedRows.length > 0 && (
              <span>
                <strong>{validCount}টি</strong> পণ্য প্রস্তুত রয়েছে সিস্টেমে আমদানি করার জন্য।
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              বাতিল করুন
            </button>
            <button
              onClick={handleImport}
              disabled={isSubmitting || validCount === 0}
              className={`px-5 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-2 shadow-xs transition cursor-pointer ${
                validCount === 0 || isSubmitting
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>ইম্পোর্ট হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Upload size={14} />
                  <span>ইম্পোর্ট সম্পন্ন করুন ({validCount} Products)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
