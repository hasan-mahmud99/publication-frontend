export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  permissions?: Record<string, boolean>;
}

// Master list of all permission keys in Antigravity Food ERP
export const ALL_PERMISSION_KEYS = [
  // Products
  "products.view",
  "products.create",
  "products.edit",
  "products.delete",
  // Inventory
  "inventory.view",
  "inventory.in",
  "inventory.out",
  "inventory.transfer",
  "inventory.adjust",
  // Manufacturing
  "manufacturing.view",
  "manufacturing.create",
  "manufacturing.qc",
  "manufacturing.bom",
  // Purchase
  "purchase.view",
  "purchase.create",
  "purchase.approve",
  "purchase.grn",
  // Sales
  "sales.view",
  "sales.create",
  "sales.approve",
  "sales.credit",
  "sales.dispatch",
  // Returns
  "returns.view",
  "returns.inspect",
  "returns.approve",
  // Accounts & Finance
  "accounts.view",
  "accounts.transactions",
  // VAT & Mushak 6.3
  "vat.view",
  "vat.create",
  "vat.print",
  // Courier & Dispatch
  "courier.view",
  "courier.book",
  "courier.track",
  // Reports
  "reports.inventory",
  "reports.sales",
  "reports.export",
  // Settings
  "settings.users",
  "settings.roles",
  "settings.audit",
] as const;

/**
 * Default permission templates by business role.
 * Applied when a user record does not have custom per-user permission overrides.
 */
export function getDefaultRolePermissions(role: string): Record<string, boolean> {
  const normRole = (role || "").toUpperCase();

  if (normRole === "ADMIN") {
    const adminPerms: Record<string, boolean> = {};
    for (const k of ALL_PERMISSION_KEYS) {
      adminPerms[k] = true;
    }
    return adminPerms;
  }

  if (normRole === "SALES_DIRECTOR") {
    // Sales, Customers, Deliveries, Returns, Courier, VAT invoices
    // STRICTLY NO Accounts & Finance, NO Settings, NO Purchase/Factory operations
    return {
      "sales.view": true,
      "sales.create": true,
      "sales.approve": true,
      "sales.credit": true,
      "sales.dispatch": true,
      "returns.view": true,
      "returns.inspect": true,
      "returns.approve": true,
      "courier.view": true,
      "courier.book": true,
      "courier.track": true,
      "vat.view": true,
      "vat.create": true,
      "vat.print": true,
      "products.view": true,
      "inventory.view": true,
      "reports.sales": true,
      "reports.export": true,
      "accounts.view": false,
      "accounts.transactions": false,
      "settings.roles": false,
      "settings.users": false,
      "settings.audit": false,
    };
  }

  if (normRole === "ACCOUNTANT") {
    // Accounts Ledger, Money in/out, VAT & Tax Invoices, Reports, View orders
    // STRICTLY NO Manufacturing or Delivery operations, NO Settings
    return {
      "accounts.view": true,
      "accounts.transactions": true,
      "vat.view": true,
      "vat.create": true,
      "vat.print": true,
      "sales.view": true,
      "purchase.view": true,
      "products.view": true,
      "inventory.view": true,
      "reports.inventory": true,
      "reports.sales": true,
      "reports.export": true,
      "settings.roles": false,
      "settings.users": false,
      "settings.audit": false,
    };
  }

  if (normRole === "FACTORY_MANAGER") {
    // Production planning, BOM, Quality, Inventory management, Products
    // STRICTLY NO Accounts & Finance, NO Sales credit
    return {
      "manufacturing.view": true,
      "manufacturing.create": true,
      "manufacturing.qc": true,
      "manufacturing.bom": true,
      "inventory.view": true,
      "inventory.in": true,
      "inventory.out": true,
      "inventory.transfer": true,
      "inventory.adjust": true,
      "products.view": true,
      "products.create": true,
      "products.edit": true,
      "reports.inventory": true,
      "reports.export": true,
      "accounts.view": false,
      "accounts.transactions": false,
      "settings.roles": false,
      "settings.users": false,
      "settings.audit": false,
    };
  }

  if (normRole === "INVENTORY_LEAD" || normRole === "WAREHOUSE_INCHARGE") {
    return {
      "inventory.view": true,
      "inventory.in": true,
      "inventory.out": true,
      "inventory.transfer": true,
      "inventory.adjust": true,
      "products.view": true,
      "purchase.view": true,
      "purchase.grn": true,
      "returns.view": true,
      "reports.inventory": true,
      "accounts.view": false,
      "accounts.transactions": false,
      "settings.roles": false,
      "settings.users": false,
    };
  }

  if (normRole === "QC_OFFICER" || normRole === "FOOD_CHEMIST") {
    return {
      "manufacturing.view": true,
      "manufacturing.qc": true,
      "returns.view": true,
      "returns.inspect": true,
      "products.view": true,
      "accounts.view": false,
      "accounts.transactions": false,
      "settings.roles": false,
      "settings.users": false,
    };
  }

  if (normRole === "PURCHASE_OFFICER") {
    return {
      "purchase.view": true,
      "purchase.create": true,
      "purchase.grn": true,
      "products.view": true,
      "inventory.view": true,
      "reports.inventory": true,
      "accounts.view": false,
      "accounts.transactions": false,
      "settings.roles": false,
      "settings.users": false,
    };
  }

  // READONLY / Default Staff
  return {
    "products.view": true,
    "inventory.view": false,
    "sales.view": false,
    "accounts.view": false,
    "accounts.transactions": false,
    "settings.roles": false,
    "settings.users": false,
    "settings.audit": false,
  };
}

/**
 * Returns the effective permissions for a user:
 * Custom user permissions strictly override role defaults.
 */
