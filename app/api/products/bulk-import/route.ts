import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { canAccessResource } from "@/lib/permissions";

export interface BulkImportProductItem {
  sku: string;
  name: string;
  category?: string;
  unit?: string;
  sellingPrice?: number;
  costPrice?: number;
  currentStock?: number;
  reorderLevel?: number;
  isActive?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("food_erp_token")?.value;
    const sessionUser = await getSessionUser(token);

    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    if (!canAccessResource(sessionUser, "products", true)) {
      return NextResponse.json(
        { error: "Access denied. You do not have permission to add or import products." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const items: BulkImportProductItem[] = body.products || [];
    const updateExisting = Boolean(body.updateExisting);

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "No product items provided in the import payload." },
        { status: 400 }
      );
    }

    // Default primary warehouse for initial stock movement if any
    let defaultWarehouse = await prisma.warehouse.findFirst({
      where: { isActive: true },
    });
    if (!defaultWarehouse) {
      defaultWarehouse = await prisma.warehouse.findFirst();
    }

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors: { row: number; sku: string; error: string }[] = [];

    // Process each item safely
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const sku = String(it.sku || "").trim().toUpperCase();
      const name = String(it.name || "").trim();

      if (!sku || !name) {
        errors.push({
          row: i + 1,
          sku: sku || "EMPTY",
          error: "SKU and Product Name are required.",
        });
        skippedCount++;
        continue;
      }

      const sellingPrice = Math.max(0, Number(it.sellingPrice || 0));
      const costPrice = Math.max(0, Number(it.costPrice || 0));
      const currentStock = Math.max(0, Number(it.currentStock || 0));
      const reorderLevel = Math.max(0, Number(it.reorderLevel || 0));
      const unit = String(it.unit || "pcs").trim();
      const category = it.category ? String(it.category).trim() : "General";
      const isActive = it.isActive !== false;

      try {
        const existing = await prisma.product.findUnique({
          where: { sku },
        });

        if (existing) {
          if (updateExisting) {
            const oldStock = Number(existing.currentStock || 0);
            await prisma.product.update({
              where: { id: existing.id },
              data: {
                name,
                category,
                unit,
                sellingPrice,
                costPrice,
                reorderLevel,
                currentStock,
                isActive,
              },
            });

            // If stock changed during update, record an adjustment
            if (currentStock !== oldStock && defaultWarehouse) {
              const diff = currentStock - oldStock;
              await prisma.stockMovement.create({
                data: {
                  productId: existing.id,
                  warehouseId: defaultWarehouse.id,
                  type: diff > 0 ? "IN" : "OUT",
                  quantity: Math.abs(diff),
                  reference: "BULK-EXCEL-UPDATE",
                  notes: `Stock updated via Excel bulk import (${oldStock} -> ${currentStock} ${unit})`,
                },
              });
            }

            updatedCount++;
          } else {
            skippedCount++;
          }
        } else {
          // Create new product
          const created = await prisma.product.create({
            data: {
              sku,
              name,
              category,
              unit,
              sellingPrice,
              costPrice,
              currentStock,
              reorderLevel,
              isActive,
            },
          });

          // Record initial stock movement if starting stock > 0
          if (currentStock > 0 && defaultWarehouse) {
            await prisma.stockMovement.create({
              data: {
                productId: created.id,
                warehouseId: defaultWarehouse.id,
                type: "IN",
                quantity: currentStock,
                reference: "BULK-EXCEL-IMPORT",
                notes: `Initial opening balance created via Excel bulk import (${currentStock} ${unit})`,
              },
            });
          }

          createdCount++;
        }
      } catch (err: any) {
        errors.push({
          row: i + 1,
          sku,
          error: err.message || "Failed to process database write",
        });
        skippedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk import completed: ${createdCount} created, ${updatedCount} updated, ${skippedCount} skipped.`,
      summary: {
        total: items.length,
        created: createdCount,
        updated: updatedCount,
        skipped: skippedCount,
        errors,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Bulk product import failed" },
      { status: 500 }
    );
  }
}
