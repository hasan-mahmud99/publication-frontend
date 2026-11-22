export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  isActive: boolean;
  permissions: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WarehouseRecord {
  id: string;
  code: string;
  name: string;
  address: string;
  isActive: boolean;
  createdAt: Date;
}

export interface ProductRecord {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  sellingPrice: number;
  costPrice: number;
  reorderLevel: number;
  currentStock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  bin: string;
  openingBalance: number;
  createdAt: Date;
}

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  customerType: string;
  creditLimit: number;
  openingBalance: number;
  creditBalance: number;
  createdAt: Date;
}

export interface PurchaseOrderRecord {
  id: string;
  orderNo: string;
  supplierId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  status: string;
  total: number;
  paymentStatus: string;
  paidAmount: number;
  dueAmount: number;
  items?: string;
  notes?: string;
  orderDate: Date;
  createdAt: Date;
}

export interface ProductionOrderRecord {
  id: string;
  orderNo: string;
  productId: string;
  plannedQty: number;
  producedQty: number;
  status: string;
  batchNo: string;
  manufacturingDate: Date;
  expiryDate: Date;
  createdAt: Date;
}

export interface SalesOrderRecord {
  id: string;
  orderNo: string;
  customerId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  status: string;
  total: number;
  paymentStatus: string;
  paidAmount: number;
  dueAmount: number;
  vatAmount: number;
  vatPaid: boolean;
  items?: string;
  notes?: string;
  orderDate: Date;
  createdAt: Date;
}

export interface ProductReturnRecord {
  id: string;
  returnNo: string;
  salesOrderId?: string;
  invoiceNo?: string;
  customerId?: string;
  customerName?: string;
  productId?: string;
  batchNo?: string;
  soldQty?: number;
  quantity: number;
  unitPrice?: number;
  refundAmount?: number;
  reason: string;
  condition?: string;
  status: string;
  disposition: string;
  qcStatus?: string;
  qcNotes?: string;
  resolutionType?: string;
  refundMethod?: string;
  vatAdjustment?: number;
  vatAdjusted?: boolean;
  courierConsignment?: string;
  courierCharge?: number;
  replacementOrderId?: string;
  approvedBy?: string;
  approvedAt?: Date;
  inspectedBy?: string;
  inspectionDate?: Date;
  createdAt: Date;
}

export interface StockMovementRecord {
  id: string;
  productId: string;
  warehouseId?: string;
  type: string;
  quantity: number;
  reference?: string;
  notes?: string;
  createdAt: Date;
  product?: ProductRecord;
}

export interface CourierShipmentRecord {
  id: string;
  consignmentId?: string;
  provider: string;
  salesOrderId?: string;
  trackingCode?: string;
  status: string;
  codAmount: number;
  deliveryCharge: number;
  createdAt: Date;
}

export interface VatTransactionRecord {
  id: string;
  transactionNo: string;
  transactionType: string;
  taxableAmount: number;
  vatRate: number;
  vatAmount: number;
  transactionDate: Date;
  mushakForm: string;
  createdAt: Date;
}

export interface AccountTransactionRecord {
  id: string;
  transactionNo: string;
  type: string;
  category: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  partyName?: string;
  status: string;
  transactionDate: Date;
  notes?: string;
  createdAt: Date;
}

export interface AuditLogRecord {
  id: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  createdAt: Date;
}

