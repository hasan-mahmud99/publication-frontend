import {
  initialUsers,
  initialWarehouses,
  initialProducts,
  initialSuppliers,
  initialCustomers,
  initialPurchaseOrders,
  initialProductionOrders,
  initialSalesOrders,
  initialProductReturns,
  initialStockMovements,
  initialCourierShipments,
  initialVatTransactions,
  initialAccountTransactions,
  initialAuditLogs,
} from "./mock-data";

function generateId(prefix: string = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
}

function matchesWhere(item: any, where: any): boolean {
  if (!where || typeof where !== "object" || Object.keys(where).length === 0) return true;

  if (Array.isArray(where.OR)) {
    const orMatches = where.OR.some((cond: any) => matchesWhere(item, cond));
    if (!orMatches) return false;
  }

  if (Array.isArray(where.AND)) {
    const andMatches = where.AND.every((cond: any) => matchesWhere(item, cond));
    if (!andMatches) return false;
  }

  for (const [key, val] of Object.entries(where)) {
    if (key === "OR" || key === "AND") continue;
    const itemVal = item[key];

    if (val !== null && typeof val === "object" && !(val instanceof Date)) {
      if ("contains" in (val as any)) {
        const query = String((val as any).contains).toLowerCase();
        if (!String(itemVal ?? "").toLowerCase().includes(query)) return false;
        continue;
      }
      if ("equals" in (val as any)) {
        if (itemVal !== (val as any).equals) return false;
        continue;
      }
      if ("in" in (val as any) && Array.isArray((val as any).in)) {
        if (!(val as any).in.includes(itemVal)) return false;
        continue;
      }
      if ("not" in (val as any)) {
        if (itemVal === (val as any).not) return false;
        continue;
      }
    } else {
      if (val instanceof Date && itemVal instanceof Date) {
        if (val.getTime() !== itemVal.getTime()) return false;
      } else if (String(itemVal ?? "") !== String(val ?? "")) {
        return false;
      }
    }
  }

  return true;
}

export class MockModel<T extends { id: string }> {
  private data: T[];
  private idPrefix: string;
  private dbRef?: MockDatabase;

  constructor(initialData: T[], idPrefix: string = "rec", dbRef?: MockDatabase) {
    this.data = initialData.map((d) => ({ ...d }));
    this.idPrefix = idPrefix;
    this.dbRef = dbRef;
  }

  setDbRef(db: MockDatabase) {
    this.dbRef = db;
  }

  async findMany(args?: {
    where?: any;
    orderBy?: Record<string, "asc" | "desc">;
    take?: number;
    skip?: number;
    include?: Record<string, boolean>;
    select?: Record<string, boolean>;
  }): Promise<T[]> {
    let result = this.data.filter((item) => matchesWhere(item, args?.where));

    if (args?.orderBy) {
      const [field, dir] = Object.entries(args.orderBy)[0] || [];
      if (field) {
        result.sort((a: any, b: any) => {
          const valA = a[field];
          const valB = b[field];
          if (valA === valB) return 0;
          if (valA === undefined) return 1;
          if (valB === undefined) return -1;
          if (valA instanceof Date && valB instanceof Date) {
            return dir === "asc" ? valA.getTime() - valB.getTime() : valB.getTime() - valA.getTime();
          }
          return dir === "asc" ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
        });
      }
    }

    if (args?.skip) {
      result = result.slice(args.skip);
    }
    if (args?.take) {
      result = result.slice(0, args.take);
    }

    // Handle include relations (e.g. stockMovement include product)
    if (args?.include && this.dbRef) {
      result = result.map((item: any) => {
        const cloned = { ...item };
        if (args.include?.product && item.productId) {
          cloned.product = this.dbRef?.product.findUniqueSync({ where: { id: item.productId } });
        }
        return cloned;
      });
    }

    if (args?.select) {
      result = result.map((item: any) => {
        const selected: any = {};
        for (const [k, v] of Object.entries(args.select!)) {
          if (v) selected[k] = item[k];
        }
        return selected;
      });
    }

    return result.map((item) => ({ ...item }));
  }

  findUniqueSync(args: { where: any }): T | null {
    const found = this.data.find((item) => matchesWhere(item, args.where));
    return found ? { ...found } : null;
  }

