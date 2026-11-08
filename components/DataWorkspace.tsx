"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Download,
  RefreshCw,
  X,
  Save,
  Trash2,
  Eye,
  Filter,
  Layers,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Printer,
  Package,
  Receipt,
  Truck,
  Lock,
  FileText,
  FileSpreadsheet,
  Pencil,
} from "lucide-react";
import { pages } from "@/lib/pages";
import MushakPrintModal from "./MushakPrintModal";
import SearchableCombobox from "./SearchableCombobox";
import OrderBuilder from "./OrderBuilder";
import CustomerInvoiceModal from "./CustomerInvoiceModal";
import OrderStatusPaymentModal from "./OrderStatusPaymentModal";
import ProductBulkImportModal from "./ProductBulkImportModal";
import SalesReturnBuilder from "./SalesReturnBuilder";

type Row = Record<string, any>;

const resourceMap: Record<string, string> = {
  products: "products",
  "products/categories": "products",
  "products/units": "products",
  "products/packaging": "products",
  "products/pricing": "products",
  "inventory/overview": "products",
  "inventory/stock-in": "stock-movements",
  "inventory/stock-out": "stock-movements",
  "inventory/ledger": "stock-movements",
  "inventory/batches": "production-orders",
  "inventory/adjustments": "stock-movements",
  "inventory/transfers": "stock-movements",
  "inventory/alerts": "products",
  "inventory/valuation": "products",
  "purchase/suppliers": "suppliers",
  "purchase/orders": "purchase-orders",
  "purchase/grn": "purchase-orders",
  "purchase/returns": "purchase-orders",
  "purchase/requisitions": "purchase-orders",
  "purchase/payments": "account-transactions",
  "manufacturing/bom": "products",
  "manufacturing/orders": "production-orders",
  "manufacturing/history": "production-orders",
  "manufacturing/material-issue": "stock-movements",
  "manufacturing/costing": "production-orders",
  "manufacturing/quality": "production-orders",
  "sales/customers": "customers",
  "sales/orders": "sales-orders",
  "sales/invoices": "sales-orders",
  "sales/challans": "sales-orders",
  "sales/collections": "account-transactions",
  "sales/credit": "customers",
  "sales/delivery": "sales-orders",
  "returns/dashboard": "returns",
  "returns/create": "returns",
  "returns/reports": "returns",
  "accounts/transactions": "account-transactions",
  "accounts/incoming": "account-transactions",
  "accounts/outgoing": "account-transactions",
  "vat/mushak-6-3": "vat-transactions",
  "courier/providers": "courier-shipments",
  "courier/bookings": "courier-shipments",
  "courier/tracking": "courier-shipments",
  "courier/cod": "courier-shipments",
  "reports/inventory": "stock-movements",
  "reports/purchase": "purchase-orders",
  "reports/sales": "sales-orders",
  "reports/production": "production-orders",
  "reports/returns": "returns",
  "settings/company": "warehouses",
  "settings/users": "users",
  "settings/roles": "users",
  "settings/system": "audit-logs",
  "settings/warehouses": "warehouses",
  "settings/audit-logs": "audit-logs",
};

const labels: Record<string, string[]> = {
  products: ["sku", "name", "category", "currentStock", "unit", "sellingPrice", "costPrice", "reorderLevel", "isActive"],
  suppliers: ["name", "phone", "email", "address", "bin", "openingBalance"],
  customers: ["name", "phone", "email", "address", "customerType", "creditLimit", "openingBalance"],
  warehouses: ["name", "code", "address", "isActive"],
  "stock-movements": ["productId", "warehouseId", "type", "quantity", "reference", "notes"],
  "purchase-orders": ["orderNo", "supplierId", "productId", "quantity", "unitPrice", "total", "status", "paymentStatus", "paidAmount", "dueAmount", "orderDate"],
  "production-orders": ["orderNo", "productId", "plannedQty", "producedQty", "status", "batchNo", "manufacturingDate", "expiryDate"],
  "sales-orders": ["orderNo", "customerId", "productId", "quantity", "unitPrice", "total", "status", "paymentStatus", "paidAmount", "dueAmount", "orderDate"],
  returns: [
    "returnNo",
    "invoiceNo",
    "customerName",
    "productId",
    "batchNo",
    "quantity",
    "refundAmount",
    "reason",
    "condition",
    "disposition",
    "resolutionType",
    "qcStatus",
    "status",
  ],
  "courier-shipments": ["consignmentId", "provider", "salesOrderId", "trackingCode", "status", "codAmount", "deliveryCharge"],
  "vat-transactions": ["transactionNo", "transactionType", "taxableAmount", "vatRate", "vatAmount", "transactionDate", "mushakForm"],
  "account-transactions": ["transactionNo", "type", "category", "amount", "paymentMethod", "reference", "partyName", "status", "transactionDate", "notes"],
  users: ["name", "email", "role", "isActive"],
  "audit-logs": ["userId", "action", "entity", "entityId", "details"],
};

const dropdownOptions: Record<string, { label: string; value: string }[]> = {
  transactionType: [
    { value: "SALES_VAT", label: "SALES_VAT (কর চালানপত্র / মূসক ৬.৩)" },
  ],
  mushakForm: [
    { value: "Mushak 6.3", label: "Mushak 6.3 (কর চালানপত্র / VAT Tax Invoice)" },
  ],
  vatRate: [
    { value: "15", label: "15.0% - Standard Rate (আদর্শ হার)" },
    { value: "10", label: "10.0% - Reduced Rate" },
    { value: "7.5", label: "7.5% - Truncated Rate (হ্রাসকৃত হার)" },
    { value: "5", label: "5.0% - Basic Rate" },
    { value: "0", label: "0.0% - Zero-Rated / Exempted (অব্যাহতিপ্রাপ্ত)" },
  ],
  paymentStatus: [
    { value: "PAID", label: "PAID (পরিশোধিত)" },
    { value: "PARTIAL", label: "PARTIAL (আংশিক পরিশোধ)" },
    { value: "UNPAID", label: "UNPAID (বকেয়া)" },
  ],
  paymentMethod: [
    { value: "CASH", label: "CASH (নগদ টাকা)" },
    { value: "BANK_TRANSFER", label: "BANK_TRANSFER (ব্যাংক একাউন্ট ট্রান্সফার)" },
    { value: "BKASH", label: "BKASH (বিকাশ মার্চেন্ট / পার্সোনাল)" },
    { value: "NAGAD", label: "NAGAD (নগদ একাউন্ট)" },
    { value: "CHEQUE", label: "CHEQUE (ব্যাংক চেক)" },
  ],
  customerType: [
    { value: "RETAIL", label: "RETAIL (খুচরা বিক্রয়)" },
    { value: "WHOLESALE", label: "WHOLESALE (পাইকারি বিক্রয়)" },
    { value: "DISTRIBUTOR", label: "DISTRIBUTOR (ডিলার / পরিবেশক)" },
    { value: "CORPORATE", label: "CORPORATE (প্রতিষ্ঠান / কর্পোরেট)" },
  ],
  type: [
    { value: "INCOMING", label: "INCOMING (টাকা জমা / প্রাপ্তি)" },
    { value: "OUTGOING", label: "OUTGOING (টাকা খরচ / প্রদান)" },
    { value: "IN", label: "IN (স্টক ইন / গুদামে মালামাল জমা)" },
    { value: "OUT", label: "OUT (স্টক আউট / বিক্রয় বা সরবরাহ)" },
    { value: "TRANSFER", label: "TRANSFER (এক গুদাম হতে অন্য গুদামে স্থানান্তর)" },
    { value: "ADJUSTMENT", label: "ADJUSTMENT (স্টক সমন্বয় / হিসাব সংশোধন)" },
  ],
  disposition: [
    { value: "RESTOCK", label: "RESTOCK (পুনরায় বিক্রয়যোগ্য স্টকে গ্রহণ / Stock Increase)" },
    { value: "RETURN_TO_SUPPLIER", label: "RETURN_TO_SUPPLIER (সরবরাহকারী/Seller-কে ফেরত)" },
    { value: "QUARANTINE", label: "QUARANTINE (কোয়ারেন্টাইন / পরীক্ষার জন্য আটক)" },
    { value: "SCRAP", label: "SCRAP (নষ্ট / বিনষ্টযোগ্য স্ক্র্যাপ)" },
  ],
  category: [
    { value: "Sauces", label: "Sauces (সস ও কেচাপ)" },
    { value: "Spices", label: "Spices (গুঁড়ো ও গোটা মশলা)" },
    { value: "Condiments", label: "Condiments (কাসুন্দি, আচার ও ভিনেগার)" },
    { value: "Packaging Materials", label: "Packaging Materials (প্যাকেজিং ও বোতল)" },
    { value: "Raw Materials", label: "Raw Materials (কাঁচামাল ও উপাদান)" },
  ],
  unit: [
    { value: "bottle", label: "bottle (বোতল)" },
    { value: "jar", label: "jar (জার)" },
    { value: "pack", label: "pack (প্যাকেট / পাউচ)" },
    { value: "kg", label: "kg (কেজি)" },
    { value: "pcs", label: "pcs (পিস / সংখ্যা)" },
    { value: "gm", label: "gm (গ্রাম)" },
    { value: "litre", label: "litre (লিটার)" },
    { value: "box", label: "box (কার্টন / বাক্স)" },
  ],
  provider: [
    { value: "Steadfast", label: "Steadfast Courier (স্টেডফাস্ট)" },
    { value: "Pathao Courier", label: "Pathao Courier (পাঠাও)" },
    { value: "RedX Express", label: "RedX Express (রেডেক্স)" },
    { value: "eCourier", label: "eCourier (ই-কুরিয়ার)" },
    { value: "Paperfly", label: "Paperfly (পেপারফ্লাই)" },
    { value: "Sundarban Courier", label: "Sundarban Courier (সুন্দরবন)" },
    { value: "SA Paribahan", label: "SA Paribahan (এস এ পরিবহন)" },
  ],
  role: [
    { value: "ADMIN", label: "ADMIN (সিস্টেম এডমিনিস্ট্রেটর)" },
    { value: "FACTORY_MANAGER", label: "FACTORY_MANAGER (কারখানা ব্যবস্থাপক)" },
    { value: "INVENTORY_LEAD", label: "INVENTORY_LEAD (ইনভেন্টরি প্রধান)" },
    { value: "SALES_DIRECTOR", label: "SALES_DIRECTOR (বিক্রয় কর্মকর্তা)" },
    { value: "QC_OFFICER", label: "QC_OFFICER (কোয়ালিটি কন্ট্রোল)" },
    { value: "ACCOUNTANT", label: "ACCOUNTANT (হিসাব ও মূসক কর্মকর্তা)" },
    { value: "STAFF", label: "STAFF (সাধারণ স্টাফ)" },
  ],
  isActive: [
    { value: "true", label: "Active (সক্রিয়)" },
    { value: "false", label: "Inactive (নিষ্ক্রিয়)" },
  ],
  reason: [
    { value: "Damaged carton seal during transit", label: "Damaged carton seal during transit" },
    { value: "Customer requested replacement for nearing expiry", label: "Customer requested replacement for nearing expiry" },
    { value: "Label printing imperfection", label: "Label printing imperfection" },
    { value: "Incorrect outer box dispatched", label: "Incorrect outer box dispatched" },
    { value: "Store overstock return agreement", label: "Store overstock return agreement" },
    { value: "Quality taste/texture deviation", label: "Quality taste/texture deviation" },
  ],
};