// 1. Initial Users
export const initialUsers: UserRecord[] = [
  { id: "usr-1", name: "System Administrator", email: "admin@example.com", passwordHash: "ChangeMe123!", role: "ADMIN", isActive: true, permissions: null, createdAt: new Date("2026-01-01"), updatedAt: new Date("2026-01-01") },
  { id: "usr-2", name: "Tanvir Ahmed", email: "tanvir.manager@example.com", passwordHash: "ChangeMe123!", role: "FACTORY_MANAGER", isActive: true, permissions: null, createdAt: new Date("2026-01-02"), updatedAt: new Date("2026-01-02") },
  { id: "usr-3", name: "Nusrat Jahan", email: "nusrat.inventory@example.com", passwordHash: "ChangeMe123!", role: "INVENTORY_LEAD", isActive: true, permissions: null, createdAt: new Date("2026-01-03"), updatedAt: new Date("2026-01-03") },
  { id: "usr-4", name: "Kamrul Hassan", email: "kamrul.qc@example.com", passwordHash: "ChangeMe123!", role: "QC_OFFICER", isActive: true, permissions: null, createdAt: new Date("2026-01-04"), updatedAt: new Date("2026-01-04") },
  { id: "usr-5", name: "Farhana Chowdhury", email: "farhana.sales@example.com", passwordHash: "ChangeMe123!", role: "SALES_DIRECTOR", isActive: true, permissions: null, createdAt: new Date("2026-01-05"), updatedAt: new Date("2026-01-05") },
  { id: "usr-6", name: "Shafiqul Islam", email: "shafiq.accounts@example.com", passwordHash: "ChangeMe123!", role: "ACCOUNTANT", isActive: true, permissions: null, createdAt: new Date("2026-01-06"), updatedAt: new Date("2026-01-06") },
  { id: "usr-7", name: "Mahmudur Rahman", email: "mahmud.procure@example.com", passwordHash: "ChangeMe123!", role: "PURCHASE_OFFICER", isActive: true, permissions: null, createdAt: new Date("2026-01-07"), updatedAt: new Date("2026-01-07") },
  { id: "usr-8", name: "Rokeya Begum", email: "rokeya.wh@example.com", passwordHash: "ChangeMe123!", role: "WAREHOUSE_INCHARGE", isActive: true, permissions: null, createdAt: new Date("2026-01-08"), updatedAt: new Date("2026-01-08") },
  { id: "usr-9", name: "Anisur Rahman", email: "anis.operator@example.com", passwordHash: "ChangeMe123!", role: "PRODUCTION_OPERATOR", isActive: true, permissions: null, createdAt: new Date("2026-01-09"), updatedAt: new Date("2026-01-09") },
  { id: "usr-10", name: "Sabrina Yasmin", email: "sabrina.pack@example.com", passwordHash: "ChangeMe123!", role: "PACKAGING_SUPERVISOR", isActive: true, permissions: null, createdAt: new Date("2026-01-10"), updatedAt: new Date("2026-01-10") },
  { id: "usr-11", name: "Zubair Hossain", email: "zubair.dispatch@example.com", passwordHash: "ChangeMe123!", role: "LOGISTICS_COORDINATOR", isActive: true, permissions: null, createdAt: new Date("2026-01-11"), updatedAt: new Date("2026-01-11") },
  { id: "usr-12", name: "Mehedi Hasan", email: "mehedi.billing@example.com", passwordHash: "ChangeMe123!", role: "BILLING_OFFICER", isActive: true, permissions: null, createdAt: new Date("2026-01-12"), updatedAt: new Date("2026-01-12") },
  { id: "usr-13", name: "Fariha Sultana", email: "fariha.vat@example.com", passwordHash: "ChangeMe123!", role: "VAT_SPECIALIST", isActive: true, permissions: null, createdAt: new Date("2026-01-13"), updatedAt: new Date("2026-01-13") },
  { id: "usr-14", name: "Tariqul Alam", email: "tariq.chemist@example.com", passwordHash: "ChangeMe123!", role: "FOOD_CHEMIST", isActive: true, permissions: null, createdAt: new Date("2026-01-14"), updatedAt: new Date("2026-01-14") },
  { id: "usr-15", name: "Nasim Ullah", email: "nasim.engineer@example.com", passwordHash: "ChangeMe123!", role: "MAINTENANCE_ENG", isActive: true, permissions: null, createdAt: new Date("2026-01-15"), updatedAt: new Date("2026-01-15") },
  { id: "usr-16", name: "Tahmina Akter", email: "tahmina.support@example.com", passwordHash: "ChangeMe123!", role: "CUSTOMER_SERVICE", isActive: true, permissions: null, createdAt: new Date("2026-01-16"), updatedAt: new Date("2026-01-16") },
  { id: "usr-17", name: "Arifur Zaman", email: "arif.rso.dhaka@example.com", passwordHash: "ChangeMe123!", role: "RSO_DHAKA", isActive: true, permissions: null, createdAt: new Date("2026-01-17"), updatedAt: new Date("2026-01-17") },
  { id: "usr-18", name: "Golam Mostafa", email: "mostafa.rso.ctg@example.com", passwordHash: "ChangeMe123!", role: "RSO_CHITTAGONG", isActive: true, permissions: null, createdAt: new Date("2026-01-18"), updatedAt: new Date("2026-01-18") },
  { id: "usr-19", name: "Shahidul Karim", email: "shahid.audit@example.com", passwordHash: "ChangeMe123!", role: "INTERNAL_AUDITOR", isActive: true, permissions: null, createdAt: new Date("2026-01-19"), updatedAt: new Date("2026-01-19") },
  { id: "usr-20", name: "Sadia Afrin", email: "sadia.planner@example.com", passwordHash: "ChangeMe123!", role: "SUPPLY_CHAIN_PLANNER", isActive: true, permissions: null, createdAt: new Date("2026-01-20"), updatedAt: new Date("2026-01-20") },
];