  async findUnique(args: {
    where: any;
    select?: Record<string, boolean>;
    include?: Record<string, boolean>;
  }): Promise<T | null> {
    const found = this.data.find((item) => matchesWhere(item, args.where));
    if (!found) return null;

    let res: any = { ...found };
    if (args?.include && this.dbRef) {
      if (args.include.product && (found as any).productId) {
        res.product = this.dbRef.product.findUniqueSync({ where: { id: (found as any).productId } });
      }
    }

    if (args?.select) {
      const selected: any = {};
      for (const [k, v] of Object.entries(args.select)) {
        if (v) selected[k] = res[k];
      }
      return selected as T;
    }

    return res as T;
  }

  async findFirst(args?: {
    where?: any;
    orderBy?: Record<string, "asc" | "desc">;
    include?: Record<string, boolean>;
  }): Promise<T | null> {
    const list = await this.findMany({ ...args, take: 1 });
    return list.length > 0 ? list[0] : null;
  }

  async create(args: { data: any }): Promise<T> {
    const newItem: any = {
      ...args.data,
      id: args.data.id || generateId(this.idPrefix),
      createdAt: args.data.createdAt || new Date(),
      updatedAt: args.data.updatedAt || new Date(),
    };
    this.data.unshift(newItem);
    return { ...newItem };
  }

  async update(args: { where: any; data: any }): Promise<T> {
    const idx = this.data.findIndex((item) => matchesWhere(item, args.where));
    if (idx === -1) {
      throw new Error(`Record to update not found`);
    }

    const existing = this.data[idx];
    const updated: any = {
      ...existing,
      ...args.data,
      updatedAt: new Date(),
    };
    this.data[idx] = updated;
    return { ...updated };
  }

  async delete(args: { where: any }): Promise<T> {
    const idx = this.data.findIndex((item) => matchesWhere(item, args.where));
    if (idx === -1) {
      throw new Error(`Record to delete not found`);
    }
    const [deleted] = this.data.splice(idx, 1);
    return { ...deleted };
  }

  async count(args?: { where?: any }): Promise<number> {
    if (!args?.where || Object.keys(args.where).length === 0) {
      return this.data.length;
    }
    return this.data.filter((item) => matchesWhere(item, args.where)).length;
  }

  async upsert(args: { where: any; create: any; update: any }): Promise<T> {
    const existing = await this.findFirst({ where: args.where });
    if (existing) {
      return this.update({ where: args.where, data: args.update });
    }
    return this.create({ data: { ...args.where, ...args.create } });
  }
}

export class MockDatabase {
  user: MockModel<any>;
  warehouse: MockModel<any>;
  product: MockModel<any>;
  supplier: MockModel<any>;
  customer: MockModel<any>;
  purchaseOrder: MockModel<any>;
  productionOrder: MockModel<any>;
  salesOrder: MockModel<any>;
  productReturn: MockModel<any>;
  stockMovement: MockModel<any>;
  courierShipment: MockModel<any>;
  vatTransaction: MockModel<any>;
  accountTransaction: MockModel<any>;
  auditLog: MockModel<any>;

  constructor() {
    this.user = new MockModel(initialUsers, "usr", this);
    this.warehouse = new MockModel(initialWarehouses, "wh", this);
    this.product = new MockModel(initialProducts, "prod", this);
    this.supplier = new MockModel(initialSuppliers, "sup", this);
    this.customer = new MockModel(initialCustomers, "cust", this);
    this.purchaseOrder = new MockModel(initialPurchaseOrders, "po", this);
    this.productionOrder = new MockModel(initialProductionOrders, "prd", this);
    this.salesOrder = new MockModel(initialSalesOrders, "so", this);
    this.productReturn = new MockModel(initialProductReturns, "ret", this);
    this.stockMovement = new MockModel(initialStockMovements, "sm", this);
    this.courierShipment = new MockModel(initialCourierShipments, "cs", this);
    this.vatTransaction = new MockModel(initialVatTransactions, "vat", this);
    this.accountTransaction = new MockModel(initialAccountTransactions, "tx", this);
    this.auditLog = new MockModel(initialAuditLogs, "log", this);
  }

  async $disconnect() {
    // No-op for mock DB
  }
}

// Global persistent instance so mutations persist across API requests in server runtime
const globalForMockDb = globalThis as unknown as { mockDbInstance?: MockDatabase };
export const mockDb = globalForMockDb.mockDbInstance ?? new MockDatabase();
if (process.env.NODE_ENV !== "production") {
  globalForMockDb.mockDbInstance = mockDb;
}
