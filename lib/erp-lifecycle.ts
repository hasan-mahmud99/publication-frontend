import { prisma } from "@/lib/prisma";

export async function handleERPLifecycle(key: string, record: any) {
  try {
    // 1. BUYING PRODUCTS (PurchaseOrder):
    // Buying and receiving adds stock to inventory
    if (key === "purchase-orders") {
      const isReceived = ["RECEIVED", "COMPLETED"].includes(
        String(record.status || "").toUpperCase()
      );
      if (isReceived) {
        const defaultWh = await prisma.warehouse.findFirst({ where: { isActive: true } });
        let itemsList: any[] = [];
        try {
          if (record.items) {
            itemsList = typeof record.items === "string" ? JSON.parse(record.items) : record.items;
          }
        } catch {}

        if (Array.isArray(itemsList) && itemsList.length > 0) {
          for (let i = 0; i < itemsList.length; i++) {
            const item = itemsList[i];
            if (!item.productId || Number(item.quantity) <= 0) continue;
            const refPattern = `PO-${record.orderNo}-${i + 1}`;
            const existingMovement = await prisma.stockMovement.findFirst({
              where: { reference: { startsWith: refPattern } },
            });
            if (!existingMovement) {
              await prisma.stockMovement.create({
                data: {
                  productId: item.productId,
                  warehouseId: defaultWh?.id || null,
                  type: "IN",
                  quantity: item.quantity,
                  reference: `${refPattern} (Goods Received)`,
                  notes: `Auto-credited into inventory upon PO receipt (${item.productName || "Item"})`,
                },
              });
              await prisma.product.update({
                where: { id: item.productId },
                data: { currentStock: { increment: item.quantity } },
              });
            }
          }
        } else if (record.productId && Number(record.quantity) > 0) {
          const refPattern = `PO-${record.orderNo}`;
          const existingMovement = await prisma.stockMovement.findFirst({
            where: { reference: { startsWith: refPattern } },
          });
          if (!existingMovement) {
            await prisma.stockMovement.create({
              data: {
                productId: record.productId,
                warehouseId: defaultWh?.id || null,
                type: "IN",
                quantity: record.quantity,
                reference: `PO-${record.orderNo} (Goods Received)`,
                notes: `Auto-credited into inventory upon PO receipt`,
              },
            });
            // Update product currentStock
            await prisma.product.update({
              where: { id: record.productId },
              data: { currentStock: { increment: record.quantity } },
            });
          }
        }
      }

      // Record money outgoing (supplier payment) in Account Ledger
      const isSupplierPaid = ["PAID", "PARTIAL"].includes(
        String(record.paymentStatus || "").toUpperCase()
      );
      if (isSupplierPaid && Number(record.total) > 0) {
        const total = Number(record.total || 0);
        const targetPaid = String(record.paymentStatus).toUpperCase() === "PAID"
          ? (Number(record.paidAmount) > 0 ? Number(record.paidAmount) : total)
          : Number(record.paidAmount || 0);

        if (targetPaid > 0) {
          const existingTxs = await prisma.accountTransaction.findMany({
            where: {
              reference: String(record.orderNo),
              category: "SUPPLIER_PAYMENT",
              status: { not: "CANCELLED" },
            },
          });
          const alreadyLogged = existingTxs.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
          const deltaPayment = Number((targetPaid - alreadyLogged).toFixed(2));

          if (deltaPayment > 0) {
            const supplier = record.supplierId
              ? await prisma.supplier.findUnique({ where: { id: record.supplierId } })
              : null;
            await prisma.accountTransaction.create({
              data: {
                transactionNo: `PAY-PO-${Date.now().toString().slice(-6)}`,
                type: "OUTGOING",
                category: "SUPPLIER_PAYMENT",
                amount: deltaPayment,
                paymentMethod: "BANK_TRANSFER",
                reference: String(record.orderNo),
                partyName: supplier?.name || "Supplier",
                status: "COMPLETED",
                notes: `Supplier payment for Purchase Order ${record.orderNo}. Paid now: ৳${deltaPayment.toLocaleString("en-BD", { minimumFractionDigits: 2 })} (Total paid: ৳${targetPaid.toLocaleString("en-BD", { minimumFractionDigits: 2 })}, Due: ৳${Math.max(0, total - targetPaid).toLocaleString("en-BD", { minimumFractionDigits: 2 })})`,
              },
            });
          }
        }
      }
    }

    // 2. SELLING PRODUCTS (SalesOrder):
    // Selling and dispatching decreases stock from inventory
    if (key === "sales-orders") {
      const isDispatched = [
        "CONFIRMED",
        "PROCESSING",
        "DISPATCHED",
        "DELIVERED",
      ].includes(String(record.status || "").toUpperCase());

      if (isDispatched) {
        const defaultWh = await prisma.warehouse.findFirst({ where: { isActive: true } });
        let itemsList: any[] = [];
        try {
          if (record.items) {
            itemsList = typeof record.items === "string" ? JSON.parse(record.items) : record.items;
          }
        } catch {}

        if (Array.isArray(itemsList) && itemsList.length > 0) {
          for (let i = 0; i < itemsList.length; i++) {
            const item = itemsList[i];
            if (!item.productId || Number(item.quantity) <= 0) continue;
            const refPattern = `SO-${record.orderNo}-${i + 1}`;
            const existingMovement = await prisma.stockMovement.findFirst({
              where: { reference: { startsWith: refPattern } },
            });
            if (!existingMovement) {
              await prisma.stockMovement.create({
                data: {
                  productId: item.productId,
                  warehouseId: defaultWh?.id || null,
                  type: "OUT",
                  quantity: item.quantity,
                  reference: `${refPattern} (Dispatched)`,
                  notes: `Stock deducted for customer sales delivery (${item.productName || "Item"})`,
                },
              });
              await prisma.product.update({
                where: { id: item.productId },
                data: { currentStock: { decrement: item.quantity } },
              });
            }
          }
        } else if (record.productId && Number(record.quantity) > 0) {
          const refPattern = `SO-${record.orderNo}`;
          const existingMovement = await prisma.stockMovement.findFirst({
            where: { reference: { startsWith: refPattern } },
          });
          if (!existingMovement) {
            await prisma.stockMovement.create({
              data: {
                productId: record.productId,
                warehouseId: defaultWh?.id || null,
                type: "OUT",
                quantity: record.quantity,
                reference: `SO-${record.orderNo} (Dispatched)`,
                notes: `Stock deducted for customer sales delivery`,
              },
            });
            // Decrement product currentStock
            await prisma.product.update({
              where: { id: record.productId },
              data: { currentStock: { decrement: record.quantity } },
            });
          }
        }
      }

      // Record money incoming (sales collection) in Account Ledger
      const isSalesPaid = ["PAID", "PARTIAL"].includes(
        String(record.paymentStatus || "").toUpperCase()
      );
      if (isSalesPaid && Number(record.total) > 0) {
        const total = Number(record.total || 0);
        const targetPaid = String(record.paymentStatus).toUpperCase() === "PAID"
          ? (Number(record.paidAmount) > 0 ? Number(record.paidAmount) : total)
          : Number(record.paidAmount || 0);

        if (targetPaid > 0) {
          const existingTxs = await prisma.accountTransaction.findMany({
            where: {
              reference: String(record.orderNo),
              category: { in: ["SALES_COLLECTION", "CUSTOMER_PAYMENT"] },
              status: { not: "CANCELLED" },
            },
          });
          const alreadyLogged = existingTxs.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
          const deltaPayment = Number((targetPaid - alreadyLogged).toFixed(2));

          if (deltaPayment > 0) {
            const customer = record.customerId
              ? await prisma.customer.findUnique({ where: { id: record.customerId } })
              : null;
            await prisma.accountTransaction.create({
              data: {
                transactionNo: `COL-SO-${Date.now().toString().slice(-6)}`,
                type: "INCOMING",
                category: "SALES_COLLECTION",
                amount: deltaPayment,
                paymentMethod: "CASH",
                reference: String(record.orderNo),
                partyName: customer?.name || "Customer",
                status: "COMPLETED",
                notes: `Sales collection received for order ${record.orderNo}. Collected now: ৳${deltaPayment.toLocaleString("en-BD", { minimumFractionDigits: 2 })} (Total paid: ৳${targetPaid.toLocaleString("en-BD", { minimumFractionDigits: 2 })}, Due: ৳${Math.max(0, total - targetPaid).toLocaleString("en-BD", { minimumFractionDigits: 2 })})`,
              },
            });
          }
        }
      }
    }

    // 3. PRODUCT RETURNS (ProductReturn) - Enterprise Sauce & Spices Workflow:
    if (key === "returns") {
      const status = String(record.status || "").toUpperCase();
      const isApprovedOrCompleted = ["APPROVED", "COMPLETED"].includes(status);

      // Business Rule: Return Approval is MANDATORY before any stock, accounts, or VAT posting!
      if (isApprovedOrCompleted) {
        const qty = Number(record.quantity || 0);
        const refPattern = `RET-${record.returnNo}`;
        const defaultWh = await prisma.warehouse.findFirst({ where: { isActive: true } });

        // A. Inventory Handling based on QC and Disposition
        if (record.productId && qty > 0) {
          const existingMovement = await prisma.stockMovement.findFirst({
            where: { reference: { startsWith: refPattern } },
          });

          const condition = String(record.condition || "").toUpperCase();
          const disposition = String(record.disposition || "").toUpperCase();
          const qcStatus = String(record.qcStatus || "").toUpperCase();

          // Resellable Return: if disposition is AVAILABLE_STOCK, RESTOCK or SALEABLE,
          // OR if condition is SALEABLE, SEALED, SEALED_INTACT, or RESTOCK
          const isSaleable =
            ["AVAILABLE_STOCK", "RESTOCK", "SALEABLE"].includes(disposition) ||
            (["SALEABLE", "SEALED", "SEALED_INTACT", "RESTOCK"].includes(condition) &&
              !["DAMAGED", "DAMAGED_SCRAP", "EXPIRED", "EXPIRED_QUARANTINE"].includes(disposition));

          if (!existingMovement) {
            if (isSaleable) {
              await prisma.stockMovement.create({
                data: {
                  productId: record.productId,
                  warehouseId: defaultWh?.id || null,
                  type: "IN",
                  quantity: qty,
                  reference: `${refPattern} (Saleable Restock)`,
                  notes: `QC Passed - Sealed & undamaged food product returned to available stock (Batch: ${record.batchNo || "N/A"})`,
                },
              });
              // Safely increment available sellable stock
              await prisma.product.update({
                where: { id: record.productId },
                data: { currentStock: { increment: qty } },
              });
            } else if (condition === "EXPIRED" || disposition.includes("EXPIRED")) {
              // Expired stock quarantine - NEVER resellable
              await prisma.stockMovement.create({
                data: {
                  productId: record.productId,
                  warehouseId: defaultWh?.id || null,
                  type: "IN",
                  quantity: qty,
                  reference: `${refPattern} (Expired Quarantine)`,
                  notes: `Customer returned expired batch ${record.batchNo || ""}. Moved to Expired Quarantine for safe disposal.`,
                },
              });
            } else {
              // Damaged, leaking, opened package - Scrap/Damaged Quarantine
              await prisma.stockMovement.create({
                data: {
                  productId: record.productId,
                  warehouseId: defaultWh?.id || null,
                  type: "IN",
                  quantity: qty,
                  reference: `${refPattern} (Damaged Quarantine)`,
                  notes: `Damaged/opened package returned (${condition}). Held in Scrap/Damaged Quarantine - NOT saleable.`,
                },
              });
            }
          } else {
            // Existing movement already exists! Handle reclassification / update transitions:
            const wasSaleable = (existingMovement.reference || "").includes("Saleable Restock");
            if (isSaleable && !wasSaleable) {
              // Reclassified / updated from Quarantine -> Saleable Restock: increment product stock!
              await prisma.product.update({
                where: { id: record.productId },
                data: { currentStock: { increment: qty } },
              });
              await prisma.stockMovement.update({
                where: { id: existingMovement.id },
                data: {
                  reference: `${refPattern} (Saleable Restock)`,
                  notes: `QC Reclassified to Saleable - Restocked ${qty} units into available inventory (Batch: ${record.batchNo || "N/A"}).`,
                },
              });
            } else if (!isSaleable && wasSaleable) {
              // Reclassified from Saleable -> Quarantine: reverse/decrement product stock!
              await prisma.product.update({
                where: { id: record.productId },
                data: { currentStock: { decrement: qty } },
              });
              await prisma.stockMovement.update({
                where: { id: existingMovement.id },
                data: {
                  reference: `${refPattern} (Damaged Quarantine)`,
                  notes: `QC Reclassified to Damaged/Scrap - Removed ${qty} units from available inventory.`,
                },
              });
            }
          }
        }

        // B. Accounts & Settlement Handling (Refund vs Credit Balance vs Replacement)
        const refundAmt = Number(record.refundAmount || 0);
        const resolution = String(record.resolutionType || "REFUND").toUpperCase();

        if (refundAmt > 0) {
          if (resolution === "REFUND") {
            // Option 1: Cash/Bank/bKash Money Out to Customer
            const existingTx = await prisma.accountTransaction.findFirst({
              where: { reference: record.returnNo, category: "SALES_RETURN_REFUND" },
            });
            if (!existingTx) {
              await prisma.accountTransaction.create({
                data: {
                  transactionNo: `REF-RET-${Date.now().toString().slice(-6)}`,
                  type: "OUTGOING",
                  category: "SALES_RETURN_REFUND",
                  amount: refundAmt,
                  paymentMethod: record.refundMethod || "CASH",
                  reference: record.returnNo,
                  partyName: record.customerName || "Valued Customer",
                  status: "COMPLETED",
                  notes: `Cash/Bank Refund issued for Sales Return ${record.returnNo} against Invoice ${record.invoiceNo || "N/A"}.`,
                },
              });
            }
          } else if (resolution === "CREDIT_BALANCE" && record.customerId) {
            // Option 2: Add to Customer's Wallet/Credit Balance for next orders
            const existingCreditTx = await prisma.accountTransaction.findFirst({
              where: { reference: record.returnNo, category: "CUSTOMER_PAYMENT" },
            });
            if (!existingCreditTx) {
              await prisma.customer.update({
                where: { id: record.customerId },
                data: { creditBalance: { increment: refundAmt } },
              });
              await prisma.accountTransaction.create({
                data: {
                  transactionNo: `CRD-RET-${Date.now().toString().slice(-6)}`,
                  type: "OUTGOING",
                  category: "CUSTOMER_PAYMENT",
                  amount: refundAmt,
                  paymentMethod: "CREDIT_BALANCE",
                  reference: record.returnNo,
                  partyName: record.customerName || "Customer Credit Balance",
                  status: "COMPLETED",
                  notes: `Credited ৳${refundAmt} to customer wallet for Return ${record.returnNo}. Balance available for future order adjustment.`,
                },
              });
            }
          } else if (resolution === "REPLACEMENT" && record.customerId && record.productId) {
            // Option 3: Replacement Order Tracking
            if (!record.replacementOrderId) {
              const repOrderNo = `SO-REP-${Date.now().toString().slice(-6)}`;
              const repOrder = await prisma.salesOrder.create({
                data: {
                  orderNo: repOrderNo,
                  customerId: record.customerId,
                  productId: record.productId,
                  quantity: record.quantity,
                  unitPrice: 0,
                  total: 0,
                  status: "CONFIRMED",
                  paymentStatus: "PAID",
                  paidAmount: 0,
                  dueAmount: 0,
                  notes: `Warranty/Quality Replacement order issued against Return ${record.returnNo}`,
                },
              });
              if (record.id) {
                await prisma.productReturn.update({
                  where: { id: record.id },
                  data: { replacementOrderId: repOrder.id },
                });
              }
            }
          }
        }

        // C. VAT Adjustment / Credit Note (Mushak 6.7)
        const vatAdj = Number(record.vatAdjustment || 0);
        if (vatAdj > 0) {
          const existingVat = await prisma.vatTransaction.findFirst({
            where: { transactionNo: `CN-${record.returnNo}` },
          });
          if (!existingVat) {
            await prisma.vatTransaction.create({
              data: {
                transactionNo: `CN-${record.returnNo}`,
                transactionType: "SALES_VAT_CREDIT_NOTE",
                taxableAmount: -refundAmt,
                vatRate: 15,
                vatAmount: -vatAdj,
                mushakForm: "Mushak 6.7",
              },
            });
            if (record.id) {
              await prisma.productReturn.update({
                where: { id: record.id },
                data: { vatAdjusted: true },
              });
            }
          }
        }

        // D. Audit Trail Log
        if (record.id) {
          await prisma.auditLog.create({
            data: {
              userId: record.approvedBy || "System Admin",
              action: "APPROVE_SALES_RETURN",
              entity: "ProductReturn",
              entityId: record.id,
              details: `Approved Return ${record.returnNo} for ${record.customerName || "Customer"}. Qty: ${record.quantity}, Condition: ${record.condition || "DAMAGED"}, Disposition: ${record.disposition || "QUARANTINE"}, Resolution: ${record.resolutionType || "REFUND"} (৳${record.refundAmount || 0})`,
            },
          });
        }
      }
    }

    // 4. DIRECT STOCK MOVEMENTS (Manual Stock In / Out / Adjustment):
    if (key === "stock-movements" && record.productId && Number(record.quantity) > 0) {
      if (record.type === "IN") {
        await prisma.product.update({
          where: { id: record.productId },
          data: { currentStock: { increment: record.quantity } },
        });
      } else if (record.type === "OUT") {
        await prisma.product.update({
          where: { id: record.productId },
          data: { currentStock: { decrement: record.quantity } },
        });
      } else if (record.type === "ADJUSTMENT") {
        await prisma.product.update({
          where: { id: record.productId },
          data: { currentStock: record.quantity },
        });
      }
    }
  } catch (err) {
    console.error("ERP Lifecycle sync error:", err);
  }
}