// 2. Initial Warehouses
export const initialWarehouses: WarehouseRecord[] = [
  { id: "wh-1", code: "MAIN", name: "Central Head Office Warehouse", address: "Tejgaon I/A, Dhaka", isActive: true, createdAt: new Date("2026-01-01") },
  { id: "wh-2", code: "WH-SAVAR", name: "Savar Production Plant Godown", address: "EPZ Road, Savar, Dhaka", isActive: true, createdAt: new Date("2026-01-02") },
  { id: "wh-3", code: "WH-GAZIPUR", name: "Gazipur Raw Spices Depot", address: "Tongi I/A, Gazipur", isActive: true, createdAt: new Date("2026-01-03") },
  { id: "wh-4", code: "WH-CTG-01", name: "Chittagong Port Distribution Hub", address: "Agrabad C/A, Chittagong", isActive: true, createdAt: new Date("2026-01-04") },
  { id: "wh-5", code: "WH-CTG-02", name: "Chittagong Pahartali Depot", address: "Pahartali, Chittagong", isActive: true, createdAt: new Date("2026-01-05") },
  { id: "wh-6", code: "WH-SYL-01", name: "Sylhet Regional Depot", address: "Subidbazar, Sylhet", isActive: true, createdAt: new Date("2026-01-06") },
  { id: "wh-7", code: "WH-RAJ-01", name: "Rajshahi Northern Hub", address: "Sapura Industrial Area, Rajshahi", isActive: true, createdAt: new Date("2026-01-07") },
  { id: "wh-8", code: "WH-KHU-01", name: "Khulna Divisional Depot", address: "Khalishpur, Khulna", isActive: true, createdAt: new Date("2026-01-08") },
  { id: "wh-9", code: "WH-BAR-01", name: "Barisal Riverfront Store", address: "Natun Bazar, Barisal", isActive: true, createdAt: new Date("2026-01-09") },
  { id: "wh-10", code: "WH-BOG-01", name: "Bogra Central Transit Hub", address: "Sherpur Road, Bogra", isActive: true, createdAt: new Date("2026-01-10") },
  { id: "wh-11", code: "WH-COM-01", name: "Comilla Highway Depot", address: "Paduar Bazar, Comilla", isActive: true, createdAt: new Date("2026-01-11") },
  { id: "wh-12", code: "WH-RAN-01", name: "Rangpur Transit Facility", address: "Dhap, Rangpur", isActive: true, createdAt: new Date("2026-01-12") },
  { id: "wh-13", code: "WH-MYM-01", name: "Mymensingh Regional Store", address: "Maskanda, Mymensingh", isActive: true, createdAt: new Date("2026-01-13") },
  { id: "wh-14", code: "WH-NAR-01", name: "Narayanganj River Depot", address: "Tanbazar, Narayanganj", isActive: true, createdAt: new Date("2026-01-14") },
  { id: "wh-15", code: "WH-MIR-01", name: "Mirpur Local Fulfillment Depot", address: "Section-10, Mirpur, Dhaka", isActive: true, createdAt: new Date("2026-01-15") },
  { id: "wh-16", code: "WH-UTT-01", name: "Uttara Fast Delivery Hub", address: "Sector-7, Uttara, Dhaka", isActive: true, createdAt: new Date("2026-01-16") },
  { id: "wh-17", code: "WH-KER-01", name: "Keraniganj Packaging Warehouse", address: "Aganagar, Keraniganj", isActive: true, createdAt: new Date("2026-01-17") },
  { id: "wh-18", code: "WH-JES-01", name: "Jessore Border Trade Depot", address: "New Market Area, Jessore", isActive: true, createdAt: new Date("2026-01-18") },
  { id: "wh-19", code: "WH-COX-01", name: "Cox's Bazar Tourist Market Depo", address: "Kolatoli Road, Cox's Bazar", isActive: true, createdAt: new Date("2026-01-19") },
  { id: "wh-20", code: "WH-KUS-01", name: "Kushtia Grains & Spices Depot", address: "NS Road, Kushtia", isActive: true, createdAt: new Date("2026-01-20") },
];