function getStatusOptions(resource: string) {
  if (resource === "sales-orders") {
    return [
      { value: "DRAFT", label: "DRAFT (খসড়া)" },
      { value: "CONFIRMED", label: "CONFIRMED (নিশ্চিতকৃত)" },
      { value: "PROCESSING", label: "PROCESSING (প্রক্রিয়াধীন)" },
      { value: "DISPATCHED", label: "DISPATCHED (ডেলিভারির জন্য প্রেরিত)" },
      { value: "DELIVERED", label: "DELIVERED (সরবরাহ সম্পন্ন)" },
      { value: "CANCELLED", label: "CANCELLED (বাতিল)" },
    ];
  }
  if (resource === "purchase-orders") {
    return [
      { value: "DRAFT", label: "DRAFT (খসড়া)" },
      { value: "PENDING_APPROVAL", label: "PENDING_APPROVAL (অনুমোদনের অপেক্ষায়)" },
      { value: "APPROVED", label: "APPROVED (অনুমোদিত)" },
      { value: "RECEIVED", label: "RECEIVED (মালামাল গৃহীত)" },
      { value: "COMPLETED", label: "COMPLETED (সম্পন্ন)" },
      { value: "CANCELLED", label: "CANCELLED (বাতিল)" },
    ];
  }
  if (resource === "production-orders") {
    return [
      { value: "PLANNED", label: "PLANNED (পরিকল্পিত)" },
      { value: "SCHEDULED", label: "SCHEDULED (নির্ধারিত)" },
      { value: "IN_PROGRESS", label: "IN_PROGRESS (উৎপাদন চলমান)" },
      { value: "QUALITY_CHECK", label: "QUALITY_CHECK (মান পরীক্ষা)" },
      { value: "COMPLETED", label: "COMPLETED (উৎপাদন সম্পন্ন)" },
      { value: "CANCELLED", label: "CANCELLED (বাতিল)" },
    ];
  }
  if (resource === "returns") {
    return [
      { value: "PENDING", label: "PENDING (অপেক্ষারত)" },
      { value: "INSPECTING", label: "INSPECTING (যাচাইকরণ চলমান)" },
      { value: "APPROVED", label: "APPROVED (অনুমোদিত)" },
      { value: "RESOLVED", label: "RESOLVED (নিষ্পন্ন)" },
      { value: "REJECTED", label: "REJECTED (প্রত্যাখ্যাত)" },
    ];
  }
  if (resource === "courier-shipments") {
    return [
      { value: "BOOKED", label: "BOOKED (বুকিং সম্পন্ন)" },
      { value: "PICKED_UP", label: "PICKED_UP (কুরিয়ার রিসিভ করেছে)" },
      { value: "IN_TRANSIT", label: "IN_TRANSIT (পথে রয়েছে)" },
      { value: "OUT_FOR_DELIVERY", label: "OUT_FOR_DELIVERY (ডেলিভারি চলছে)" },
      { value: "DELIVERED", label: "DELIVERED (গ্রাহক পেয়েছে)" },
      { value: "RETURNED", label: "RETURNED (ফেরত এসেছে)" },
    ];
  }
  if (resource === "account-transactions") {
    return [
      { value: "COMPLETED", label: "COMPLETED (সম্পন্ন / গৃহীত)" },
      { value: "PENDING", label: "PENDING (প্রক্রিয়াধীন)" },
      { value: "CANCELLED", label: "CANCELLED (বাতিল)" },
    ];
  }
  return [
    { value: "ACTIVE", label: "ACTIVE" },
    { value: "PENDING", label: "PENDING" },
    { value: "COMPLETED", label: "COMPLETED" },
    { value: "CANCELLED", label: "CANCELLED" },
  ];
}

const dateFields = ["orderDate", "manufacturingDate", "expiryDate", "transactionDate"];
const numberFields = [
  "quantity",
  "sellingPrice",
  "costPrice",
  "reorderLevel",
  "total",
  "plannedQty",
  "producedQty",
  "taxableAmount",
  "vatRate",
  "vatAmount",
  "codAmount",
  "deliveryCharge",
  "openingBalance",
  "creditLimit",
  "unitPrice",
  "amount",
  "refundAmount",
  "currentStock",
  "paidAmount",
  "dueAmount",
];

const pretty = (s: string) => s.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

interface FilterConfig {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

function getFilterConfigs(
  resource: string,
  refs: {
    products: { id: string; name: string }[];
    warehouses: { id: string; name: string }[];
    customers: { id: string; name: string }[];
    suppliers: { id: string; name: string }[];
  }
): FilterConfig[] {
  const configs: FilterConfig[] = [];

  // 1. Status Filter for order & workflow entities
  if (["sales-orders", "purchase-orders", "production-orders", "returns", "courier-shipments"].includes(resource)) {
    const opts = getStatusOptions(resource);
    configs.push({
      key: "status",
      label: "Status",
      options: [{ label: "All Statuses", value: "ALL" }, ...opts],
    });
  }

  // 2. Sales Orders Filters (Payment status & Customers)
  if (resource === "sales-orders") {
    configs.push({
      key: "paymentStatus",
      label: "Payment",
      options: [
        { label: "All Payments", value: "ALL" },
        { label: "PAID (পরিশোধিত)", value: "PAID" },
        { label: "PARTIAL (আংশিক পরিশোধ)", value: "PARTIAL" },
        { label: "UNPAID (বকেয়া)", value: "UNPAID" },
      ],
    });
    if (refs.customers.length > 0) {
      configs.push({
        key: "customerId",
        label: "Customer",
        options: [
          { label: "All Customers", value: "ALL" },
          ...refs.customers.map((c) => ({ label: c.name, value: c.id })),
        ],
      });
    }
  }

  // 3. Products Filters (Category & Active Status)
  if (resource === "products") {
    configs.push({
      key: "category",
      label: "Category",
      options: [
        { label: "All Categories", value: "ALL" },
        { label: "Sauces (সস ও কেচাপ)", value: "Sauces" },
        { label: "Spices (গুঁড়ো মশলা)", value: "Spices" },
        { label: "Condiments (কাসুন্দি ও ভিনেগার)", value: "Condiments" },
        { label: "Packaging Materials", value: "Packaging Materials" },
        { label: "Raw Materials", value: "Raw Materials" },
      ],
    });
    configs.push({
      key: "isActive",
      label: "Status",
      options: [
        { label: "All Status", value: "ALL" },
        { label: "Active Products", value: "true" },
        { label: "Inactive Products", value: "false" },
      ],
    });
    configs.push({
      key: "stockStatus",
      label: "Stock Level",
      options: [
        { label: "All Stock Levels", value: "ALL" },
        { label: "In Stock (স্টকে আছে > 0)", value: "IN_STOCK" },
        { label: "Low Stock (পুনঃঅর্ডার প্রয়োজন)", value: "LOW_STOCK" },
        { label: "Out of Stock (স্টক শেষ = 0)", value: "OUT_OF_STOCK" },
      ],
    });
  }

  // 4. Stock Movements Filters (Type & Warehouse)
  if (resource === "stock-movements") {
    configs.push({
      key: "type",
      label: "Movement Type",
      options: [
        { label: "All Movement Types", value: "ALL" },
        { label: "IN (স্টক ইন)", value: "IN" },
        { label: "OUT (স্টক আউট)", value: "OUT" },
        { label: "TRANSFER (স্থানান্তর)", value: "TRANSFER" },
        { label: "ADJUSTMENT (সমন্বয়)", value: "ADJUSTMENT" },
      ],
    });
    if (refs.warehouses.length > 0) {
      configs.push({
        key: "warehouseId",
        label: "Warehouse",
        options: [
          { label: "All Warehouses", value: "ALL" },
          ...refs.warehouses.map((w) => ({ label: w.name, value: w.id })),
        ],
      });
    }
  }

  // 5. Purchase Orders (Supplier filter)
  if (resource === "purchase-orders" && refs.suppliers.length > 0) {
    configs.push({
      key: "supplierId",
      label: "Supplier",
      options: [
        { label: "All Suppliers", value: "ALL" },
        ...refs.suppliers.map((s) => ({ label: s.name, value: s.id })),
      ],
    });
  }

  // 6. Production Orders (Product filter)
  if (resource === "production-orders" && refs.products.length > 0) {
    configs.push({
      key: "productId",
      label: "Product",
      options: [
        { label: "All Products", value: "ALL" },
        ...refs.products.map((p) => ({ label: p.name, value: p.id })),
      ],
    });
  }

  // 7. Product Returns (QC, Disposition, Settlement & Customer filters)
  if (resource === "returns") {
    configs.push({
      key: "qcStatus",
      label: "QC Status",
      options: [
        { label: "All QC Status", value: "ALL" },
        { label: "PASSED (পাস / অনুমোদিত)", value: "PASSED" },
        { label: "PENDING (ইন্সপেকশন বাকি)", value: "PENDING" },
        { label: "FAILED (অকৃতকার্য)", value: "FAILED" },
      ],
    });
    configs.push({
      key: "disposition",
      label: "Stock Disposition",
      options: [
        { label: "All Dispositions", value: "ALL" },
        { label: "SALEABLE (বিক্রয়যোগ্য স্টক)", value: "SALEABLE" },
        { label: "AVAILABLE_STOCK (স্টকে যুক্ত)", value: "AVAILABLE_STOCK" },
        { label: "RESTOCK (পুনর্বিক্রয়)", value: "RESTOCK" },
        { label: "DAMAGED (ড্যামেজড স্ক্র্যাপ)", value: "DAMAGED" },
        { label: "EXPIRED (মেয়াদোত্তীর্ণ কোয়ারেন্টাইন)", value: "EXPIRED" },
      ],
    });
    configs.push({
      key: "resolutionType",
      label: "Settlement Type",
      options: [
        { label: "All Settlement Types", value: "ALL" },
        { label: "REFUND (নগদ/ব্যাংক রিফান্ড)", value: "REFUND" },
        { label: "CREDIT_BALANCE (গ্রাহক ওয়ালেট ক্রেডিট)", value: "CREDIT_BALANCE" },
        { label: "REPLACEMENT (পণ্য রিপ্লেসমেন্ট)", value: "REPLACEMENT" },
      ],
    });
    if (refs.customers.length > 0) {
      configs.push({
        key: "customerId",
        label: "Customer",
        options: [
          { label: "All Customers", value: "ALL" },
          ...refs.customers.map((c) => ({ label: c.name, value: c.id })),
        ],
      });
    }
  }

  // 8. Courier Shipments (Courier Provider filter)
  if (resource === "courier-shipments") {
    configs.push({
      key: "provider",
      label: "Courier Provider",
      options: [
        { label: "All Providers", value: "ALL" },
        { label: "Steadfast", value: "Steadfast" },
        { label: "Pathao Courier", value: "Pathao Courier" },
        { label: "RedX Express", value: "RedX Express" },
        { label: "Paperfly", value: "Paperfly" },
        { label: "eCourier", value: "eCourier" },
        { label: "Sundarban Courier", value: "Sundarban Courier" },
      ],
    });
  }

  // 9. Customers (Customer Type filter)
  if (resource === "customers") {
    configs.push({
      key: "customerType",
      label: "Customer Type",
      options: [
        { label: "All Types", value: "ALL" },
        { label: "RETAIL (খুচরা)", value: "RETAIL" },
        { label: "WHOLESALE (পাইকারি)", value: "WHOLESALE" },
        { label: "DISTRIBUTOR (পরিবেশক)", value: "DISTRIBUTOR" },
        { label: "CORPORATE (কর্পোরেট)", value: "CORPORATE" },
      ],
    });
  }

  // 10. Users (Role & Status filter)
  if (resource === "users") {
    configs.push({
      key: "role",
      label: "User Role",
      options: [
        { label: "All Roles", value: "ALL" },
        { label: "ADMIN", value: "ADMIN" },
        { label: "FACTORY_MANAGER", value: "FACTORY_MANAGER" },
        { label: "INVENTORY_LEAD", value: "INVENTORY_LEAD" },
        { label: "SALES_DIRECTOR", value: "SALES_DIRECTOR" },
        { label: "QC_OFFICER", value: "QC_OFFICER" },
        { label: "ACCOUNTANT", value: "ACCOUNTANT" },
        { label: "STAFF", value: "STAFF" },
      ],
    });
    configs.push({
      key: "isActive",
      label: "Account Status",
      options: [
        { label: "All Status", value: "ALL" },
        { label: "Active Users", value: "true" },
        { label: "Suspended Users", value: "false" },
      ],
    });
  }

  // 11. Warehouses (Status filter)
  if (resource === "warehouses") {
    configs.push({
      key: "isActive",
      label: "Warehouse Status",
      options: [
        { label: "All Warehouses", value: "ALL" },
        { label: "Active Warehouses", value: "true" },
        { label: "Inactive Warehouses", value: "false" },
      ],
    });
  }

  // 12. VAT Transactions (Rate filter)
  if (resource === "vat-transactions") {
    configs.push({
      key: "vatRate",
      label: "VAT Rate",
      options: [
        { label: "All VAT Rates", value: "ALL" },
        { label: "15.0% (আদর্শ হার)", value: "15" },
        { label: "10.0%", value: "10" },
        { label: "7.5% (হ্রাসকৃত হার)", value: "7.5" },
        { label: "5.0%", value: "5" },
        { label: "0.0% (অব্যাহতিপ্রাপ্ত)", value: "0" },
      ],
    });
  }

  // 13. Account Transactions (Flow type, Category, Payment Method, Status)
  if (resource === "account-transactions") {
    configs.push({
      key: "type",
      label: "Flow Type",
      options: [
        { label: "All Types (সব ধরনের লেনদেন)", value: "ALL" },
        { label: "INCOMING (টাকা জমা / প্রাপ্তি)", value: "INCOMING" },
        { label: "OUTGOING (টাকা খরচ / প্রদান)", value: "OUTGOING" },
      ],
    });
    configs.push({
      key: "category",
      label: "Category",
      options: [
        { label: "All Categories", value: "ALL" },
        { label: "Sales Collection (বিক্রয় জমা)", value: "SALES_COLLECTION" },
        { label: "Customer Payment (কাস্টমার পরিশোধ)", value: "CUSTOMER_PAYMENT" },
        { label: "Supplier Payment (সাপ্লায়ার প্রদান)", value: "SUPPLIER_PAYMENT" },
        { label: "Sales Return Refund (রিটার্ন রিফান্ড)", value: "SALES_RETURN_REFUND" },
        { label: "Operational Expense (দৈনন্দিন খরচ)", value: "OPERATIONAL_EXPENSE" },
        { label: "Salary (বেতন ও মজুরি)", value: "SALARY" },
        { label: "Courier COD (কুরিয়ার কালেকশন)", value: "COURIER_COD" },
      ],
    });
    configs.push({
      key: "paymentMethod",
      label: "Payment Method",
      options: [
        { label: "All Methods", value: "ALL" },
        { label: "CASH (নগদ)", value: "CASH" },
        { label: "BANK_TRANSFER (ব্যাংক)", value: "BANK_TRANSFER" },
        { label: "BKASH (বিকাশ)", value: "BKASH" },
        { label: "NAGAD (নগদ)", value: "NAGAD" },
        { label: "CHEQUE (চেক)", value: "CHEQUE" },
      ],
    });
    configs.push({
      key: "status",
      label: "Status",
      options: [
        { label: "All Status", value: "ALL" },
        { label: "COMPLETED (সম্পন্ন)", value: "COMPLETED" },
        { label: "PENDING (প্রক্রিয়াধীন)", value: "PENDING" },
        { label: "CANCELLED (বাতিল)", value: "CANCELLED" },
      ],
    });
  }

  return configs;
}

export default function DataWorkspace({ path }: { path: string }) {
  const page = pages.find((p) => p.path === path) || pages[0];
  const resource = resourceMap[path];
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Row>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printRecord, setPrintRecord] = useState<Row | null>(null);
  const [printMode, setPrintMode] = useState<"invoice" | "register">("invoice");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [filterBarOpen, setFilterBarOpen] = useState(true);