export function getEffectivePermissions(user: UserSession | null): Record<string, boolean> {
  if (!user || user.isActive === false) return {};
  if (user.role === "ADMIN") {
    return getDefaultRolePermissions("ADMIN");
  }

  const roleDefaults = getDefaultRolePermissions(user.role || "STAFF");
  const customPerms = user.permissions || {};

  return {
    ...roleDefaults,
    ...customPerms,
  };
}

/**
 * Checks whether a user has permission to navigate to a specific page path.
 */
export function canAccessPath(user: UserSession | null, path: string): boolean {
  if (!user || user.isActive === false) return false;
  if (user.role === "ADMIN") return true;

  const clean = path.replace(/^\//, "");

  // Dashboard is accessible to all logged-in active users
  if (clean === "dashboard" || clean === "") return true;

  const perms = getEffectivePermissions(user);

  // Settings & System Administration
  if (clean.startsWith("settings/roles")) {
    return !!perms["settings.roles"];
  }
  if (clean.startsWith("settings/users")) {
    return !!perms["settings.users"];
  }
  if (clean.startsWith("settings/audit-logs")) {
    return !!perms["settings.audit"];
  }
  if (clean.startsWith("settings")) {
    return !!perms["settings.users"] || !!perms["settings.roles"] || !!perms["settings.audit"];
  }

  // Accounts & Finance (Money In / Out Ledger, Incoming Collections, Outgoing Payments)
  if (clean.startsWith("accounts")) {
    return !!perms["accounts.view"] || !!perms["accounts.transactions"];
  }

  // VAT & Mushak 6.3
  if (clean.startsWith("vat")) {
    return !!perms["vat.view"] || !!perms["vat.create"] || !!perms["vat.print"];
  }

  // Products & Catalogue
  if (clean.startsWith("products")) {
    return (
      !!perms["products.view"] ||
      !!perms["products.create"] ||
      !!perms["products.edit"] ||
      !!perms["products.delete"]
    );
  }

  // Inventory & Warehouses
  if (clean.startsWith("inventory")) {
    return (
      !!perms["inventory.view"] ||
      !!perms["inventory.in"] ||
      !!perms["inventory.out"] ||
      !!perms["inventory.transfer"] ||
      !!perms["inventory.adjust"]
    );
  }

  // Manufacturing & Recipes
  if (clean.startsWith("manufacturing")) {
    return (
      !!perms["manufacturing.view"] ||
      !!perms["manufacturing.create"] ||
      !!perms["manufacturing.qc"] ||
      !!perms["manufacturing.bom"]
    );
  }

  // Purchase & Suppliers
  if (clean.startsWith("purchase")) {
    return (
      !!perms["purchase.view"] ||
      !!perms["purchase.create"] ||
      !!perms["purchase.approve"] ||
      !!perms["purchase.grn"]
    );
  }

  // Sales & Distribution
  if (clean.startsWith("sales")) {
    return (
      !!perms["sales.view"] ||
      !!perms["sales.create"] ||
      !!perms["sales.approve"] ||
      !!perms["sales.credit"] ||
      !!perms["sales.dispatch"]
    );
  }

  // Product Returns
  if (clean.startsWith("returns")) {
    return (
      !!perms["returns.view"] ||
      !!perms["returns.inspect"] ||
      !!perms["returns.approve"]
    );
  }

  // Courier & Tracking
  if (clean.startsWith("courier")) {
    return (
      !!perms["courier.view"] ||
      !!perms["courier.book"] ||
      !!perms["courier.track"]
    );
  }

  // Reports
  if (clean.startsWith("reports")) {
    return (
      !!perms["reports.inventory"] ||
      !!perms["reports.sales"] ||
      !!perms["reports.export"]
    );
  }

  return false;
}

/**
 * Checks whether a user can read or write a backend API resource.
 */
export function canAccessResource(
  user: UserSession | null,
  resourceKey: string,
  isWrite: boolean = false
): boolean {
  if (!user || user.isActive === false) return false;
  if (user.role === "ADMIN") return true;

  const perms = getEffectivePermissions(user);

  switch (resourceKey) {
    case "account-transactions":
      return isWrite
        ? !!perms["accounts.transactions"]
        : (!!perms["accounts.view"] || !!perms["accounts.transactions"]);
    case "vat-transactions":
      return isWrite
        ? !!perms["vat.create"]
        : (!!perms["vat.view"] || !!perms["vat.create"] || !!perms["vat.print"]);
    case "sales-orders":
      return isWrite
        ? !!perms["sales.create"]
        : (!!perms["sales.view"] || !!perms["sales.create"]);
    case "customers":
      return isWrite ? !!perms["sales.create"] : !!perms["sales.view"];
    case "purchase-orders":
      return isWrite
        ? !!perms["purchase.create"]
        : (!!perms["purchase.view"] || !!perms["purchase.create"]);
    case "suppliers":
      return isWrite ? !!perms["purchase.create"] : !!perms["purchase.view"];
    case "products":
      return isWrite
        ? (!!perms["products.create"] || !!perms["products.edit"] || !!perms["products.delete"])
        : !!perms["products.view"];
    case "production-orders":
      return isWrite
        ? !!perms["manufacturing.create"]
        : (!!perms["manufacturing.view"] || !!perms["manufacturing.create"]);
    case "returns":
      return isWrite ? !!perms["returns.approve"] : !!perms["returns.view"];
    case "courier-shipments":
      return isWrite ? !!perms["courier.book"] : !!perms["courier.view"];
    case "stock-movements":
    case "warehouses":
      return isWrite ? !!perms["inventory.in"] : !!perms["inventory.view"];
    case "users":
      return !!perms["settings.users"];
    case "audit-logs":
      return !!perms["settings.audit"];
    default:
      return true;
  }
}