// 3. Initial Products (20 products with healthy initial stock)
export const initialProducts: ProductRecord[] = [
  { id: "prod-1", sku: "SAU-001", name: "Tomato Ketchup 350g Glass Bottle", category: "Sauces", unit: "bottle", sellingPrice: 180, costPrice: 120, reorderLevel: 25, currentStock: 350, isActive: true, createdAt: new Date("2026-01-01"), updatedAt: new Date("2026-01-01") },
  { id: "prod-2", sku: "SAU-002", name: "Hot Chilli Garlic Sauce 250g", category: "Sauces", unit: "bottle", sellingPrice: 220, costPrice: 150, reorderLevel: 20, currentStock: 280, isActive: true, createdAt: new Date("2026-01-02"), updatedAt: new Date("2026-01-02") },
  { id: "prod-3", sku: "SAU-003", name: "Thai Sweet Chilli Dip 250g Jar", category: "Sauces", unit: "jar", sellingPrice: 210, costPrice: 140, reorderLevel: 15, currentStock: 190, isActive: true, createdAt: new Date("2026-01-03"), updatedAt: new Date("2026-01-03") },
  { id: "prod-4", sku: "SAU-004", name: "Traditional Mustard Kasundi 200g", category: "Condiments", unit: "jar", sellingPrice: 160, costPrice: 95, reorderLevel: 30, currentStock: 420, isActive: true, createdAt: new Date("2026-01-04"), updatedAt: new Date("2026-01-04") },
  { id: "prod-5", sku: "SAU-005", name: "Tamarind Sweet & Sour Sauce 350g", category: "Sauces", unit: "bottle", sellingPrice: 195, costPrice: 130, reorderLevel: 20, currentStock: 220, isActive: true, createdAt: new Date("2026-01-05"), updatedAt: new Date("2026-01-05") },
  { id: "prod-6", sku: "SAU-006", name: "Dark Brewed Soy Sauce 500ml", category: "Condiments", unit: "bottle", sellingPrice: 175, costPrice: 110, reorderLevel: 25, currentStock: 310, isActive: true, createdAt: new Date("2026-01-06"), updatedAt: new Date("2026-01-06") },
  { id: "prod-7", sku: "SAU-007", name: "Synthetic White Vinegar 500ml", category: "Condiments", unit: "bottle", sellingPrice: 90, costPrice: 55, reorderLevel: 40, currentStock: 450, isActive: true, createdAt: new Date("2026-01-07"), updatedAt: new Date("2026-01-07") },
  { id: "prod-8", sku: "SAU-008", name: "Smoky BBQ Sauce & Glaze 350g", category: "Sauces", unit: "bottle", sellingPrice: 290, costPrice: 195, reorderLevel: 15, currentStock: 160, isActive: true, createdAt: new Date("2026-01-08"), updatedAt: new Date("2026-01-08") },
  { id: "prod-9", sku: "SAU-009", name: "Green Chilli Pickle Chutney 200g", category: "Sauces", unit: "jar", sellingPrice: 185, costPrice: 115, reorderLevel: 15, currentStock: 240, isActive: true, createdAt: new Date("2026-01-09"), updatedAt: new Date("2026-01-09") },
  { id: "prod-10", sku: "SAU-010", name: "Sweet Mango Murabba & Chutney 400g", category: "Sauces", unit: "jar", sellingPrice: 240, costPrice: 155, reorderLevel: 15, currentStock: 180, isActive: true, createdAt: new Date("2026-01-10"), updatedAt: new Date("2026-01-10") },
  { id: "prod-11", sku: "SPC-001", name: "Turmeric Powder (Haldi) 500g Pouch", category: "Spices", unit: "pack", sellingPrice: 280, costPrice: 190, reorderLevel: 50, currentStock: 600, isActive: true, createdAt: new Date("2026-01-11"), updatedAt: new Date("2026-01-11") },
  { id: "prod-12", sku: "SPC-002", name: "Red Chilli Powder Extra Hot 500g", category: "Spices", unit: "pack", sellingPrice: 420, costPrice: 310, reorderLevel: 40, currentStock: 500, isActive: true, createdAt: new Date("2026-01-12"), updatedAt: new Date("2026-01-12") },
  { id: "prod-13", sku: "SPC-003", name: "Coriander Seed Ground Powder 200g", category: "Spices", unit: "pack", sellingPrice: 130, costPrice: 85, reorderLevel: 35, currentStock: 480, isActive: true, createdAt: new Date("2026-01-13"), updatedAt: new Date("2026-01-13") },
  { id: "prod-14", sku: "SPC-004", name: "Roasted Cumin Powder (Jeera) 200g", category: "Spices", unit: "pack", sellingPrice: 240, costPrice: 160, reorderLevel: 30, currentStock: 390, isActive: true, createdAt: new Date("2026-01-14"), updatedAt: new Date("2026-01-14") },
  { id: "prod-15", sku: "SPC-005", name: "Royal Garam Masala Blend 100g", category: "Spices", unit: "pack", sellingPrice: 170, costPrice: 110, reorderLevel: 25, currentStock: 320, isActive: true, createdAt: new Date("2026-01-15"), updatedAt: new Date("2026-01-15") },
  { id: "prod-16", sku: "SPC-006", name: "Special Meat Curry Masala 200g", category: "Spices", unit: "pack", sellingPrice: 190, costPrice: 125, reorderLevel: 35, currentStock: 410, isActive: true, createdAt: new Date("2026-01-16"), updatedAt: new Date("2026-01-16") },
  { id: "prod-17", sku: "SPC-007", name: "Traditional Fish Curry Masala 200g", category: "Spices", unit: "pack", sellingPrice: 175, costPrice: 115, reorderLevel: 30, currentStock: 370, isActive: true, createdAt: new Date("2026-01-17"), updatedAt: new Date("2026-01-17") },
  { id: "prod-18", sku: "SPC-008", name: "Kacchi Biryani Mix Blend 100g", category: "Spices", unit: "pack", sellingPrice: 165, costPrice: 105, reorderLevel: 25, currentStock: 290, isActive: true, createdAt: new Date("2026-01-18"), updatedAt: new Date("2026-01-18") },
  { id: "prod-19", sku: "SPC-009", name: "Fine Ground Black Pepper 100g", category: "Spices", unit: "pack", sellingPrice: 260, costPrice: 180, reorderLevel: 20, currentStock: 210, isActive: true, createdAt: new Date("2026-01-19"), updatedAt: new Date("2026-01-19") },
  { id: "prod-20", sku: "SPC-010", name: "Tangy Chat Masala Sprinkler 100g", category: "Spices", unit: "pack", sellingPrice: 140, costPrice: 85, reorderLevel: 25, currentStock: 260, isActive: true, createdAt: new Date("2026-01-20"), updatedAt: new Date("2026-01-20") },
];

