import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resourceConfig } from "@/lib/resource-config";
import { hashPassword, getSessionUser } from "@/lib/auth";
import { handleERPLifecycle } from "@/lib/erp-lifecycle";
import { canAccessResource } from "@/lib/permissions";

type Ctx = { params: Promise<{ resource: string[] }> };

function resolve(resource: string[]) {
  const parts = [...resource];
  const last = parts[parts.length - 1];
  const isItem = parts.length > 1 && !resourceConfig[parts.join("-")];
  const id = isItem ? parts.pop()! : undefined;
  const key = parts.join("-");
  const cfg = resourceConfig[key];
  return { id, key, cfg, model: cfg ? ((prisma as any)[cfg.model] as any) : null };
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
];
const boolFields = ["isActive"];

function cleanData(key: string, body: Record<string, any>) {
  const allowed = resourceConfig[key]?.fields || [];
  const result: Record<string, any> = {};

  for (const [k, v] of Object.entries(body)) {
    if (!allowed.includes(k) || v === undefined || v === null || v === "") continue;

    if (dateFields.includes(k)) {
      const d = new Date(v);
      result[k] = isNaN(d.getTime()) ? new Date() : d;
    } else if (numberFields.includes(k)) {
      const num = Number(v);
      result[k] = isNaN(num) ? v : num;
    } else if (boolFields.includes(k)) {
      result[k] = v === true || v === "true" || v === 1 || v === "1";
    } else {
      result[k] = v;
    }
  }

  return result;
}

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const { resource } = await params;
    const { id, key, model } = resolve(resource);
    if (!model) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });

    const token = req.cookies.get("food_erp_token")?.value;
    const sessionUser = await getSessionUser(token);
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!canAccessResource(sessionUser, key, false)) {
      return NextResponse.json(
        { error: `Access denied. You do not have permission to view ${key}.` },
        { status: 403 }
      );
    }

    if (id) {
      try {
        const item = await model.findUnique({ where: { id } });
        if (!item) return NextResponse.json({ error: "Record not found" }, { status: 404 });
        if (key === "users" && item.passwordHash) {
          const { passwordHash, ...safe } = item;
          return NextResponse.json({ data: safe });
        }
        return NextResponse.json({ data: item });
      } catch {
        return NextResponse.json({ error: "Record not found" }, { status: 404 });
      }
    }

    const q = req.nextUrl.searchParams.get("q") || "";
    const searchable = (resourceConfig[key]?.fields || []).filter((f) =>
      ["name", "sku", "orderNo", "returnNo", "transactionNo", "trackingCode", "provider", "email", "phone"].includes(f)
    );

    let whereClause = {};
    if (q && searchable.length > 0) {
      whereClause = {
        OR: searchable.map((f) => ({ [f]: { contains: q } })),
      };
    }

    try {
      let rows = await model.findMany({
        take: 200,
        orderBy: { createdAt: "desc" },
        where: whereClause,
      });
      if (key === "users") {
        rows = rows.map(({ passwordHash, ...safe }: any) => safe);
      }
      return NextResponse.json({ data: rows });
    } catch {
      // Fallback if model has no createdAt
      let rows = await model.findMany({
        take: 200,
        where: whereClause,
      });
      if (key === "users") {
        rows = rows.map(({ passwordHash, ...safe }: any) => safe);
      }
      return NextResponse.json({ data: rows });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch records" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const { resource } = await params;
    const { key, model } = resolve(resource);
    if (!model) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });

    const token = req.cookies.get("food_erp_token")?.value;
    const sessionUser = await getSessionUser(token);
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!canAccessResource(sessionUser, key, true)) {
      return NextResponse.json(
        { error: `Access denied. You do not have permission to create ${key}.` },
        { status: 403 }
      );
    }

    const body = await req.json();
    const data = cleanData(key, body);

    if (key === "users") {
      if (body.password && typeof body.password === "string" && body.password.trim()) {
        data.passwordHash = await hashPassword(body.password.trim());
      } else {
        data.passwordHash = await hashPassword("ChangeMe123!");
      }
      delete data.password;
      if (!data.role) data.role = "STAFF";
      if (data.isActive === undefined) data.isActive = true;
    }

    if (key === "sales-orders") {
      let items: any[] = [];
      try {
        if (body.items) {
          items = Array.isArray(body.items) ? body.items : JSON.parse(body.items);
        }
      } catch {}

      if (items.length > 0) {
        for (const item of items) {
          if (!item.productId) continue;
          const prod = await prisma.product.findUnique({ where: { id: item.productId } });
          if (!prod) {
            return NextResponse.json({ error: `Selected product "${item.productName || item.productId}" does not exist` }, { status: 400 });
          }
          const available = Number(prod.currentStock || 0);
          const requested = Number(item.quantity || 0);
          if (requested <= 0) {
            return NextResponse.json({ error: `Quantity for "${prod.name}" must be at least 1` }, { status: 400 });
          }
          if (available <= 0) {
            return NextResponse.json(
              { error: `Item "${prod.name}" is OUT OF STOCK (Available: 0 ${prod.unit}). Cannot order.` },
              { status: 400 }
            );
          }
          if (requested > available) {
            return NextResponse.json(
              { error: `Insufficient stock for "${prod.name}". Available: ${available} ${prod.unit}, but requested: ${requested} ${prod.unit}. Cannot exceed available stock.` },
              { status: 400 }
            );
          }
        }
        data.items = JSON.stringify(items);
        data.productId = items[0].productId;
        data.quantity = items.reduce((sum: number, it: any) => sum + Number(it.quantity || 0), 0);
        data.unitPrice = items[0].unitPrice;
        data.total = items.reduce((sum: number, it: any) => sum + (Number(it.quantity || 0) * Number(it.unitPrice || 0)), 0);
      } else if (data.productId) {
        const prod = await prisma.product.findUnique({ where: { id: data.productId } });
        if (!prod) {
          return NextResponse.json({ error: "Selected product does not exist" }, { status: 400 });
        }
        const available = Number(prod.currentStock || 0);
        const requested = Number(data.quantity || 0);
        if (requested <= 0) {
          return NextResponse.json({ error: "Order quantity must be at least 1" }, { status: 400 });
        }
        if (available <= 0) {
          return NextResponse.json(
            { error: `Item "${prod.name}" is OUT OF STOCK (Available: 0 ${prod.unit}). Cannot order.` },
            { status: 400 }
          );
        }
        if (requested > available) {
          return NextResponse.json(
            { error: `Insufficient stock for "${prod.name}". Available: ${available} ${prod.unit}, but requested: ${requested} ${prod.unit}. Cannot exceed available stock.` },
            { status: 400 }
          );
        }
      }

      // Initial Payment and VAT calculations
      const totalAmount = Number(data.total || 0);
      if (data.paymentStatus === "PAID") {
        data.paidAmount = totalAmount;
        data.dueAmount = 0;
      } else if (data.paymentStatus === "PARTIAL") {
        const paid = Number(body.paidAmount || 0);
        data.paidAmount = paid;
        data.dueAmount = Math.max(0, totalAmount - paid);
      } else {
        data.paymentStatus = "UNPAID";
        data.paidAmount = 0;
        data.dueAmount = totalAmount;
      }

      if (body.vatPaid !== undefined) data.vatPaid = Boolean(body.vatPaid);
      if (body.vatAmount !== undefined) {
        data.vatAmount = Number(body.vatAmount);
      } else if (body.applyVat) {
        data.vatAmount = Number((totalAmount * 0.15).toFixed(2));
      }
    }

    if (key === "purchase-orders") {
      let items: any[] = [];
      try {
        if (body.items) {
          items = Array.isArray(body.items) ? body.items : JSON.parse(body.items);
        }
      } catch {}

      if (items.length > 0) {
        data.items = JSON.stringify(items);
        data.productId = items[0].productId;
        data.quantity = items.reduce((sum: number, it: any) => sum + Number(it.quantity || 0), 0);
        data.unitPrice = items[0].unitPrice;
        data.total = items.reduce((sum: number, it: any) => sum + (Number(it.quantity || 0) * Number(it.unitPrice || 0)), 0);
      }

      const totalAmount = Number(data.total || 0);
      if (data.paymentStatus === "PAID") {
        data.paidAmount = totalAmount;
        data.dueAmount = 0;
      } else if (data.paymentStatus === "PARTIAL") {
        const paid = Number(body.paidAmount || 0);
        data.paidAmount = paid;
        data.dueAmount = Math.max(0, totalAmount - paid);
      } else {
        data.paymentStatus = "UNPAID";
        data.paidAmount = 0;
        data.dueAmount = totalAmount;
      }
    }

    const record = await model.create({ data });
    await handleERPLifecycle(key, record);
    if (key === "users" && record.passwordHash) {
      const { passwordHash, ...safe } = record;
      return NextResponse.json({ data: safe }, { status: 201 });
    }
    return NextResponse.json({ data: record }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Could not create record. Check required fields and unique values." },
      { status: 400 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const { resource } = await params;
    const { id, key, model } = resolve(resource);
    if (!id || !model) return NextResponse.json({ error: "Record not found" }, { status: 404 });

    const token = req.cookies.get("food_erp_token")?.value;
    const sessionUser = await getSessionUser(token);
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!canAccessResource(sessionUser, key, true)) {
      return NextResponse.json(
        { error: `Access denied. You do not have permission to modify ${key}.` },
        { status: 403 }
      );
    }

    const body = await req.json();
    const data = cleanData(key, body);

    const existing = await model.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Record not found" }, { status: 404 });

    if (key === "users") {
      if (body.password && typeof body.password === "string" && body.password.trim().length > 0) {
        data.passwordHash = await hashPassword(body.password.trim());
      }
      delete data.password;
    }

    // 1. Sales Order Protection: Lock item editing after confirmation, enforce chronological status, calculate payments
    if (key === "sales-orders") {
      const isConfirmed = String(existing.status).toUpperCase() !== "DRAFT";
      if (isConfirmed) {
        const hasCoreChange =
          body.items !== undefined ||
          (body.productId !== undefined && body.productId !== existing.productId) ||
          (body.quantity !== undefined && Number(body.quantity) !== Number(existing.quantity)) ||
          (body.unitPrice !== undefined && Number(body.unitPrice) !== Number(existing.unitPrice)) ||
          (body.total !== undefined && Number(body.total) !== Number(existing.total)) ||
          (body.customerId !== undefined && body.customerId !== existing.customerId);

        if (hasCoreChange) {
          return NextResponse.json({
            error: "অর্ডার চূড়ান্ত/কনফার্ম হওয়ার পর পণ্য তালিকা, পরিমাণ বা মূল্য পরিবর্তন লক করা হয়েছে। শুধুমাত্র ডেলিভারি ও পেমেন্ট স্ট্যাটাস আপডেট করা যাবে।"
          }, { status: 400 });
        }
      }

      // Chronological status transition check
      if (data.status && data.status !== existing.status) {
        const allowedTransitions: Record<string, string[]> = {
          DRAFT: ["CONFIRMED", "CANCELLED"],
          CONFIRMED: ["PROCESSING", "CANCELLED"],
          PROCESSING: ["DISPATCHED", "DELIVERED"],
          DISPATCHED: ["DELIVERED"],
          DELIVERED: [],
          CANCELLED: [],
        };
        const allowed = allowedTransitions[existing.status] || [];
        if (!allowed.includes(data.status)) {
          return NextResponse.json({
            error: `স্ট্যাটাস শুধুমাত্র ধারাবাহিক ক্রমানুসারে (Chronological Order) পরিবর্তন করা যাবে: DRAFT → CONFIRMED → PROCESSING → DISPATCHED → DELIVERED। (${existing.status} হতে ${data.status}-এ পরিবর্তন গ্রহণযোগ্য নয়)`
          }, { status: 400 });
        }
      }

      // Payment & Due calculations
      const tot = Number(existing.total || 0);
      if (data.paymentStatus === "PAID") {
        data.paidAmount = tot;
        data.dueAmount = 0;
      } else if (data.paymentStatus === "UNPAID") {
        data.paidAmount = 0;
        data.dueAmount = tot;
      } else if (data.paymentStatus === "PARTIAL") {
        const p = Number(data.paidAmount !== undefined ? data.paidAmount : (existing.paidAmount || 0));
        if (p <= 0) {
          return NextResponse.json({ error: "আংশিক পেমেন্টের জন্য পরিশোধিত টাকা (Paid Amount) উল্লেখ করতে হবে।" }, { status: 400 });
        }
        if (p > tot) {
          return NextResponse.json({ error: `পরিশোধিত টাকা (৳${p}) মোট বিলের (৳${tot}) চেয়ে বেশি হতে পারে না।` }, { status: 400 });
        }
        data.paidAmount = p;
        data.dueAmount = Math.max(0, tot - p);
      } else if (data.paidAmount !== undefined) {
        const p = Number(data.paidAmount);
        if (p >= tot) {
          data.paymentStatus = "PAID";
          data.paidAmount = tot;
          data.dueAmount = 0;
        } else if (p > 0) {
          data.paymentStatus = "PARTIAL";
          data.paidAmount = p;
          data.dueAmount = Math.max(0, tot - p);
        } else {
          data.paymentStatus = "UNPAID";
          data.paidAmount = 0;
          data.dueAmount = tot;
        }
      }

      if (body.vatPaid !== undefined) data.vatPaid = Boolean(body.vatPaid);
    }

    // 2. Purchase Order Protection: Lock item editing after confirmation, enforce chronological status, calculate payments
    if (key === "purchase-orders") {
      const isConfirmed = String(existing.status).toUpperCase() !== "DRAFT";
      if (isConfirmed) {
        const hasCoreChange =
          body.items !== undefined ||
          (body.productId !== undefined && body.productId !== existing.productId) ||
          (body.quantity !== undefined && Number(body.quantity) !== Number(existing.quantity)) ||
          (body.unitPrice !== undefined && Number(body.unitPrice) !== Number(existing.unitPrice)) ||
          (body.total !== undefined && Number(body.total) !== Number(existing.total)) ||
          (body.supplierId !== undefined && body.supplierId !== existing.supplierId);

        if (hasCoreChange) {
          return NextResponse.json({
            error: "পারচেজ অর্ডার চূড়ান্ত হওয়ার পর পণ্য বা দর পরিবর্তন লক করা হয়েছে। শুধুমাত্র স্ট্যাটাস ও পেমেন্ট আপডেট করা যাবে।"
          }, { status: 400 });
        }
      }

      // Chronological status transition check
      if (data.status && data.status !== existing.status) {
        const allowedTransitions: Record<string, string[]> = {
          DRAFT: ["PENDING_APPROVAL", "CANCELLED"],
          PENDING_APPROVAL: ["APPROVED", "CANCELLED"],
          APPROVED: ["RECEIVED"],
          RECEIVED: ["COMPLETED"],
          COMPLETED: [],
          CANCELLED: [],
        };
        const allowed = allowedTransitions[existing.status] || [];
        if (!allowed.includes(data.status)) {
          return NextResponse.json({
            error: `পারচেজ অর্ডার স্ট্যাটাস ধারাবাহিক ক্রমানুসারে আপডেট করুন: DRAFT → PENDING_APPROVAL → APPROVED → RECEIVED → COMPLETED।`
          }, { status: 400 });
        }
      }

      // Payment & Due calculations
      const tot = Number(existing.total || 0);
      if (data.paymentStatus === "PAID") {
        data.paidAmount = tot;
        data.dueAmount = 0;
      } else if (data.paymentStatus === "UNPAID") {
        data.paidAmount = 0;
        data.dueAmount = tot;
      } else if (data.paymentStatus === "PARTIAL") {
        const p = Number(data.paidAmount !== undefined ? data.paidAmount : (existing.paidAmount || 0));
        data.paidAmount = p;
        data.dueAmount = Math.max(0, tot - p);
      } else if (data.paidAmount !== undefined) {
        const p = Number(data.paidAmount);
        if (p >= tot) {
          data.paymentStatus = "PAID";
          data.paidAmount = tot;
          data.dueAmount = 0;
        } else if (p > 0) {
          data.paymentStatus = "PARTIAL";
          data.paidAmount = p;
          data.dueAmount = Math.max(0, tot - p);
        } else {
          data.paymentStatus = "UNPAID";
          data.paidAmount = 0;
          data.dueAmount = tot;
        }
      }
    }

    const record = await model.update({ where: { id }, data });
    await handleERPLifecycle(key, record);
    if (key === "users" && record.passwordHash) {
      const { passwordHash, ...safe } = record;
      return NextResponse.json({ data: safe });
    }
    return NextResponse.json({ data: record });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Record not found or invalid data" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const { resource } = await params;
    const { id, key, model } = resolve(resource);
    if (!id || !model) return NextResponse.json({ error: "Record not found" }, { status: 404 });

    const token = req.cookies.get("food_erp_token")?.value;
    const sessionUser = await getSessionUser(token);
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!canAccessResource(sessionUser, key, true)) {
      return NextResponse.json(
        { error: `Access denied. You do not have permission to delete ${key}.` },
        { status: 403 }
      );
    }

    await model.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Could not delete record; it may be referenced elsewhere." },
      { status: 409 }
    );
  }
}