  // Customer Commercial Invoice Modal
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceRecord, setInvoiceRecord] = useState<Row | null>(null);

  // Chronological Status & Payment Updater Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalRecord, setStatusModalRecord] = useState<Row | null>(null);

  // Dedicated Order Builder (Full page view for Sales & Purchase multi-item orders)
  const [isOrderBuilderOpen, setIsOrderBuilderOpen] = useState(false);
  const [orderBuilderRecord, setOrderBuilderRecord] = useState<Row | null>(null);

  // Dedicated Sales Return Builder (Full page view for comprehensive Returns management)
  const [isReturnBuilderOpen, setIsReturnBuilderOpen] = useState(false);
  const [returnBuilderRecord, setReturnBuilderRecord] = useState<Row | null>(null);

  // Bulk Product Excel Import Modal
  const [bulkImportOpen, setBulkImportOpen] = useState(false);

  // Clear filters & close order builder on page navigation
  // Clear filters & close order/return builders on page navigation
  useEffect(() => {
    setActiveFilters({});
    setQuery("");
    setIsOrderBuilderOpen(false);
    setOrderBuilderRecord(null);
    setIsReturnBuilderOpen(false);
    setReturnBuilderRecord(null);
  }, [path]);

  // Relational reference lookup data
  const [refs, setRefs] = useState<{
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
    warehouses: { id: string; name: string; code: string; address?: string }[];
    customers: { id: string; name: string; phone?: string; customerType?: string }[];
    suppliers: { id: string; name: string; phone?: string; bin?: string }[];
    salesOrders: { id: string; orderNo: string; customerId?: string; productId?: string; quantity?: number; unitPrice?: number; total?: number; status?: string }[];
    users: { id: string; name: string; role: string }[];
  }>({
    products: [],
    warehouses: [],
    customers: [],
    suppliers: [],
    salesOrders: [],
    users: [],
  });

  // Quick Add Modal state for dropdowns
  const [quickAddType, setQuickAddType] = useState<"product" | "customer" | "supplier" | "warehouse" | "category" | "customerType" | null>(null);
  const [quickForm, setQuickForm] = useState<Record<string, any>>({});
  const [quickError, setQuickError] = useState("");
  const [quickSubmitting, setQuickSubmitting] = useState(false);

  function openQuickAdd(type: "product" | "customer" | "supplier" | "warehouse" | "category" | "customerType") {
    setQuickAddType(type);
    setQuickError("");
    if (type === "product") {
      setQuickForm({
        name: "",
        sku: `PRD-${Date.now().toString().slice(-5)}`,
        category: "Sauces",
        unit: "bottle",
        sellingPrice: 150,
        costPrice: 110,
        reorderLevel: 25,
        isActive: true,
      });
    } else if (type === "customer") {
      setQuickForm({
        name: "",
        phone: "017",
        email: "",
        customerType: "RETAIL",
        address: "Dhaka, Bangladesh",
        creditLimit: 50000,
        openingBalance: 0,
      });
    } else if (type === "supplier") {
      setQuickForm({
        name: "",
        phone: "018",
        email: "",
        bin: `BIN-${Date.now().toString().slice(-6)}`,
        address: "Tejgaon, Dhaka",
        openingBalance: 0,
      });
    } else if (type === "warehouse") {
      setQuickForm({
        name: "",
        code: `WH-${Date.now().toString().slice(-4)}`,
        address: "Central Distribution Center",
        isActive: true,
      });
    } else if (type === "category") {
      setQuickForm({ name: "" });
    } else if (type === "customerType") {
      setQuickForm({ name: "" });
    }
  }

  async function handleQuickAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!quickAddType) return;
    setQuickSubmitting(true);
    setQuickError("");

    try {
      if (quickAddType === "category") {
        const catName = String(quickForm.name || "").trim();
        if (!catName) throw new Error("Category name is required");
        dropdownOptions.category.push({ value: catName, label: `${catName} (নতুন)` });
        handleFieldChange("category", catName);
        setNotice(`নতুন ক্যাটাগরি '${catName}' যুক্ত ও নির্বাচন করা হয়েছে!`);
        setQuickAddType(null);
        return;
      }

      if (quickAddType === "customerType") {
        const typeDisplay = String(quickForm.name || "").trim();
        if (!typeDisplay) throw new Error("Customer type name is required");
        const typeValue = typeDisplay.toUpperCase().replace(/\s+/g, "_");
        dropdownOptions.customerType.push({ value: typeValue, label: `${typeValue} (${typeDisplay})` });
        handleFieldChange("customerType", typeValue);
        // Also update quickForm for customer modal if open
        setQuickForm((prev) => ({ ...prev, customerType: typeValue }));
        setNotice(`নতুন গ্রাহক ধরন '${typeDisplay}' যুক্ত ও নির্বাচন করা হয়েছে!`);
        setQuickAddType(null);
        return;
      }

      const resourceTargetMap: Record<string, string> = {
        product: "products",
        customer: "customers",
        supplier: "suppliers",
        warehouse: "warehouses",
      };
      const resName = resourceTargetMap[quickAddType];
      const r = await fetch(`/api/${resName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quickForm),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed to create record");

      const created = j.data;

      if (quickAddType === "product") {
        setRefs((prev) => ({
          ...prev,
          products: [created, ...prev.products],
        }));
        handleFieldChange("productId", created.id);
        setNotice(`নতুন পণ্য '${created.name}' তৈরি এবং ফর্মে নির্বাচন করা হয়েছে!`);
      } else if (quickAddType === "customer") {
        setRefs((prev) => ({
          ...prev,
          customers: [created, ...prev.customers],
        }));
        handleFieldChange("customerId", created.id);
        setNotice(`নতুন গ্রাহক '${created.name}' তৈরি এবং ফর্মে নির্বাচন করা হয়েছে!`);
      } else if (quickAddType === "supplier") {
        setRefs((prev) => ({
          ...prev,
          suppliers: [created, ...prev.suppliers],
        }));
        handleFieldChange("supplierId", created.id);
        setNotice(`নতুন সরবরাহকারী '${created.name}' তৈরি এবং ফর্মে নির্বাচন করা হয়েছে!`);
      } else if (quickAddType === "warehouse") {
        setRefs((prev) => ({
          ...prev,
          warehouses: [created, ...prev.warehouses],
        }));
        handleFieldChange("warehouseId", created.id);
        setNotice(`নতুন গুদাম '${created.name}' তৈরি এবং ফর্মে নির্বাচন করা হয়েছে!`);
      }

      setQuickAddType(null);
    } catch (err: any) {
      setQuickError(err.message || "Failed to create quick item");
    } finally {
      setQuickSubmitting(false);
    }
  }

  const fields = resource ? labels[resource] || [] : [];

  // Fetch reference lookups once if required fields exist
  useEffect(() => {
    async function fetchRefs() {
      try {
        if ((fields.includes("productId") || path.startsWith("returns")) && refs.products.length === 0) {
          const res = await fetch("/api/products?limit=500");
          const j = await res.json();
          if (j.data) setRefs((r) => ({ ...r, products: j.data }));
        }
        if (fields.includes("warehouseId") && refs.warehouses.length === 0) {
          const res = await fetch("/api/warehouses");
          const j = await res.json();
          if (j.data) setRefs((r) => ({ ...r, warehouses: j.data }));
        }
        if ((fields.includes("customerId") || path.startsWith("returns")) && refs.customers.length === 0) {
          const res = await fetch("/api/customers");
          const j = await res.json();
          if (j.data) setRefs((r) => ({ ...r, customers: j.data }));
        }
        if (fields.includes("supplierId") && refs.suppliers.length === 0) {
          const res = await fetch("/api/suppliers");
          const j = await res.json();
          if (j.data) setRefs((r) => ({ ...r, suppliers: j.data }));
        }
        if ((fields.includes("salesOrderId") || path.startsWith("returns")) && refs.salesOrders.length === 0) {
          const res = await fetch("/api/sales-orders?limit=500");
          const j = await res.json();
          if (j.data) setRefs((r) => ({ ...r, salesOrders: j.data }));
        }
        if (fields.includes("userId") && refs.users.length === 0) {
          const res = await fetch("/api/users");
          const j = await res.json();
          if (j.data) setRefs((r) => ({ ...r, users: j.data }));
        }
      } catch {}
    }
    fetchRefs();
  }, [fields, path]);

  // Lookup maps for table display
  const productMap = useMemo(() => new Map(refs.products.map((p) => [p.id, `${p.name} (${p.sku})`])), [refs.products]);
  const warehouseMap = useMemo(() => new Map(refs.warehouses.map((w) => [w.id, `${w.name} [${w.code}]`])), [refs.warehouses]);
  const customerMap = useMemo(() => new Map(refs.customers.map((c) => [c.id, c.name])), [refs.customers]);
  const supplierMap = useMemo(() => new Map(refs.suppliers.map((s) => [s.id, s.name])), [refs.suppliers]);
  const orderMap = useMemo(() => new Map(refs.salesOrders.map((o) => [o.id, o.orderNo])), [refs.salesOrders]);
  const userMap = useMemo(() => new Map(refs.users.map((u) => [u.id, `${u.name} (${u.role})`])), [refs.users]);

  async function load() {
    if (!resource) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(`/api/${resource}`);
      const text = await r.text();
      let j: any = {};
      try {
        j = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Server returned error (${r.status})`);
      }
      if (!r.ok) throw new Error(j.error || "Unable to load records");
      setRows(j.data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [resource]);

  const filterConfigs = useMemo(() => {
    if (!resource) return [];
    return getFilterConfigs(resource, refs);
  }, [resource, refs]);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      // 1. Text search across fields
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesQuery = fields.some((f) => {
          let val = r[f];
          if (f === "productId" && productMap.has(val)) val = productMap.get(val);
          if (f === "warehouseId" && warehouseMap.has(val)) val = warehouseMap.get(val);
          if (f === "customerId" && customerMap.has(val)) val = customerMap.get(val);
          if (f === "supplierId" && supplierMap.has(val)) val = supplierMap.get(val);
          return String(val ?? "").toLowerCase().includes(q);
        });
        if (!matchesQuery) return false;
      }

      // 2. Dropdown field filters
      for (const [key, filterVal] of Object.entries(activeFilters)) {
        if (!filterVal || filterVal === "ALL") continue;
        if (key === "isActive") {
          const boolVal = filterVal === "true";
          if (r.isActive !== boolVal) return false;
          continue;
        }
        if (key === "stockStatus") {
          const stock = Number(r.currentStock || 0);
          const reorder = Number(r.reorderLevel || 10);
          if (filterVal === "IN_STOCK" && stock <= 0) return false;
          if (filterVal === "LOW_STOCK" && (stock <= 0 || stock > reorder)) return false;
          if (filterVal === "OUT_OF_STOCK" && stock > 0) return false;
          continue;
        }
        if (String(r[key]) !== String(filterVal)) return false;
      }

      return true;
    });
  }, [rows, query, activeFilters, fields, productMap, warehouseMap, customerMap, supplierMap]);

  const appliedFilterCount = useMemo(() => {
    return Object.values(activeFilters).filter((v) => v && v !== "ALL").length;
  }, [activeFilters]);

  const stats = useMemo(() => {
    if (resource === "account-transactions") {
      const incoming = filteredRows
        .filter((r) => r.type === "INCOMING" && r.status !== "CANCELLED")
        .reduce((sum, r) => sum + Number(r.amount || 0), 0);
      const outgoing = filteredRows
        .filter((r) => r.type === "OUTGOING" && r.status !== "CANCELLED")
        .reduce((sum, r) => sum + Number(r.amount || 0), 0);
      const net = incoming - outgoing;
      const pendingCount = filteredRows.filter((r) => r.status === "PENDING").length;

      return [
        { label: "Total Incoming (মোট প্রাপ্তি)", value: `৳${incoming.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
        { label: "Total Outgoing (মোট প্রদান)", value: `৳${outgoing.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
        {
          label: "Net Balance (অবশিষ্ট ক্যাশ ব্যালেন্স)",
          value: `৳${net.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          subtext: `${pendingCount} pending transaction${pendingCount !== 1 ? "s" : ""}`,
        },
      ];
    }

    if (resource === "returns" || path.startsWith("returns")) {
      const totalRefund = filteredRows.reduce((sum, r) => sum + Number(r.refundAmount || 0), 0);
      const pendingApproval = filteredRows.filter((r) => r.status === "PENDING" || r.status === "INSPECTED").length;
      const approvedCount = filteredRows.filter((r) => r.status === "APPROVED" || r.status === "COMPLETED").length;
      return [
        { label: "Total Returns (মোট রিটার্ন)", value: filteredRows.length, subtext: `${approvedCount} Approved / Settled` },
        { label: "Total Refund / Claim Value", value: `৳${totalRefund.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, subtext: "Accounts & Credit claims" },
        { label: "Pending Inspection / Approval", value: pendingApproval, subtext: pendingApproval > 0 ? "⚠️ Action required" : "✓ All returns processed" },
      ];
    }

    if (resource === "products" || path.startsWith("inventory/")) {
      const totalUnits = filteredRows.reduce((sum, r) => sum + Number(r.currentStock || 0), 0);
      const lowStockCount = filteredRows.filter(
        (r) => Number(r.currentStock || 0) <= Number(r.reorderLevel || 10)
      ).length;
      const totalValuation = filteredRows.reduce(
        (sum, r) => sum + Number(r.currentStock || 0) * Number(r.costPrice || 0),
        0
      );

      return [
        {
          label: "Total Inventory Units (মোট স্টক)",
          value: totalUnits.toLocaleString(),
          subtext: `${filteredRows.length} Product SKUs in catalogue`,
        },
        {
          label: "Inventory Valuation (স্টক মোট মূল্য)",
          value: `৳${totalValuation.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          subtext: "Based on unit cost price",
        },
        {
          label: "Low Stock / Reorder Needed",
          value: lowStockCount,
          subtext: lowStockCount > 0 ? "⚠️ Requires production or purchase" : "✓ All stock levels healthy",
        },
      ];
    }

    return [
      { label: "Total records", value: filteredRows.length },
      { label: "Active / current", value: filteredRows.filter((r) => r.isActive !== false && r.status !== "CANCELLED").length },
      {
        label: "Needs attention",
        value: filteredRows.filter((r) => ["PENDING", "OVERDUE", "EXPIRED", "FAILED", "UNPAID"].includes(String(r.status || r.paymentStatus || "").toUpperCase())).length,
      },
    ];
  }, [filteredRows, resource]);

  function startCreate() {
    if (path === "sales/orders" || path === "purchase/orders") {
      setOrderBuilderRecord(null);
      setIsOrderBuilderOpen(true);
      return;
    }
    if (resource === "returns" || path.startsWith("returns")) {
      setReturnBuilderRecord(null);
      setIsReturnBuilderOpen(true);
      return;
    }

    setEditing(null);
    const initialForm: Row = {};

    // Intelligent default values
    if (fields.includes("orderNo")) {
      const prefix = resource === "sales-orders" ? "SO" : resource === "purchase-orders" ? "PO" : "PRD";
      initialForm.orderNo = `${prefix}-${Date.now().toString().slice(-6)}`;
    }
    if (fields.includes("quantity")) initialForm.quantity = 1;
    if (fields.includes("unitPrice")) initialForm.unitPrice = 0;
    if (fields.includes("total")) initialForm.total = 0;

    if (resource === "account-transactions") {
      initialForm.type = path.includes("outgoing") ? "OUTGOING" : "INCOMING";
      initialForm.category = initialForm.type === "INCOMING" ? "SALES_COLLECTION" : "SUPPLIER_PAYMENT";
      initialForm.paymentMethod = "BANK_TRANSFER";
      initialForm.status = "COMPLETED";
      initialForm.transactionDate = new Date().toISOString().split("T")[0];
      initialForm.transactionNo = `TX-${Date.now().toString().slice(-6)}`;
      initialForm.amount = 0;
    }

    if (resource === "returns") {
      initialForm.returnNo = `RET-${Date.now().toString().slice(-6)}`;
      initialForm.status = "PENDING";
      initialForm.disposition = "RESTOCK";
      initialForm.quantity = 1;
      initialForm.refundAmount = 0;
      initialForm.reason = "Customer requested replacement for nearing expiry";
    }

    if (resource === "vat-transactions") {
      initialForm.vatRate = "15";
      initialForm.transactionType = "SALES_VAT";
      initialForm.mushakForm = "Mushak 6.3";
      initialForm.transactionDate = new Date().toISOString().split("T")[0];
      initialForm.transactionNo = `TX-VAT-${Date.now().toString().slice(-6)}`;
    }
    if (fields.includes("status")) {
      const opts = getStatusOptions(resource);
      if (opts.length > 0) initialForm.status = opts[0].value;
    }
    if (fields.includes("paymentStatus")) initialForm.paymentStatus = "UNPAID";
    if (fields.includes("orderDate")) initialForm.orderDate = new Date().toISOString().split("T")[0];
    if (fields.includes("isActive")) initialForm.isActive = true;
    if (fields.includes("unit")) initialForm.unit = "bottle";
    if (fields.includes("type")) initialForm.type = path.includes("stock-in") ? "IN" : path.includes("stock-out") ? "OUT" : "IN";

    setForm(initialForm);
    setError("");
    setOpen(true);
  }

  function startEdit(row: Row) {
    if (path === "sales/orders" || path === "purchase/orders") {
      const isDraft = String(row.status || "").toUpperCase() === "DRAFT";
      if (!isDraft) {
        // Confirmed/processed orders cannot have products or prices modified; open Status & Payment updater!
        setStatusModalRecord(row);
        setStatusModalOpen(true);
        return;
      }
      setOrderBuilderRecord(row);
      setIsOrderBuilderOpen(true);
      return;
    }
    if (resource === "returns" || path.startsWith("returns")) {
      setReturnBuilderRecord(row);
      setIsReturnBuilderOpen(true);
      return;
    }

    setEditing(row);
    const formatted: Row = { ...row };
    // Format date fields for HTML input type="date"
    for (const d of dateFields) {
      if (formatted[d]) {
        try {
          formatted[d] = new Date(formatted[d]).toISOString().split("T")[0];
        } catch {}
      }
    }
    setForm(formatted);
    setError("");
    setOpen(true);
  }

  // Handle form change with auto calculation for VAT & Sales/Purchase Totals
  function handleFieldChange(f: string, value: any) {
    setForm((prev) => {
      const updated = { ...prev, [f]: value };

      // Auto-calculate vatAmount if taxableAmount and vatRate are set
      if (resource === "vat-transactions" && (f === "taxableAmount" || f === "vatRate")) {
        const taxable = Number(f === "taxableAmount" ? value : updated.taxableAmount) || 0;
        const rate = Number(f === "vatRate" ? value : updated.vatRate) || 0;
        if (taxable > 0 && rate >= 0) {
          updated.vatAmount = Math.round((taxable * rate) / 100);
        }
      }

      // Auto-populate return fields when salesOrderId is chosen in returns
      if (resource === "returns" && f === "salesOrderId") {
        const so = refs.salesOrders.find((o) => o.id === value);
        if (so) {
          if (so.productId) updated.productId = so.productId;
          if (so.quantity) updated.quantity = so.quantity;
          if (so.total) updated.refundAmount = Number(so.total);
          if (!updated.disposition) updated.disposition = "RESTOCK";
          if (!updated.reason) updated.reason = "Customer requested replacement for nearing expiry";
        }
      }

      // Auto-recalculate refundAmount when quantity is changed in returns
      if (resource === "returns" && f === "quantity" && updated.salesOrderId) {
        const so = refs.salesOrders.find((o) => o.id === updated.salesOrderId);
        if (so && Number(so.quantity) > 0 && Number(so.total) > 0) {
          const unitRate = Number(so.total) / Number(so.quantity);
          const returnQty = Number(value) || 0;
          updated.refundAmount = Number((returnQty * unitRate).toFixed(2));
        }
      }

      // Auto-populate unitPrice and total for sales-orders & purchase-orders
      if (f === "productId") {
        const prod = refs.products.find((p) => p.id === value);
        if (prod) {
          const unitPrice =
            resource === "purchase-orders"
              ? Number((prod as any).costPrice || 0)
              : Number((prod as any).sellingPrice || 0);
          updated.unitPrice = unitPrice;
          const qty = Number(updated.quantity) || 1;
          updated.quantity = qty;
          updated.total = Number((qty * unitPrice).toFixed(2));
        }
      }

      if (f === "quantity" || f === "unitPrice") {
        const qty = Number(f === "quantity" ? value : updated.quantity) || 0;
        const price = Number(f === "unitPrice" ? value : updated.unitPrice) || 0;
        if (qty > 0 && price >= 0) {
          updated.total = Number((qty * price).toFixed(2));
          if (updated.paymentStatus === "PAID") updated.paidAmount = updated.total;
          if (updated.paymentStatus === "UNPAID") updated.dueAmount = updated.total;
          if (updated.paymentStatus === "PARTIAL") updated.dueAmount = Math.max(0, updated.total - Number(updated.paidAmount || 0));
        }
      }

      if (f === "paymentStatus") {
        const tot = Number(updated.total || 0);
        if (value === "PAID") {
          updated.paidAmount = tot;
          updated.dueAmount = 0;
        } else if (value === "UNPAID") {
          updated.paidAmount = 0;
          updated.dueAmount = tot;
        } else if (value === "PARTIAL" && (!updated.paidAmount || Number(updated.paidAmount) === 0)) {
          updated.paidAmount = Math.round(tot / 2);
          updated.dueAmount = Math.max(0, tot - updated.paidAmount);
        }
      }

      if (f === "paidAmount") {
        const tot = Number(updated.total || 0);
        const paid = Number(value) || 0;
        updated.dueAmount = Math.max(0, tot - paid);
      }

      return updated;
    });
  }

  async function save() {
    if (!resource) return;
    setError("");
    const payload = { ...form };
    delete payload.id;
    delete payload.createdAt;
    delete payload.updatedAt;

    // Strict stock verification for sales orders
    if (resource === "sales-orders" && payload.productId) {
      const prod = refs.products.find((p) => p.id === payload.productId);
      const available = prod ? Number(prod.currentStock || 0) : 0;
      const requested = Number(payload.quantity || 0);
      if (requested <= 0) {
        setError("Order quantity must be at least 1");
        return;
      }
      if (available <= 0) {
        setError(`Product "${prod?.name}" is currently OUT OF STOCK. Cannot place order.`);
        return;
      }
      if (requested > available) {
        setError(
          `Insufficient stock for "${prod?.name}". Only ${available} ${prod?.unit || "pcs"} available in stock, but order requested ${requested} ${prod?.unit || "pcs"}. Please decrease the order quantity.`
        );
        return;
      }
    }

    try {
      const r = await fetch(editing ? `/api/${resource}/${editing.id}` : `/api/${resource}`, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await r.text();
      let j: any = {};
      try {
        j = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Server returned error (${r.status})`);
      }
      if (!r.ok) throw new Error(j.error || "Save failed");
      setOpen(false);
      setNotice(editing ? "Record updated successfully" : "Record created successfully");
      load();

      // Refresh product stock lookups in background
      try {
        const pres = await fetch("/api/products");
        const pj = await pres.json();
        if (pj.data) setRefs((r) => ({ ...r, products: pj.data }));
      } catch {}
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function remove(row: Row) {
    if (!resource || !confirm("Delete this record? This action cannot be undone.")) return;
    try {
      const r = await fetch(`/api/${resource}/${row.id}`, { method: "DELETE" });
      const text = await r.text();
      let j: any = {};
      try {
        j = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Server returned error (${r.status})`);
      }
      if (!r.ok) {
        setError(j.error || "Delete failed");
        return;
      }
      setNotice("Record deleted");
      load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  function exportCsv() {
    const data = filteredRows
      .map((r) =>
        fields
          .map((f) => {
            let val = r[f];
            if (f === "productId" && productMap.has(val)) val = productMap.get(val);
            if (f === "warehouseId" && warehouseMap.has(val)) val = warehouseMap.get(val);
            if (f === "customerId" && customerMap.has(val)) val = customerMap.get(val);
            if (f === "supplierId" && supplierMap.has(val)) val = supplierMap.get(val);
            return JSON.stringify(val ?? "");
          })
          .join(",")
      )
      .join("\n");
    const blob = new Blob([[fields.map(pretty).join(","), data].join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${path.replaceAll("/", "-")}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // Render Form Input or Dropdown for a field
  function renderFormField(f: string) {
    const val = form[f] ?? "";

    // 1. Status Dropdown (Context-aware)
    if (f === "status") {
      const options = getStatusOptions(resource);
      return (
        <SearchableCombobox
          value={String(val)}
          onChange={(newVal) => handleFieldChange(f, newVal)}
          options={options}
          placeholder="-- Select Status --"
          searchPlaceholder="Filter status options..."
        />
      );
    }

    // Type dropdown (Context-aware: Accounts vs Inventory)
    if (f === "type") {
      const typeOptions =
        resource === "account-transactions"
          ? [
              { value: "INCOMING", label: "INCOMING (টাকা জমা / প্রাপ্তি)" },
              { value: "OUTGOING", label: "OUTGOING (টাকা খরচ / প্রদান)" },
            ]
          : [
              { value: "IN", label: "IN (স্টক ইন / গুদামে মালামাল জমা)" },
              { value: "OUT", label: "OUT (স্টক আউট / বিক্রয় বা সরবরাহ)" },
              { value: "TRANSFER", label: "TRANSFER (এক গুদাম হতে অন্য গুদামে স্থানান্তর)" },
              { value: "ADJUSTMENT", label: "ADJUSTMENT (স্টক সমন্বয় / হিসাব সংশোধন)" },
            ];
      return (
        <SearchableCombobox
          value={String(val)}
          onChange={(newVal) => handleFieldChange(f, newVal)}
          options={typeOptions}
          placeholder="-- Select Type --"
          searchPlaceholder="Search type..."
        />
      );
    }

    // Financial Category Dropdown
    if (f === "category" && resource === "account-transactions") {
      return (
        <SearchableCombobox
          value={String(val)}
          onChange={(newVal) => handleFieldChange(f, newVal)}
          options={[
            { value: "SALES_COLLECTION", label: "SALES_COLLECTION (বিক্রয় ও কাস্টমার কালেকশন)" },
            { value: "CUSTOMER_PAYMENT", label: "CUSTOMER_PAYMENT (কাস্টমার বকেয়া পরিশোধ)" },
            { value: "SUPPLIER_PAYMENT", label: "SUPPLIER_PAYMENT (সরবরাহকারীকে মূল্য পরিশোধ)" },
            { value: "SALES_RETURN_REFUND", label: "SALES_RETURN_REFUND (সেলস রিটার্ন রিফান্ড)" },
            { value: "OPERATIONAL_EXPENSE", label: "OPERATIONAL_EXPENSE (দৈনন্দিন কারখানা ও অফিস খরচ)" },
            { value: "SALARY", label: "SALARY (কর্মীদের বেতন ও মজুরি)" },
            { value: "COURIER_COD", label: "COURIER_COD (কুরিয়ার ক্যাশ অন ডেলিভারি)" },
          ]}
          placeholder="-- Select Financial Category --"
          searchPlaceholder="Search category..."
        />
      );
    }

    // 2. Pre-defined Enumeration Dropdowns
    if (dropdownOptions[f]) {
      return (
        <SearchableCombobox
          value={String(val)}
          onChange={(newVal) => handleFieldChange(f, newVal)}
          options={dropdownOptions[f]}
          placeholder={`-- Select ${pretty(f)} --`}
          searchPlaceholder={`Search ${pretty(f)}...`}
          onAddNew={
            f === "category"
              ? () => openQuickAdd("category")
              : f === "customerType"
              ? () => openQuickAdd("customerType")
              : undefined
          }
          addNewTitle={
            f === "category"
              ? "+ Add Category (নতুন ক্যাটাগরি)"
              : f === "customerType"
              ? "+ Add Customer Type (নতুন গ্রাহক ধরন)"
              : undefined
          }
        />
      );
    }

    // 3. Relational Foreign Key Dropdowns
    if (f === "productId") {
      const selectedProd = refs.products.find((p) => p.id === val);
      const stock = selectedProd ? Number(selectedProd.currentStock ?? 0) : null;
      const orderQty = Number(form.quantity || 1);
      const isOverselling = resource === "sales-orders" && stock !== null && stock < orderQty;

      return (
        <div className="space-y-1.5 w-full">
          <SearchableCombobox
            value={String(val)}
            onChange={(newVal) => handleFieldChange("productId", newVal)}
            options={refs.products.map((p) => {
              const itemStock = Number(p.currentStock ?? 0);
              const isOut = itemStock <= 0;
              const isLow = itemStock > 0 && itemStock <= Number(p.reorderLevel || 15);
              const badgeText = isOut
                ? "Out of Stock (0)"
                : isLow
                ? `Low: ${itemStock} ${p.unit || "pcs"}`
                : `Stock: ${itemStock} ${p.unit || "pcs"}`;

              return {
                value: p.id,
                label: p.name,
                sublabel: `SKU: ${p.sku} • ৳${Number(p.sellingPrice || 0).toFixed(2)} • Available: ${itemStock} ${p.unit || "pcs"}`,
                badge: badgeText,
              };
            })}
            placeholder="-- Choose / Select Product from Stock --"
            searchPlaceholder="Search product by name, SKU, or category..."
            onAddNew={() => openQuickAdd("product")}
            addNewTitle="+ Add New Product (নতুন পণ্য)"
          />
          {resource === "sales-orders" && selectedProd && (
            <div
              className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition ${
                stock! <= 0
                  ? "bg-rose-50 border-rose-200 text-rose-800"
                  : isOverselling
                  ? "bg-amber-50 border-amber-300 text-amber-900"
                  : "bg-emerald-50 border-emerald-200 text-emerald-800"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Package size={14} className="shrink-0" />
                <span>
                  <strong>{selectedProd.name}</strong>:{" "}
                  {stock! <= 0 ? (
                    <span className="font-bold text-rose-700">❌ Out of Stock (0 {selectedProd.unit})</span>
                  ) : (
                    <span>
                      Available Stock: <strong>{stock} {selectedProd.unit}</strong> (৳{Number(selectedProd.sellingPrice || 0).toFixed(2)}/unit)
                    </span>
                  )}
                </span>
              </div>
              {stock! > 0 && (
                <div className={`font-semibold ${isOverselling ? "text-amber-800" : "text-emerald-800"}`}>
                  {isOverselling
                    ? `⚠️ Shortage by ${orderQty - stock!} ${selectedProd.unit}`
                    : `Remaining after sale: ${stock! - orderQty} ${selectedProd.unit}`}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (f === "warehouseId") {
      return (
        <SearchableCombobox
          value={String(val)}
          onChange={(newVal) => handleFieldChange("warehouseId", newVal)}
          options={refs.warehouses.map((w) => ({
            value: w.id,
            label: w.name,
            sublabel: `Code: ${w.code}`,
            badge: w.address || undefined,
          }))}
          placeholder="-- Choose Warehouse --"
          searchPlaceholder="Search warehouse by name or code..."
          onAddNew={() => openQuickAdd("warehouse")}
          addNewTitle="+ Add New Warehouse (নতুন গুদাম)"
        />
      );
    }

    if (f === "customerId") {
      return (
        <SearchableCombobox
          value={String(val)}
          onChange={(newVal) => handleFieldChange("customerId", newVal)}
          options={refs.customers.map((c) => ({
            value: c.id,
            label: c.name,
            sublabel: c.phone ? `Phone: ${c.phone}` : undefined,
            badge: c.customerType || undefined,
          }))}
          placeholder="-- Choose Customer --"
          searchPlaceholder="Search customer by name or phone..."
          onAddNew={() => openQuickAdd("customer")}
          addNewTitle="+ Add New Customer (নতুন গ্রাহক)"
        />
      );
    }

    if (f === "supplierId") {
      return (
        <SearchableCombobox
          value={String(val)}
          onChange={(newVal) => handleFieldChange("supplierId", newVal)}
          options={refs.suppliers.map((s) => ({
            value: s.id,
            label: s.name,
            sublabel: s.phone ? `Phone: ${s.phone}` : (s.bin ? `BIN: ${s.bin}` : undefined),
          }))}
          placeholder="-- Choose Supplier --"
          searchPlaceholder="Search supplier by name, phone, or BIN..."
          onAddNew={() => openQuickAdd("supplier")}
          addNewTitle="+ Add New Supplier (নতুন সরবরাহকারী)"
        />
      );
    }

    if (f === "salesOrderId") {
      return (
        <SearchableCombobox
          value={String(val)}
          onChange={(newVal) => handleFieldChange("salesOrderId", newVal)}
          options={refs.salesOrders.map((so) => ({
            value: so.id,
            label: so.orderNo,
            sublabel: `Qty: ${so.quantity ?? 1} • Total: ৳${Number(so.total || 0).toFixed(2)}`,
            badge: so.status || undefined,
          }))}
          placeholder="-- Choose Sales Order --"
          searchPlaceholder="Search sales order by number..."
        />
      );
    }

    if (f === "userId") {
      return (
        <SearchableCombobox
          value={String(val)}
          onChange={(newVal) => handleFieldChange("userId", newVal)}
          options={refs.users.map((u) => ({
            value: u.id,
            label: u.name,
            sublabel: u.role,
            badge: u.role,
          }))}
          placeholder="-- Choose User --"
          searchPlaceholder="Search user by name or role..."
        />
      );
    }

    // 4. Date Picker Input
    if (dateFields.includes(f)) {
      return (
        <input
          type="date"
          value={String(val)}
          onChange={(e) => handleFieldChange(f, e.target.value)}
          className="mt-1.5 w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
        />
      );
    }

    // 5. Numeric Input
    if (numberFields.includes(f)) {
      const isSalesOrderQty = resource === "sales-orders" && f === "quantity";
      const selectedProd = isSalesOrderQty && form.productId ? refs.products.find((p) => p.id === form.productId) : null;
      const stock = selectedProd ? Number(selectedProd.currentStock ?? 0) : null;
      const isOver = isSalesOrderQty && stock !== null && Number(val) > stock;

      return (
        <div>
          <input
            type="number"
            step="any"
            value={val}
            onChange={(e) => handleFieldChange(f, e.target.value)}
            placeholder={`Enter ${pretty(f).toLowerCase()} (e.g. 100)`}
            className={`mt-1.5 w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ${
              isOver
                ? "border-amber-400 bg-amber-50/40 text-amber-950 focus:ring-amber-200 focus:border-amber-500 font-semibold"
                : "border-slate-200 bg-white focus:ring-blue-100 focus:border-blue-500"
            }`}
          />
          {isOver && (
            <div className="text-[11px] text-amber-800 font-semibold mt-1 flex items-center gap-1">
              <span>⚠️ Warning: Requested quantity ({val}) exceeds available stock ({stock} {selectedProd?.unit || "pcs"})!</span>
            </div>
          )}
        </div>
      );
    }

    if (f === "dueAmount") {
      const due = Number(val || 0);
      return (
        <div className="mt-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-rose-600">
          ৳{due.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (স্বয়ংক্রিয় হিসাবকৃত বকেয়া)
        </div>
      );
    }

    // 6. Default Text Input
    return (
      <input
        type="text"
        value={String(val)}
        onChange={(e) => handleFieldChange(f, e.target.value)}
        placeholder={`Enter ${pretty(f).toLowerCase()}`}
        className="mt-1.5 w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
      />
    );
  }

  // Format cell display text in Table
  function renderCell(row: Row, f: string) {
    const raw = row[f];
    if (raw === null || raw === undefined) return "—";

    if (typeof raw === "boolean") {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
            raw ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
          }`}
        >
          {raw ? "Active" : "Inactive"}
        </span>
      );
    }

    // Friendly reference names
    if (f === "productId") {
      if (row.items) {
        try {
          const parsed = typeof row.items === "string" ? JSON.parse(row.items) : row.items;
          if (Array.isArray(parsed) && parsed.length > 0) {
            const count = parsed.length;
            const names = parsed
              .map((it: any) => it.productName || it.name || "Product")
              .slice(0, 2)
              .join(", ");
            return (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                <Package size={12} className="text-blue-500" />
                {count > 1 ? `${count} Items (${names}${parsed.length > 2 ? "..." : ""})` : names}
              </span>
            );
          }
        } catch {}
      }
      if (productMap.has(raw)) return productMap.get(raw);
    }
    if (f === "warehouseId" && warehouseMap.has(raw)) return warehouseMap.get(raw);
    if (f === "customerId" && customerMap.has(raw)) return customerMap.get(raw);
    if (f === "supplierId" && supplierMap.has(raw)) return supplierMap.get(raw);
    if (f === "salesOrderId" && orderMap.has(raw)) return orderMap.get(raw);
    if (f === "userId" && userMap.has(raw)) return userMap.get(raw);

    // Status pill
    if (f === "status" || f === "paymentStatus") {
      const s = String(raw).toUpperCase();
      const isGood = ["DELIVERED", "PAID", "APPROVED", "COMPLETED", "RESOLVED"].includes(s);
      const isWarn = ["PENDING", "PARTIAL", "IN_PROGRESS", "INSPECTING", "DRAFT"].includes(s);
      const isBad = ["CANCELLED", "REJECTED", "UNPAID", "RETURNED"].includes(s);
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide ${
            isGood
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : isWarn
              ? "bg-amber-50 text-amber-700 border border-amber-200"
              : isBad
              ? "bg-rose-50 text-rose-700 border border-rose-200"
              : "bg-blue-50 text-blue-700 border border-blue-200"
          }`}
        >
          {raw}
        </span>
      );
    }

    // Type / Direction pill
    if (f === "type") {
      const isIncoming = raw === "INCOMING" || raw === "IN";
      const isOutgoing = raw === "OUTGOING" || raw === "OUT";
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide ${
            isIncoming
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : isOutgoing
              ? "bg-rose-50 text-rose-700 border border-rose-200"
              : "bg-blue-50 text-blue-700 border border-blue-200"
          }`}
        >
          {raw}
        </span>
      );
    }

    // Live Stock badge
    if (f === "currentStock") {
      const stock = Number(raw);
      const reorder = Number(row.reorderLevel || 15);
      const unit = row.unit || "pcs";
      if (stock <= 0) {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            ❌ 0 {unit} (Out of Stock)
          </span>
        );
      }
      if (stock <= reorder) {
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            ⚠️ {stock.toLocaleString()} {unit} (Low Stock)
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          📦 {stock.toLocaleString()} {unit}
        </span>
      );
    }

    // Date formatting
    if (dateFields.includes(f)) {
      try {
        return new Date(raw).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      } catch {}
    }

    // Due amount formatting
    if (f === "dueAmount") {
      const due = Number(raw || 0);
      if (due > 0) {
        return (
          <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            ৳{due.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        );
      }
      return (
        <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px] font-semibold">
          ৳0.00
        </span>
      );
    }

    // Paid amount formatting
    if (f === "paidAmount") {
      const paid = Number(raw || 0);
      return (
        <span className="font-mono font-semibold text-emerald-700">
          ৳{paid.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      );
    }

    // Currency or Decimal numbers
    if (["total", "unitPrice", "sellingPrice", "costPrice", "taxableAmount", "vatAmount", "openingBalance", "creditLimit", "amount", "refundAmount", "paidAmount", "dueAmount"].includes(f) && !isNaN(Number(raw))) {
      return `৳${Number(raw).toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    if (numberFields.includes(f) && !isNaN(Number(raw))) {
      return Number(raw).toLocaleString();
    }

    return String(raw);
  }

  function renderQuickAddModal() {
    if (!quickAddType) return null;

    return (
      <div className="fixed inset-0 bg-slate-950/60 z-60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Plus size={15} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {quickAddType === "product" && "+ Add New Product (নতুন পণ্য)"}
                  {quickAddType === "customer" && "+ Add New Customer (নতুন গ্রাহক)"}
                  {quickAddType === "supplier" && "+ Add New Supplier (নতুন সরবরাহকারী)"}
                  {quickAddType === "warehouse" && "+ Add New Warehouse (নতুন গুদাম)"}
                  {quickAddType === "category" && "+ Add New Category (নতুন ক্যাটাগরি)"}
                  {quickAddType === "customerType" && "+ Add Customer Type (নতুন গ্রাহক ধরন)"}
                </h3>
                <p className="text-[10.5px] text-slate-400">
                  Quickly add and immediately select into your active form.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setQuickAddType(null)}
              className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Quick Add Form Body */}
          <form onSubmit={handleQuickAddSubmit} className="p-5 space-y-3">
            {quickAddType === "product" && (
              <>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Product Name (পণ্যের নাম) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tomato Ketchup 350g"
                    value={quickForm.name || ""}
                    onChange={(e) => setQuickForm({ ...quickForm, name: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      SKU Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={quickForm.sku || ""}
                      onChange={(e) => setQuickForm({ ...quickForm, sku: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Category</label>
                    <select
                      value={quickForm.category || "Sauces"}
                      onChange={(e) => setQuickForm({ ...quickForm, category: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-xl px-2.5 py-2 outline-none focus:border-blue-500 bg-white cursor-pointer"
                    >
                      {dropdownOptions.category.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.value}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Selling Price (৳)</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={quickForm.sellingPrice ?? 150}
                      onChange={(e) => setQuickForm({ ...quickForm, sellingPrice: Number(e.target.value) })}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Cost Price (৳)</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={quickForm.costPrice ?? 110}
                      onChange={(e) => setQuickForm({ ...quickForm, costPrice: Number(e.target.value) })}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Unit</label>
                    <input
                      type="text"
                      value={quickForm.unit || "bottle"}
                      onChange={(e) => setQuickForm({ ...quickForm, unit: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </>
            )}

            {quickAddType === "customer" && (
              <>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Customer Name (গ্রাহকের নাম) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shwapno Supermarket"
                    value={quickForm.name || ""}
                    onChange={(e) => setQuickForm({ ...quickForm, name: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Phone</label>
                    <input
                      type="text"
                      placeholder="017xxxxxxxx"
                      value={quickForm.phone || ""}
                      onChange={(e) => setQuickForm({ ...quickForm, phone: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700">Type</label>
                      <button
                        type="button"
                        onClick={() => openQuickAdd("customerType")}
                        title="Add new customer type"
                        className="text-[10px] text-blue-600 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus size={11} /> New Type
                      </button>
                    </div>
                    <select
                      value={quickForm.customerType || "RETAIL"}
                      onChange={(e) => setQuickForm({ ...quickForm, customerType: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-xl px-2.5 py-2 outline-none focus:border-blue-500 bg-white cursor-pointer"
                    >
                      {dropdownOptions.customerType.map((ct) => (
                        <option key={ct.value} value={ct.value}>
                          {ct.label || ct.value}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Address</label>
                  <input
                    type="text"
                    placeholder="Dhaka, Bangladesh"
                    value={quickForm.address || ""}
                    onChange={(e) => setQuickForm({ ...quickForm, address: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>
              </>
            )}

            {quickAddType === "supplier" && (
              <>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Supplier Name (সরবরাহকারী প্রতিষ্ঠান) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Meghna Agro Supplies Ltd"
                    value={quickForm.name || ""}
                    onChange={(e) => setQuickForm({ ...quickForm, name: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Phone</label>
                    <input
                      type="text"
                      placeholder="018xxxxxxxx"
                      value={quickForm.phone || ""}
                      onChange={(e) => setQuickForm({ ...quickForm, phone: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">BIN Number</label>
                    <input
                      type="text"
                      placeholder="BIN-xxxxxx"
                      value={quickForm.bin || ""}
                      onChange={(e) => setQuickForm({ ...quickForm, bin: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Address</label>
                  <input
                    type="text"
                    placeholder="Tejgaon Industrial Area, Dhaka"
                    value={quickForm.address || ""}
                    onChange={(e) => setQuickForm({ ...quickForm, address: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>
              </>
            )}

            {quickAddType === "warehouse" && (
              <>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Warehouse Name (গুদামের নাম) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Uttara Cold Storage"
                    value={quickForm.name || ""}
                    onChange={(e) => setQuickForm({ ...quickForm, name: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Warehouse Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="WH-05"
                    value={quickForm.code || ""}
                    onChange={(e) => setQuickForm({ ...quickForm, code: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Address / Location</label>
                  <input
                    type="text"
                    placeholder="Plot 12, Sector 4, Uttara, Dhaka"
                    value={quickForm.address || ""}
                    onChange={(e) => setQuickForm({ ...quickForm, address: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>
              </>
            )}

            {quickAddType === "category" && (
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Category Name (ক্যাটাগরির নাম) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dairy & Frozen"
                  value={quickForm.name || ""}
                  onChange={(e) => setQuickForm({ ...quickForm, name: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>
            )}

            {quickAddType === "customerType" && (
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Customer Type Name (গ্রাহকের নতুন ধরন) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Supermarket, Departmental Store, Institutional..."
                  value={quickForm.name || ""}
                  onChange={(e) => setQuickForm({ ...quickForm, name: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  This type will be automatically added to the customer category dropdowns.
                </p>
              </div>
            )}

            {quickError && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {quickError}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setQuickAddType(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={quickSubmitting}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Plus size={14} />
                {quickSubmitting ? "Saving..." : "Save & Select (সংরক্ষণ ও নির্বাচন)"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Dedicated Full-Page View for Sales & Purchase Multi-Item Orders
  if (isOrderBuilderOpen && (path === "sales/orders" || path === "purchase/orders")) {
    return (
      <div className="space-y-6">
        <OrderBuilder
          type={path.includes("sales") ? "sales" : "purchase"}
          onBack={() => {
            setIsOrderBuilderOpen(false);
            setOrderBuilderRecord(null);
          }}
          onSaved={async () => {
            setIsOrderBuilderOpen(false);
            setOrderBuilderRecord(null);
            setNotice(
              path.includes("sales")
                ? "সেলস অর্ডার সফলভাবে সংরক্ষিত ও ইনভেন্টরি স্টক আপডেট করা হয়েছে!"
                : "পারচেজ অর্ডার সফলভাবে সংরক্ষিত ও ইনভেন্টরি স্টক আপডেট করা হয়েছে!"
            );
            load();
            fetch("/api/products?limit=500")
              .then((r) => r.json())
              .then((j) => {
                if (j.data) setRefs((prev) => ({ ...prev, products: j.data }));
              })
              .catch(() => {});
          }}
          initialData={orderBuilderRecord}
          products={refs.products}
          customers={refs.customers}
          suppliers={refs.suppliers}
          onQuickAddProduct={() => openQuickAdd("product")}
          onQuickAddCustomer={() => openQuickAdd("customer")}
          onQuickAddSupplier={() => openQuickAdd("supplier")}
        />

        {renderQuickAddModal()}
      </div>
    );
  }

  // Dedicated Full-Page View for Sales Return Management
  if (isReturnBuilderOpen || path === "returns/create") {
    return (
      <div className="space-y-6">
        <SalesReturnBuilder
          onBack={() => {
            setIsReturnBuilderOpen(false);
            setReturnBuilderRecord(null);
          }}
          onSuccess={async () => {
            setIsReturnBuilderOpen(false);
            setReturnBuilderRecord(null);
            setNotice("সেলস রিটার্ন রেকর্ড সফলভাবে সংরক্ষিত ও ইনভেন্টরি/একাউন্টস সমন্বিত হয়েছে!");
            load();
            fetch("/api/products?limit=500")
              .then((r) => r.json())
              .then((j) => {
                if (j.data) setRefs((prev) => ({ ...prev, products: j.data }));
              })
              .catch(() => {});
          }}
          initialData={returnBuilderRecord}
          salesOrders={refs.salesOrders}
          products={refs.products}
          customers={refs.customers}
        />
      </div>
    );
  }

  return (
    <>
      <div className={`space-y-6 ${invoiceModalOpen || printModalOpen ? "print:hidden" : ""}`}>
        {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400 mb-1">
            Workspace / {page.group} / {page.title}
          </div>
          <h1 className="text-2xl md:text-[28px] font-bold tracking-tight text-slate-900">{page.title}</h1>
          <p className="text-sm text-slate-500 mt-1">{page.description}. Manage and review your business records.</p>
        </div>
        <div className="flex gap-2">
          {(resource === "vat-transactions" || path.startsWith("vat/")) && (
            <button
              onClick={() => {
                setPrintRecord(rows[0] || null);
                setPrintMode("invoice");
                setPrintModalOpen(true);
              }}
              className="bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 rounded-lg px-3 py-2 text-sm font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            >
              <Printer size={15} className="text-emerald-600" /> মূসক-৬.৩ চালান প্রিন্ট
            </button>
          )}
          {(resource === "products" || path === "products") && (
            <button
              onClick={() => setBulkImportOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3.5 py-2 text-sm font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <FileSpreadsheet size={16} /> এক্সেল ইম্পোর্ট (Bulk Import)
            </button>
          )}
          <button
            onClick={exportCsv}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-2 hover:bg-slate-50 transition shadow-2xs"
          >
            <Download size={15} /> Export CSV
          </button>
          <button
            onClick={load}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm flex items-center gap-2 hover:bg-slate-50 transition shadow-2xs"
          >
            <RefreshCw size={15} /> Refresh
          </button>
          {resource && (
            <button
              onClick={startCreate}
              className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition shadow-xs"
            >
              <Plus size={16} /> Add New
            </button>
          )}
        </div>
      </div>

      {notice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg px-4 py-3 text-sm flex justify-between items-center animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice("")} className="text-emerald-600 hover:text-emerald-900">
            <X size={15} />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-lg px-4 py-3 text-sm flex justify-between items-center animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError("")} className="text-rose-600 hover:text-rose-900">
            <X size={15} />
          </button>
        </div>
      )}

      {/* KPI Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{s.label}</div>
            <div className="text-2xl font-bold mt-2 text-slate-900">{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</div>
            <div className="text-[11px] text-slate-400 mt-1">{(s as any).subtext || (i === 0 ? "Total in current view" : "Based on operational criteria")}</div>
          </div>
        ))}
      </div>

      {/* Main Table Card */}
      <section className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 md:p-5 border-b border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-sm text-slate-900">Records</h2>
                {appliedFilterCount > 0 && (
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {appliedFilterCount} Filter{appliedFilterCount > 1 ? "s" : ""} Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Filter, search, inspect and manage {page.title.toLowerCase()}.</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 min-w-0 w-full sm:w-60 bg-slate-50/50">
                <Search size={14} className="text-slate-400 shrink-0" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search records..."
                  className="outline-none text-xs w-full bg-transparent placeholder-slate-400"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600">
                    <X size={13} />
                  </button>
                )}
              </div>

              {filterConfigs.length > 0 && (
                <button
                  onClick={() => setFilterBarOpen(!filterBarOpen)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer shrink-0 ${
                    appliedFilterCount > 0 || filterBarOpen
                      ? "bg-blue-50 text-blue-700 border-blue-300"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Filter size={14} />
                  <span>Filters</span>
                  {appliedFilterCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                      {appliedFilterCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Interactive Relevant Filter Bar */}
          {filterConfigs.length > 0 && filterBarOpen && (
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Filter size={12} /> Filter:
              </span>
              {filterConfigs.map((fc) => (
                <div key={fc.key} className="flex items-center gap-1.5">
                  <select
                    value={activeFilters[fc.key] || "ALL"}
                    onChange={(e) => setActiveFilters((prev) => ({ ...prev, [fc.key]: e.target.value }))}
                    className={`text-xs border rounded-lg px-2.5 py-1.5 outline-none font-medium cursor-pointer transition ${
                      activeFilters[fc.key] && activeFilters[fc.key] !== "ALL"
                        ? "bg-blue-50 text-blue-700 border-blue-300 font-bold"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {fc.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              {appliedFilterCount > 0 && (
                <button
                  onClick={() => setActiveFilters({})}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-rose-50 transition cursor-pointer"
                >
                  <X size={13} /> Reset Filters
                </button>
              )}
            </div>
          )}
        </div>

        {resource ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/95 backdrop-blur-xs text-[11px] uppercase tracking-wider text-slate-500 sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  {fields.map((f) => (
                    <th key={f} className="px-5 py-3 font-semibold whitespace-nowrap">
                      {pretty(f)}
                    </th>
                  ))}
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={fields.length + 1} className="text-center py-14 text-slate-400">
                      <RefreshCw size={20} className="animate-spin mx-auto mb-2 opacity-50" />
                      Loading records...
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={fields.length + 1} className="text-center py-14">
                      <div className="font-medium text-slate-700">No records found</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {appliedFilterCount > 0
                          ? "No records match the active filter criteria. Try resetting filters."
                          : "Add your first record to get started."}
                      </div>
                      {appliedFilterCount > 0 && (
                        <button
                          onClick={() => setActiveFilters({})}
                          className="mt-3 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition inline-block"
                        >
                          Clear Filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      {fields.map((f) => (
                        <td key={f} className="px-5 py-3.5 whitespace-nowrap text-slate-700 max-w-[240px] truncate text-xs font-medium">
                          {renderCell(row, f)}
                        </td>
                      ))}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* 1. View Invoice Button (with Eye icon for both Sales and Purchase Orders) */}
                          {(resource === "sales-orders" || resource === "purchase-orders") && (
                            <button
                              onClick={() => {
                                setInvoiceRecord(row);
                                setInvoiceModalOpen(true);
                              }}
                              title={
                                resource === "sales-orders"
                                  ? "গ্রাহকের বিক্রয় চালান / ইনভয়েস দেখুন ও প্রিন্ট করুন (View Sales Invoice)"
                                  : "সরবরাহকারীর ক্রয় চালান / বিল ভাউচার দেখুন ও প্রিন্ট করুন (View Purchase Order Invoice)"
                              }
                              className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600 transition cursor-pointer"
                            >
                              <Eye size={15} />
                            </button>
                          )}

                          {/* 2. Official Bangladesh NBR Mushak 6.3 Tax Invoice */}
                          {(resource === "vat-transactions" || resource === "sales-orders") && (
                            <button
                              onClick={() => {
                                setPrintRecord(row);
                                setPrintMode("invoice");
                                setPrintModalOpen(true);
                              }}
                              title="প্রিন্ট মূসক-৬.৩ চালান (NBR VAT Tax Invoice)"
                              className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-600 transition cursor-pointer"
                            >
                              <Printer size={15} />
                            </button>
                          )}

                          {/* 3. Chronological Workflow & Payment Status Updater */}
                          {(resource === "sales-orders" || resource === "purchase-orders") && (
                            <button
                              onClick={() => {
                                setStatusModalRecord(row);
                                setStatusModalOpen(true);
                              }}
                              title="স্ট্যাটাস ও পেমেন্ট আপডেট করুন (Workflow Status & Payment)"
                              className="p-1.5 rounded-md hover:bg-amber-50 text-amber-600 transition cursor-pointer"
                            >
                              <Truck size={15} />
                            </button>
                          )}

                          {/* 4. Edit Order (Locked if not DRAFT) */}
                          <button
                            onClick={() => {
                              if ((resource === "sales-orders" || resource === "purchase-orders") && String(row.status || "").toUpperCase() !== "DRAFT") {
                                setStatusModalRecord(row);
                                setStatusModalOpen(true);
                              } else {
                                startEdit(row);
                              }
                            }}
                            title={
                              (resource === "sales-orders" || resource === "purchase-orders") && String(row.status || "").toUpperCase() !== "DRAFT"
                                ? "অর্ডার কনফার্মড - পণ্য তালিকা লক করা। স্ট্যাটাস ও পেমেন্ট আপডেট করুন।"
                                : "Edit Record (সম্পাদনা করুন)"
                            }
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                          >
                            {(resource === "sales-orders" || resource === "purchase-orders") && String(row.status || "").toUpperCase() !== "DRAFT" ? (
                              <Lock size={15} className="text-slate-400" />
                            ) : (
                              <Pencil size={15} />
                            )}
                          </button>

                          <button
                            onClick={() => remove(row)}
                            title="Delete"
                            className="p-1.5 rounded-md hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 md:p-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers size={22} />
            </div>
            <h3 className="font-semibold mt-4 text-slate-800">Workspace ready</h3>
            <p className="text-sm text-slate-500 max-w-lg mx-auto mt-2">
              This screen is included in the 58-page navigation.
            </p>
          </div>
        )}

        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
          <span>
            Showing {filteredRows.length} of {rows.length} records
            {appliedFilterCount > 0 ? " (Filtered)" : ""}
          </span>
          <span>Page 1 of 1</span>
        </div>
      </section>

      {/* Modal Dialog for Create & Edit with Form Dropdowns */}
      {open && (
        <div className="fixed inset-0 bg-slate-950/50 z-50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editing ? "Edit" : "Create"} {page.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Select options from dropdowns or enter details below.</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Fields */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-[62vh]">
              {fields.map((f) => (
                <div
                  key={f}
                  className={`min-w-0 ${
                    f === "productId" || f === "notes" || f === "address"
                      ? "sm:col-span-2"
                      : "sm:col-span-1"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-700">{pretty(f)}</span>
                    {(dropdownOptions[f] ||
                      f === "status" ||
                      f === "productId" ||
                      f === "warehouseId" ||
                      f === "customerId" ||
                      f === "supplierId" ||
                      f === "salesOrderId" ||
                      f === "userId") && (
                      <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">
                        Searchable
                      </span>
                    )}
                  </div>
                  {renderFormField(f)}
                </div>
              ))}
            </div>

            {error && <div className="px-6 py-2 text-xs text-rose-600 bg-rose-50 border-t border-rose-100">{error}</div>}

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div>
                {(resource === "vat-transactions" || resource === "sales-orders") && (
                  <button
                    type="button"
                    onClick={() => {
                      setPrintRecord(form);
                      setPrintMode("invoice");
                      setPrintModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
                  >
                    <Printer size={14} className="text-emerald-600" /> মূসক-৬.৩ চালান প্রিন্ট
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={save}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold flex items-center gap-2 hover:bg-blue-700 transition shadow-xs"
                >
                  <Save size={14} /> Save Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Quick Add Modal (Opens seamlessly over any dropdown + button) */}
      {renderQuickAddModal()}

      {/* Official Bangladesh NBR Mushak Print Modal */}
      <MushakPrintModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        record={printRecord}
        registerRecords={rows}
        mode={printMode}
        title={page.title}
        customer={
          printRecord?.customerId
            ? refs.customers.find((c) => c.id === printRecord.customerId)
            : null
        }
        products={refs.products}
      />

      {/* Customer Commercial Sales / Purchase Invoice Modal */}
      <CustomerInvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        order={invoiceRecord}
        customer={
          invoiceRecord?.customerId
            ? refs.customers.find((c) => c.id === invoiceRecord.customerId)
            : null
        }
        supplier={
          invoiceRecord?.supplierId
            ? refs.suppliers.find((s) => s.id === invoiceRecord.supplierId)
            : null
        }
        products={refs.products}
        type={resource === "purchase-orders" || invoiceRecord?.orderNo?.startsWith("PO-") ? "purchase" : "sales"}
      />

      {/* Chronological Status & Payment Updater Modal */}
      <OrderStatusPaymentModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        order={statusModalRecord}
        resource={resource === "purchase-orders" ? "purchase-orders" : "sales-orders"}
        partyName={
          statusModalRecord
            ? resource === "purchase-orders"
              ? refs.suppliers.find((s) => s.id === statusModalRecord.supplierId)?.name
              : refs.customers.find((c) => c.id === statusModalRecord.customerId)?.name
            : undefined
        }
        onUpdated={async () => {
          setNotice("অর্ডার স্ট্যাটাস ও পেমেন্ট সফলভাবে আপডেট করা হয়েছে এবং অ্যাকাউন্ট লেজারে প্রতিফলিত হয়েছে!");
          await load();
          fetch("/api/products?limit=500")
            .then((r) => r.json())
            .then((j) => {
              if (j.data) setRefs((prev) => ({ ...prev, products: j.data }));
            })
            .catch(() => {});
        }}
      />

      {/* Bulk Product Excel Import Modal */}
      <ProductBulkImportModal
        isOpen={bulkImportOpen}
        onClose={() => setBulkImportOpen(false)}
        onSuccess={async (summary) => {
          setNotice(
            `এক্সেল শীট হতে ${summary.created}টি নতুন পণ্য তৈরি ও ${summary.updated}টি পণ্য সফলভাবে হালনাগাদ করা হয়েছে!`
          );
          await load();
          fetch("/api/products?limit=500")
            .then((r) => r.json())
            .then((j) => {
              if (j.data) setRefs((prev) => ({ ...prev, products: j.data }));
            })
            .catch(() => {});
        }}
      />
    </>
  );
}