// 4. Initial Suppliers
export const initialSuppliers: SupplierRecord[] = [
  { id: "sup-1", name: "Bengal Agro Organic Farms", phone: "01711-100201", email: "sales@bengalagro.com", address: "Narsingdi Sadar, Dhaka", bin: "10293847561", openingBalance: 45000, createdAt: new Date("2026-01-01") },
  { id: "sup-2", name: "Padma Spice Millers Ltd", phone: "01712-200302", email: "info@padmaspice.com", address: "Ishwardi, Pabna", bin: "20394857612", openingBalance: 82000, createdAt: new Date("2026-01-02") },
  { id: "sup-3", name: "Meghna Pet Packaging & Caps", phone: "01713-300403", email: "orders@meghnapack.com", address: "Tongi I/A, Gazipur", bin: "30495868723", openingBalance: 15000, createdAt: new Date("2026-01-03") },
  { id: "sup-4", name: "Square Agro Commodities Ltd", phone: "01714-400504", email: "procure@squareagro.com", address: "Savar, Dhaka", bin: "40596879834", openingBalance: 125000, createdAt: new Date("2026-01-04") },
  { id: "sup-5", name: "Pran Raw Agro Suppliers", phone: "01715-500605", email: "agro@pran.com.bd", address: "Ghorashal, Narsingdi", bin: "50697880945", openingBalance: 95000, createdAt: new Date("2026-01-05") },
  { id: "sup-6", name: "City Grain & Seeds Importers", phone: "01716-600706", email: "sales@citygrain.com", address: "Khatunganj, Chittagong", bin: "60798991056", openingBalance: 210000, createdAt: new Date("2026-01-06") },
  { id: "sup-7", name: "Akij Corrugated Carton Mills", phone: "01717-700807", email: "carton@akij.net", address: "Manikganj", bin: "70899002167", openingBalance: 32000, createdAt: new Date("2026-01-07") },
  { id: "sup-8", name: "Jamuna Flexible Pouch Industries", phone: "01718-800908", email: "packaging@jamuna.com", address: "Mirzapur, Tangail", bin: "80900113278", openingBalance: 64000, createdAt: new Date("2026-01-08") },
  { id: "sup-9", name: "Karnaphuli Chemical & Vinegar Co", phone: "01719-900019", email: "chem@karnaphuli.com", address: "Kalurghat, Chittagong", bin: "91011224389", openingBalance: 28000, createdAt: new Date("2026-01-09") },
  { id: "sup-10", name: "Rupsha Refined Food Salt Mills", phone: "01811-011220", email: "sales@rupshasalt.com", address: "Rupsha, Khulna", bin: "12122335490", openingBalance: 18000, createdAt: new Date("2026-01-10") },
  { id: "sup-11", name: "Apex Food Additives & Essences", phone: "01812-122331", email: "info@apexfood.com", address: "Tejgaon, Dhaka", bin: "23233446501", openingBalance: 56000, createdAt: new Date("2026-01-11") },
  { id: "sup-12", name: "Delta Glass Container Industries", phone: "01813-233442", email: "bottles@deltaglass.com", address: "Murapara, Narayanganj", bin: "34344557612", openingBalance: 110000, createdAt: new Date("2026-01-12") },
  { id: "sup-13", name: "Teesta Agricultural Cooperative", phone: "01814-344553", email: "coop@teesta.org", address: "Pirgachha, Rangpur", bin: "45455668723", openingBalance: 42000, createdAt: new Date("2026-01-13") },
  { id: "sup-14", name: "Sundarban Natural Herbs & Spices", phone: "01815-455664", email: "spices@sundarban.com", address: "Satkhira Sadar", bin: "56566779834", openingBalance: 39000, createdAt: new Date("2026-01-14") },
  { id: "sup-15", name: "Surma Food Lab Ingredients", phone: "01816-566775", email: "contact@surmalab.com", address: "Chhatak, Sunamganj", bin: "67677880945", openingBalance: 22000, createdAt: new Date("2026-01-15") },
  { id: "sup-16", name: "Bismillah Organic Growers Trust", phone: "01817-677886", email: "bismillah@growers.bd", address: "Bogura Sadar", bin: "78788991056", openingBalance: 73000, createdAt: new Date("2026-01-16") },
  { id: "sup-17", name: "Desh Pure Mustard Seeds Co", phone: "01818-788997", email: "mustard@deshpure.com", address: "Sirajganj", bin: "89899002167", openingBalance: 51000, createdAt: new Date("2026-01-17") },
  { id: "sup-18", name: "Shonali Agro Grain Logistics", phone: "01819-899008", email: "supply@shonaliagro.com", address: "Dinajpur Sadar", bin: "90900113278", openingBalance: 88000, createdAt: new Date("2026-01-18") },
  { id: "sup-19", name: "Green Valley Chili Growers", phone: "01911-900119", email: "chili@greenvalley.com", address: "Sariakandi, Bogra", bin: "11011224389", openingBalance: 61000, createdAt: new Date("2026-01-19") },
  { id: "sup-20", name: "Crown Caps & Seals Bangladesh", phone: "01912-011220", email: "caps@crownseals.com", address: "Demra, Dhaka", bin: "22122335490", openingBalance: 19000, createdAt: new Date("2026-01-20") },
];

// 5. Initial Customers
export const initialCustomers: CustomerRecord[] = [
  { id: "cust-1", name: "Shwapno Super Shop (Tejgaon Central)", phone: "01721-112233", email: "procure@shwapno.com", address: "Tejgaon Gulshan Link Rd, Dhaka", customerType: "WHOLESALE", creditLimit: 500000, openingBalance: 125000, creditBalance: 0, createdAt: new Date("2026-01-01") },
  { id: "cust-2", name: "Agora Retail Chain (Gulshan)", phone: "01722-223344", email: "supply@agora.com.bd", address: "Gulshan Avenue, Dhaka", customerType: "WHOLESALE", creditLimit: 400000, openingBalance: 84000, creditBalance: 0, createdAt: new Date("2026-01-02") },
  { id: "cust-3", name: "Meena Bazar Supermarket (Dhanmondi)", phone: "01723-334455", email: "purchasing@meenabazar.com.bd", address: "Satmasjid Road, Dhanmondi, Dhaka", customerType: "WHOLESALE", creditLimit: 350000, openingBalance: 62000, creditBalance: 0, createdAt: new Date("2026-01-03") },
  { id: "cust-4", name: "Unimart Gourmet Grocery (Gulshan-2)", phone: "01724-445566", email: "orders@unimart.com.bd", address: "Gulshan-2 Circle, Dhaka", customerType: "RETAIL", creditLimit: 300000, openingBalance: 45000, creditBalance: 0, createdAt: new Date("2026-01-04") },
  { id: "cust-5", name: "Lavender Super Store (Gulshan-1)", phone: "01725-556677", email: "lavender@dhaka.net", address: "Gulshan-1, Dhaka", customerType: "RETAIL", creditLimit: 200000, openingBalance: 31000, creditBalance: 0, createdAt: new Date("2026-01-05") },
  { id: "cust-6", name: "Prince Bazar Departmental (Mirpur)", phone: "01726-667788", email: "princebazar@mirpur.com", address: "Section-1, Mirpur, Dhaka", customerType: "RETAIL", creditLimit: 250000, openingBalance: 53000, creditBalance: 0, createdAt: new Date("2026-01-06") },
  { id: "cust-7", name: "Daily Shopping Retail Ltd (Uttara)", phone: "01727-778899", email: "dailyshopping@pran.com.bd", address: "Sector-3, Uttara, Dhaka", customerType: "WHOLESALE", creditLimit: 350000, openingBalance: 78000, creditBalance: 0, createdAt: new Date("2026-01-07") },
  { id: "cust-8", name: "Well Food Grocery Outlets (CTG)", phone: "01728-889900", email: "grocery@wellfoodbd.com", address: "GEC Circle, Chittagong", customerType: "WHOLESALE", creditLimit: 300000, openingBalance: 67000, creditBalance: 0, createdAt: new Date("2026-01-08") },
  { id: "cust-9", name: "ACI Logistics Super Outlet (Mohakhali)", phone: "01729-990011", email: "outlets@aci-bd.com", address: "Mohakhali C/A, Dhaka", customerType: "WHOLESALE", creditLimit: 450000, openingBalance: 92000, creditBalance: 0, createdAt: new Date("2026-01-09") },
  { id: "cust-10", name: "Almas General Store (Banani)", phone: "01821-123456", email: "almas@banani.com", address: "Road 11, Banani, Dhaka", customerType: "RETAIL", creditLimit: 150000, openingBalance: 24000, creditBalance: 0, createdAt: new Date("2026-01-10") },
  { id: "cust-11", name: "Bengal Meat Gourmet Store (Dhanmondi)", phone: "01822-234567", email: "retail@bengalmeat.com", address: "Dhanmondi 27, Dhaka", customerType: "RETAIL", creditLimit: 200000, openingBalance: 38000, creditBalance: 0, createdAt: new Date("2026-01-11") },
  { id: "cust-12", name: "Foodland Hypermarket (Bashundhara)", phone: "01823-345678", email: "manager@foodland.com.bd", address: "Level B1, Bashundhara City, Dhaka", customerType: "RETAIL", creditLimit: 280000, openingBalance: 49000, creditBalance: 0, createdAt: new Date("2026-01-12") },
  { id: "cust-13", name: "QuickMart Express (Sylhet)", phone: "01824-456789", email: "orders@quickmart.sylhet.bd", address: "Zindabazar, Sylhet", customerType: "RETAIL", creditLimit: 180000, openingBalance: 29000, creditBalance: 0, createdAt: new Date("2026-01-13") },
  { id: "cust-14", name: "Rahmania Wholesale Food Mart", phone: "01825-567890", email: "rahmania@moulvibazar.com", address: "Moulvibazar Wholesale Market, Dhaka", customerType: "WHOLESALE", creditLimit: 600000, openingBalance: 175000, creditBalance: 0, createdAt: new Date("2026-01-14") },
  { id: "cust-15", name: "Khan Brothers Trading Co", phone: "01826-678901", email: "khanbros@khatunganj.com", address: "Khatunganj, Chittagong", customerType: "WHOLESALE", creditLimit: 750000, openingBalance: 215000, creditBalance: 0, createdAt: new Date("2026-01-15") },
  { id: "cust-16", name: "Janata Departmental Store (Rajshahi)", phone: "01827-789012", email: "janata@rajshahimart.com", address: "Shaheb Bazar, Rajshahi", customerType: "RETAIL", creditLimit: 160000, openingBalance: 34000, creditBalance: 0, createdAt: new Date("2026-01-16") },
  { id: "cust-17", name: "Green Leaf Modern Groceries (Khulna)", phone: "01828-890123", email: "greenleaf@khulna.com", address: "Shibbari More, Khulna", customerType: "RETAIL", creditLimit: 170000, openingBalance: 27000, creditBalance: 0, createdAt: new Date("2026-01-17") },
  { id: "cust-18", name: "Barisal Central Super Mart", phone: "01829-901234", email: "supermart@barisal.com", address: "Sadar Road, Barisal", customerType: "RETAIL", creditLimit: 140000, openingBalance: 22000, creditBalance: 0, createdAt: new Date("2026-01-18") },
  { id: "cust-19", name: "Comilla Megamart", phone: "01921-012345", email: "sales@comillamegamart.com", address: "Kandirpar, Comilla", customerType: "RETAIL", creditLimit: 190000, openingBalance: 36000, creditBalance: 0, createdAt: new Date("2026-01-19") },
  { id: "cust-20", name: "Bogra Daily Mart", phone: "01922-123456", email: "dailymart@bogra.net", address: "Satmatha, Bogra", customerType: "RETAIL", creditLimit: 150000, openingBalance: 19000, creditBalance: 0, createdAt: new Date("2026-01-20") },
];

// 6. Initial Purchase Orders
const poStatuses = ["APPROVED", "RECEIVED", "COMPLETED", "DRAFT", "PENDING_APPROVAL"];
export const initialPurchaseOrders: PurchaseOrderRecord[] = Array.from({ length: 20 }, (_, idx) => {
  const i = idx + 1;
  const prod = initialProducts[(i - 1) % initialProducts.length];
  const sup = initialSuppliers[(i - 1) % initialSuppliers.length];
  const qty = 50 + i * 10;
  const unitPrice = prod.costPrice;
  const total = qty * unitPrice;
  const status = poStatuses[(i - 1) % poStatuses.length];
  const items = JSON.stringify([{ productId: prod.id, productName: prod.name, quantity: qty, unitPrice, total }]);

  return {
    id: `po-${i}`,
    orderNo: `PO-2026-${String(i).padStart(3, "0")}`,
    supplierId: sup.id,
    productId: prod.id,
    quantity: qty,
    unitPrice,
    total,
    status,
    paymentStatus: status === "COMPLETED" ? "PAID" : "PARTIAL",
    paidAmount: status === "COMPLETED" ? total : Math.floor(total * 0.6),
    dueAmount: status === "COMPLETED" ? 0 : Math.floor(total * 0.4),
    items,
    notes: `Regular procurement for ${prod.name}`,
    orderDate: new Date(Date.now() - (21 - i) * 86400000),
    createdAt: new Date(Date.now() - (21 - i) * 86400000),
  };
});

// 7. Initial Production Orders
const prdStatuses = ["COMPLETED", "IN_PROGRESS", "QUALITY_CHECK", "PLANNED", "SCHEDULED"];
export const initialProductionOrders: ProductionOrderRecord[] = Array.from({ length: 20 }, (_, idx) => {
  const i = idx + 1;
  const prod = initialProducts[(i - 1) % initialProducts.length];
  const plannedQty = 500 + i * 150;
  const producedQty = i % 4 === 0 ? 0 : plannedQty - (i % 3 === 0 ? 25 : 0);

  return {
    id: `prd-${i}`,
    orderNo: `PRD-2026-${String(i).padStart(3, "0")}`,
    productId: prod.id,
    plannedQty,
    producedQty,
    status: prdStatuses[(i - 1) % prdStatuses.length],
    batchNo: `BATCH-26${String(i).padStart(2, "0")}`,
    manufacturingDate: new Date(Date.now() - (30 - i) * 86400000),
    expiryDate: new Date(Date.now() + (365 - i * 5) * 86400000),
    createdAt: new Date(Date.now() - (30 - i) * 86400000),
  };
});

// 8. Initial Sales Orders
const soStatuses = ["DELIVERED", "CONFIRMED", "PROCESSING", "DISPATCHED", "PENDING"];
const payStatuses = ["PAID", "PAID", "PARTIAL", "PAID", "UNPAID"];
export const initialSalesOrders: SalesOrderRecord[] = Array.from({ length: 20 }, (_, idx) => {
  const i = idx + 1;
  const prod = initialProducts[(i - 1) % initialProducts.length];
  const cust = initialCustomers[(i - 1) % initialCustomers.length];
  const qty = 10 + (i % 5) * 5;
  const unitPrice = prod.sellingPrice;
  const total = qty * unitPrice;
  const status = soStatuses[(i - 1) % soStatuses.length];
  const paymentStatus = payStatuses[(i - 1) % payStatuses.length];
  const vatAmount = Math.round(total * 0.15);
  const items = JSON.stringify([{ productId: prod.id, productName: prod.name, quantity: qty, unitPrice, total }]);

  return {
    id: `so-${i}`,
    orderNo: `SO-2026-${String(i).padStart(3, "0")}`,
    customerId: cust.id,
    productId: prod.id,
    quantity: qty,
    unitPrice,
    total,
    status,
    paymentStatus,
    paidAmount: paymentStatus === "PAID" ? total : paymentStatus === "PARTIAL" ? Math.floor(total * 0.5) : 0,
    dueAmount: paymentStatus === "PAID" ? 0 : paymentStatus === "PARTIAL" ? Math.floor(total * 0.5) : total,
    vatAmount,
    vatPaid: paymentStatus === "PAID",
    items,
    notes: `Commercial wholesale invoice for ${cust.name}`,
    orderDate: new Date(Date.now() - (25 - i) * 86400000),
    createdAt: new Date(Date.now() - (25 - i) * 86400000),
  };
});

// 9. Initial Product Returns
const returnReasons = [
  "Damaged carton seal during transit",
  "Customer requested replacement for nearing expiry",
  "Label printing imperfection",
  "Incorrect outer box dispatched",
  "Store overstock return agreement",
];
const returnDispositions = ["RESTOCK", "QUARANTINE", "SCRAP", "RETURN_TO_SUPPLIER"];
const returnStatuses = ["RESOLVED", "APPROVED", "INSPECTING", "PENDING"];
export const initialProductReturns: ProductReturnRecord[] = Array.from({ length: 20 }, (_, idx) => {
  const i = idx + 1;
  const so = initialSalesOrders[(i - 1) % initialSalesOrders.length];
  const prod = initialProducts[(i - 1) % initialProducts.length];
  const cust = initialCustomers[(i - 1) % initialCustomers.length];
  const quantity = 3 + (i % 4);
  const unitPrice = prod.sellingPrice;
  const refundAmount = quantity * unitPrice;

  return {
    id: `ret-${i}`,
    returnNo: `RET-2026-${String(i).padStart(3, "0")}`,
    salesOrderId: so.id,
    invoiceNo: so.orderNo,
    customerId: cust.id,
    customerName: cust.name,
    productId: prod.id,
    batchNo: `BATCH-260${(i % 5) + 1}`,
    soldQty: so.quantity,
    quantity,
    unitPrice,
    refundAmount,
    reason: returnReasons[(i - 1) % returnReasons.length],
    condition: "SALEABLE",
    status: returnStatuses[(i - 1) % returnStatuses.length],
    disposition: returnDispositions[(i - 1) % returnDispositions.length],
    qcStatus: "PASSED",
    qcNotes: "Visual and seal inspection verified ok",
    resolutionType: "REFUND",
    refundMethod: "BANK_TRANSFER",
    vatAdjustment: Math.round(refundAmount * 0.15),
    vatAdjusted: true,
    createdAt: new Date(Date.now() - (20 - i) * 86400000),
  };
});

// 10. Initial Stock Movements
const moveTypes = ["IN", "OUT", "IN", "OUT", "TRANSFER", "ADJUSTMENT"];
export const initialStockMovements: StockMovementRecord[] = Array.from({ length: 20 }, (_, idx) => {
  const i = idx + 1;
  const prod = initialProducts[(i - 1) % initialProducts.length];
  const wh = initialWarehouses[(i - 1) % initialWarehouses.length];
  const type = moveTypes[(i - 1) % moveTypes.length];
  const quantity = 50 + i * 20;

  return {
    id: `sm-${i}`,
    productId: prod.id,
    warehouseId: wh.id,
    type,
    quantity,
    reference: type === "IN" ? `GRN-2026-${String(i).padStart(3, "0")}` : type === "OUT" ? `DISP-SO-${String(i).padStart(3, "0")}` : `ADJ-2026-${String(i).padStart(3, "0")}`,
    notes: `${type} movement for ${prod.name} at ${wh.name}`,
    createdAt: new Date(Date.now() - (20 - i) * 86400000),
    product: prod,
  };
});

// 11. Initial Courier Shipments
const providers = ["Steadfast", "Pathao Courier", "RedX Express", "Paperfly", "eCourier", "Sundarban Courier", "SA Paribahan"];
const shipmentStatuses = ["DELIVERED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "BOOKED", "RETURNED"];
export const initialCourierShipments: CourierShipmentRecord[] = Array.from({ length: 20 }, (_, idx) => {
  const i = idx + 1;
  const so = initialSalesOrders[(i - 1) % initialSalesOrders.length];
  const provider = providers[(i - 1) % providers.length];
  const status = shipmentStatuses[(i - 1) % shipmentStatuses.length];

  return {
    id: `cs-${i}`,
    consignmentId: `CN-2026-${String(1000 + i)}`,
    provider,
    salesOrderId: so.id,
    trackingCode: `${provider.slice(0, 3).toUpperCase()}-${String(840210 + i * 17)}`,
    status,
    codAmount: status === "DELIVERED" || status === "IN_TRANSIT" ? 3500 + i * 450 : 0,
    deliveryCharge: 120 + (i % 4) * 30,
    createdAt: new Date(Date.now() - (18 - i) * 86400000),
  };
});

// 12. Initial VAT Transactions
export const initialVatTransactions: VatTransactionRecord[] = Array.from({ length: 20 }, (_, idx) => {
  const i = idx + 1;
  const taxableAmount = 20000 + i * 4500;
  const vatRate = 15.0;
  const vatAmount = Math.round((taxableAmount * vatRate) / 100);

  return {
    id: `vat-${i}`,
    transactionNo: `TX-VAT-2026-${String(i).padStart(3, "0")}`,
    transactionType: "SALES_VAT",
    taxableAmount,
    vatRate,
    vatAmount,
    transactionDate: new Date(Date.now() - (22 - i) * 86400000),
    mushakForm: "Mushak 6.3",
    createdAt: new Date(Date.now() - (22 - i) * 86400000),
  };
});

// 13. Initial Account Transactions
export const initialAccountTransactions: AccountTransactionRecord[] = Array.from({ length: 20 }, (_, idx) => {
  const i = idx + 1;
  const isIncoming = i % 2 === 1;
  const amount = 15000 + i * 3200;

  return {
    id: `tx-${i}`,
    transactionNo: `TX-2026-${String(i).padStart(3, "0")}`,
    type: isIncoming ? "INCOMING" : "OUTGOING",
    category: isIncoming ? "SALES_COLLECTION" : "SUPPLIER_PAYMENT",
    amount,
    paymentMethod: i % 3 === 0 ? "BKASH" : i % 2 === 0 ? "BANK_TRANSFER" : "CASH",
    reference: isIncoming ? `SO-2026-${String(i).padStart(3, "0")}` : `PO-2026-${String(i).padStart(3, "0")}`,
    partyName: isIncoming ? initialCustomers[(i - 1) % initialCustomers.length].name : initialSuppliers[(i - 1) % initialSuppliers.length].name,
    status: "COMPLETED",
    transactionDate: new Date(Date.now() - (20 - i) * 86400000),
    notes: `${isIncoming ? "Customer sales payment received" : "Supplier purchase payment disbursed"}`,
    createdAt: new Date(Date.now() - (20 - i) * 86400000),
  };
});

// 14. Initial Audit Logs
const auditActions = ["USER_LOGIN", "PRODUCT_CREATED", "PO_APPROVED", "STOCK_ADJUSTED", "SO_DISPATCHED", "BATCH_RELEASED", "VAT_FILED"];
export const initialAuditLogs: AuditLogRecord[] = Array.from({ length: 20 }, (_, idx) => {
  const i = idx + 1;
  const u = initialUsers[(i - 1) % initialUsers.length];
  const action = auditActions[(i - 1) % auditActions.length];
  const entity = ["Product", "SalesOrder", "PurchaseOrder", "StockMovement", "ProductionOrder", "VatTransaction"][i % 6];

  return {
    id: `log-${i}`,
    userId: u.id,
    action,
    entity,
    entityId: `REF-${1000 + i}`,
    details: `Action ${action} executed on ${entity} by ${u.name} (${u.role})`,
    createdAt: new Date(Date.now() - (20 - i) * 3600000),
  };
});
