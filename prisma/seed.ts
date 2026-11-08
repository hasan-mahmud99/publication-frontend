import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding comprehensive dataset (20+ records per model)...");

  const passwordHash = await bcrypt.hash("ChangeMe123!", 12);

  // 1. Users (20 users)
  const usersData = [
    { name: "System Administrator", email: "admin@example.com", role: "ADMIN" },
    { name: "Tanvir Ahmed", email: "tanvir.manager@example.com", role: "FACTORY_MANAGER" },
    { name: "Nusrat Jahan", email: "nusrat.inventory@example.com", role: "INVENTORY_LEAD" },
    { name: "Kamrul Hassan", email: "kamrul.qc@example.com", role: "QC_OFFICER" },
    { name: "Farhana Chowdhury", email: "farhana.sales@example.com", role: "SALES_DIRECTOR" },
    { name: "Shafiqul Islam", email: "shafiq.accounts@example.com", role: "ACCOUNTANT" },
    { name: "Mahmudur Rahman", email: "mahmud.procure@example.com", role: "PURCHASE_OFFICER" },
    { name: "Rokeya Begum", email: "rokeya.wh@example.com", role: "WAREHOUSE_INCHARGE" },
    { name: "Anisur Rahman", email: "anis.operator@example.com", role: "PRODUCTION_OPERATOR" },
    { name: "Sabrina Yasmin", email: "sabrina.pack@example.com", role: "PACKAGING_SUPERVISOR" },
    { name: "Zubair Hossain", email: "zubair.dispatch@example.com", role: "LOGISTICS_COORDINATOR" },
    { name: "Mehedi Hasan", email: "mehedi.billing@example.com", role: "BILLING_OFFICER" },
    { name: "Fariha Sultana", email: "fariha.vat@example.com", role: "VAT_SPECIALIST" },
    { name: "Tariqul Alam", email: "tariq.chemist@example.com", role: "FOOD_CHEMIST" },
    { name: "Nasim Ullah", email: "nasim.engineer@example.com", role: "MAINTENANCE_ENG" },
    { name: "Tahmina Akter", email: "tahmina.support@example.com", role: "CUSTOMER_SERVICE" },
    { name: "Arifur Zaman", email: "arif.rso.dhaka@example.com", role: "RSO_DHAKA" },
    { name: "Golam Mostafa", email: "mostafa.rso.ctg@example.com", role: "RSO_CHITTAGONG" },
    { name: "Shahidul Karim", email: "shahid.audit@example.com", role: "INTERNAL_AUDITOR" },
    { name: "Sadia Afrin", email: "sadia.planner@example.com", role: "SUPPLY_CHAIN_PLANNER" },
  ];

  const createdUsers = [];
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, isActive: true },
      create: { name: u.name, email: u.email, passwordHash, role: u.role, isActive: true },
    });
    createdUsers.push(user);
  }

  // 2. Warehouses (20 warehouses)
  const warehousesData = [
    { code: "MAIN", name: "Central Head Office Warehouse", address: "Tejgaon I/A, Dhaka" },
    { code: "WH-SAVAR", name: "Savar Production Plant Godown", address: "EPZ Road, Savar, Dhaka" },
    { code: "WH-GAZIPUR", name: "Gazipur Raw Spices Depot", address: "Tongi I/A, Gazipur" },
    { code: "WH-CTG-01", name: "Chittagong Port Distribution Hub", address: "Agrabad C/A, Chittagong" },
    { code: "WH-CTG-02", name: "Chittagong Pahartali Depot", address: "Pahartali, Chittagong" },
    { code: "WH-SYL-01", name: "Sylhet Regional Depot", address: "Subidbazar, Sylhet" },
    { code: "WH-RAJ-01", name: "Rajshahi Northern Hub", address: "Sapura Industrial Area, Rajshahi" },
    { code: "WH-KHU-01", name: "Khulna Divisional Depot", address: "Khalishpur, Khulna" },
    { code: "WH-BAR-01", name: "Barisal Riverfront Store", address: "Natun Bazar, Barisal" },
    { code: "WH-BOG-01", name: "Bogra Central Transit Hub", address: "Sherpur Road, Bogra" },
    { code: "WH-COM-01", name: "Comilla Highway Depot", address: "Paduar Bazar, Comilla" },
    { code: "WH-RAN-01", name: "Rangpur Transit Facility", address: "Dhap, Rangpur" },
    { code: "WH-MYM-01", name: "Mymensingh Regional Store", address: "Maskanda, Mymensingh" },
    { code: "WH-NAR-01", name: "Narayanganj River Depot", address: "Tanbazar, Narayanganj" },
    { code: "WH-MIR-01", name: "Mirpur Local Fulfillment Depot", address: "Section-10, Mirpur, Dhaka" },
    { code: "WH-UTT-01", name: "Uttara Fast Delivery Hub", address: "Sector-7, Uttara, Dhaka" },
    { code: "WH-KER-01", name: "Keraniganj Packaging Warehouse", address: "Aganagar, Keraniganj" },
    { code: "WH-JES-01", name: "Jessore Border Trade Depot", address: "New Market Area, Jessore" },
    { code: "WH-COX-01", name: "Cox's Bazar Tourist Market Depo", address: "Kolatoli Road, Cox's Bazar" },
    { code: "WH-KUS-01", name: "Kushtia Grains & Spices Depot", address: "NS Road, Kushtia" },
  ];

  const createdWarehouses = [];
  for (const w of warehousesData) {
    const wh = await prisma.warehouse.upsert({
      where: { code: w.code },
      update: { name: w.name, address: w.address, isActive: true },
      create: { code: w.code, name: w.name, address: w.address, isActive: true },
    });
    createdWarehouses.push(wh);
  }

  // 3. Products (20 products)
  const productsData = [
    { sku: "SAU-001", name: "Tomato Ketchup 350g Glass Bottle", category: "Sauces", unit: "bottle", sellingPrice: 180, costPrice: 120, reorderLevel: 25 },
    { sku: "SAU-002", name: "Hot Chilli Garlic Sauce 250g", category: "Sauces", unit: "bottle", sellingPrice: 220, costPrice: 150, reorderLevel: 20 },
    { sku: "SAU-003", name: "Thai Sweet Chilli Dip 250g Jar", category: "Sauces", unit: "jar", sellingPrice: 210, costPrice: 140, reorderLevel: 15 },
    { sku: "SAU-004", name: "Traditional Mustard Kasundi 200g", category: "Condiments", unit: "jar", sellingPrice: 160, costPrice: 95, reorderLevel: 30 },
    { sku: "SAU-005", name: "Tamarind Sweet & Sour Sauce 350g", category: "Sauces", unit: "bottle", sellingPrice: 195, costPrice: 130, reorderLevel: 20 },
    { sku: "SAU-006", name: "Dark Brewed Soy Sauce 500ml", category: "Condiments", unit: "bottle", sellingPrice: 175, costPrice: 110, reorderLevel: 25 },
    { sku: "SAU-007", name: "Synthetic White Vinegar 500ml", category: "Condiments", unit: "bottle", sellingPrice: 90, costPrice: 55, reorderLevel: 40 },
    { sku: "SAU-008", name: "Smoky BBQ Sauce & Glaze 350g", category: "Sauces", unit: "bottle", sellingPrice: 290, costPrice: 195, reorderLevel: 15 },
    { sku: "SAU-009", name: "Green Chilli Pickle Chutney 200g", category: "Sauces", unit: "jar", sellingPrice: 185, costPrice: 115, reorderLevel: 15 },
    { sku: "SAU-010", name: "Sweet Mango Murabba & Chutney 400g", category: "Sauces", unit: "jar", sellingPrice: 240, costPrice: 155, reorderLevel: 15 },
    { sku: "SPC-001", name: "Turmeric Powder (Haldi) 500g Pouch", category: "Spices", unit: "pack", sellingPrice: 280, costPrice: 190, reorderLevel: 50 },
    { sku: "SPC-002", name: "Red Chilli Powder Extra Hot 500g", category: "Spices", unit: "pack", sellingPrice: 420, costPrice: 310, reorderLevel: 40 },
    { sku: "SPC-003", name: "Coriander Seed Ground Powder 200g", category: "Spices", unit: "pack", sellingPrice: 130, costPrice: 85, reorderLevel: 35 },
    { sku: "SPC-004", name: "Roasted Cumin Powder (Jeera) 200g", category: "Spices", unit: "pack", sellingPrice: 240, costPrice: 160, reorderLevel: 30 },
    { sku: "SPC-005", name: "Royal Garam Masala Blend 100g", category: "Spices", unit: "pack", sellingPrice: 170, costPrice: 110, reorderLevel: 25 },
    { sku: "SPC-006", name: "Special Meat Curry Masala 200g", category: "Spices", unit: "pack", sellingPrice: 190, costPrice: 125, reorderLevel: 35 },
    { sku: "SPC-007", name: "Traditional Fish Curry Masala 200g", category: "Spices", unit: "pack", sellingPrice: 175, costPrice: 115, reorderLevel: 30 },
    { sku: "SPC-008", name: "Kacchi Biryani Mix Blend 100g", category: "Spices", unit: "pack", sellingPrice: 165, costPrice: 105, reorderLevel: 25 },
    { sku: "SPC-009", name: "Fine Ground Black Pepper 100g", category: "Spices", unit: "pack", sellingPrice: 260, costPrice: 180, reorderLevel: 20 },
    { sku: "SPC-010", name: "Tangy Chat Masala Sprinkler 100g", category: "Spices", unit: "pack", sellingPrice: 140, costPrice: 85, reorderLevel: 25 },
  ];

  const createdProducts = [];
  for (const p of productsData) {
    const prod = await prisma.product.upsert({
      where: { sku: p.sku },
      update: { ...p, isActive: true },
      create: { ...p, isActive: true },
    });
    createdProducts.push(prod);
  }

  // 4. Suppliers (20 suppliers)
  const suppliersData = [
    { name: "Bengal Agro Organic Farms", phone: "01711-100201", email: "sales@bengalagro.com", address: "Narsingdi Sadar, Dhaka", bin: "10293847561", openingBalance: 45000 },
    { name: "Padma Spice Millers Ltd", phone: "01712-200302", email: "info@padmaspice.com", address: "Ishwardi, Pabna", bin: "20394857612", openingBalance: 82000 },
    { name: "Meghna Pet Packaging & Caps", phone: "01713-300403", email: "orders@meghnapack.com", address: "Tongi I/A, Gazipur", bin: "30495868723", openingBalance: 15000 },
    { name: "Square Agro Commodities Ltd", phone: "01714-400504", email: "procure@squareagro.com", address: "Savar, Dhaka", bin: "40596879834", openingBalance: 125000 },
    { name: "Pran Raw Agro Suppliers", phone: "01715-500605", email: "agro@pran.com.bd", address: "Ghorashal, Narsingdi", bin: "50697880945", openingBalance: 95000 },
    { name: "City Grain & Seeds Importers", phone: "01716-600706", email: "sales@citygrain.com", address: "Khatunganj, Chittagong", bin: "60798991056", openingBalance: 210000 },
    { name: "Akij Corrugated Carton Mills", phone: "01717-700807", email: "carton@akij.net", address: "Manikganj", bin: "70899002167", openingBalance: 32000 },
    { name: "Jamuna Flexible Pouch Industries", phone: "01718-800908", email: "packaging@jamuna.com", address: "Mirzapur, Tangail", bin: "80900113278", openingBalance: 64000 },
    { name: "Karnaphuli Chemical & Vinegar Co", phone: "01719-900019", email: "chem@karnaphuli.com", address: "Kalurghat, Chittagong", bin: "91011224389", openingBalance: 28000 },
    { name: "Rupsha Refined Food Salt Mills", phone: "01811-011220", email: "sales@rupshasalt.com", address: "Rupsha, Khulna", bin: "12122335490", openingBalance: 18000 },
    { name: "Apex Food Additives & Essences", phone: "01812-122331", email: "info@apexfood.com", address: "Tejgaon, Dhaka", bin: "23233446501", openingBalance: 56000 },
    { name: "Delta Glass Container Industries", phone: "01813-233442", email: "bottles@deltaglass.com", address: "Murapara, Narayanganj", bin: "34344557612", openingBalance: 110000 },
    { name: "Teesta Agricultural Cooperative", phone: "01814-344553", email: "coop@teesta.org", address: "Pirgachha, Rangpur", bin: "45455668723", openingBalance: 42000 },
    { name: "Sundarban Natural Herbs & Spices", phone: "01815-455664", email: "spices@sundarban.com", address: "Satkhira Sadar", bin: "56566779834", openingBalance: 39000 },
    { name: "Surma Food Lab Ingredients", phone: "01816-566775", email: "contact@surmalab.com", address: "Chhatak, Sunamganj", bin: "67677880945", openingBalance: 22000 },
    { name: "Bismillah Organic Growers Trust", phone: "01817-677886", email: "bismillah@growers.bd", address: "Bogura Sadar", bin: "78788991056", openingBalance: 73000 },
    { name: "Desh Pure Mustard Seeds Co", phone: "01818-788997", email: "mustard@deshpure.com", address: "Sirajganj", bin: "89899002167", openingBalance: 51000 },
    { name: "Shonali Agro Grain Logistics", phone: "01819-899008", email: "supply@shonaliagro.com", address: "Dinajpur Sadar", bin: "90900113278", openingBalance: 88000 },
    { name: "Green Valley Chili Growers", phone: "01911-900119", email: "chili@greenvalley.com", address: "Sariakandi, Bogra", bin: "11011224389", openingBalance: 61000 },
    { name: "Crown Caps & Seals Bangladesh", phone: "01912-011220", email: "caps@crownseals.com", address: "Demra, Dhaka", bin: "22122335490", openingBalance: 19000 },
  ];

  const createdSuppliers = [];
  for (const s of suppliersData) {
    let sup = await prisma.supplier.findFirst({ where: { name: s.name } });
    if (!sup) {
      sup = await prisma.supplier.create({ data: s });
    }
    createdSuppliers.push(sup);
  }

  // 5. Customers (20 customers)
  const customersData = [
    { name: "Shwapno Super Shop (Tejgaon Central)", phone: "01721-112233", email: "procure@shwapno.com", address: "Tejgaon Gulshan Link Rd, Dhaka", customerType: "WHOLESALE", creditLimit: 500000, openingBalance: 125000 },
    { name: "Agora Retail Chain (Gulshan)", phone: "01722-223344", email: "supply@agora.com.bd", address: "Gulshan Avenue, Dhaka", customerType: "WHOLESALE", creditLimit: 400000, openingBalance: 84000 },
    { name: "Meena Bazar Supermarket (Dhanmondi)", phone: "01723-334455", email: "purchasing@meenabazar.com.bd", address: "Satmasjid Road, Dhanmondi, Dhaka", customerType: "WHOLESALE", creditLimit: 350000, openingBalance: 62000 },
    { name: "Unimart Gourmet Grocery (Gulshan-2)", phone: "01724-445566", email: "orders@unimart.com.bd", address: "Gulshan-2 Circle, Dhaka", customerType: "RETAIL", creditLimit: 300000, openingBalance: 45000 },
    { name: "Lavender Super Store (Gulshan-1)", phone: "01725-556677", email: "lavender@dhaka.net", address: "Gulshan-1, Dhaka", customerType: "RETAIL", creditLimit: 200000, openingBalance: 31000 },
    { name: "Prince Bazar Departmental (Mirpur)", phone: "01726-667788", email: "princebazar@mirpur.com", address: "Section-1, Mirpur, Dhaka", customerType: "RETAIL", creditLimit: 250000, openingBalance: 53000 },
    { name: "Daily Shopping Retail Ltd (Uttara)", phone: "01727-778899", email: "dailyshopping@pran.com.bd", address: "Sector-3, Uttara, Dhaka", customerType: "WHOLESALE", creditLimit: 350000, openingBalance: 78000 },
    { name: "Well Food Grocery Outlets (CTG)", phone: "01728-889900", email: "grocery@wellfoodbd.com", address: "GEC Circle, Chittagong", customerType: "WHOLESALE", creditLimit: 300000, openingBalance: 67000 },
    { name: "ACI Logistics Super Outlet (Mohakhali)", phone: "01729-990011", email: "outlets@aci-bd.com", address: "Mohakhali C/A, Dhaka", customerType: "WHOLESALE", creditLimit: 450000, openingBalance: 92000 },
    { name: "Almas General Store (Banani)", phone: "01821-123456", email: "almas@banani.com", address: "Road 11, Banani, Dhaka", customerType: "RETAIL", creditLimit: 150000, openingBalance: 24000 },
    { name: "Bengal Meat Gourmet Store (Dhanmondi)", phone: "01822-234567", email: "retail@bengalmeat.com", address: "Dhanmondi 27, Dhaka", customerType: "RETAIL", creditLimit: 200000, openingBalance: 38000 },
    { name: "Foodland Hypermarket (Bashundhara)", phone: "01823-345678", email: "manager@foodland.com.bd", address: "Level B1, Bashundhara City, Dhaka", customerType: "RETAIL", creditLimit: 280000, openingBalance: 49000 },
    { name: "QuickMart Express (Sylhet)", phone: "01824-456789", email: "orders@quickmart.sylhet.bd", address: "Zindabazar, Sylhet", customerType: "RETAIL", creditLimit: 180000, openingBalance: 29000 },
    { name: "Rahmania Wholesale Food Mart", phone: "01825-567890", email: "rahmania@moulvibazar.com", address: "Moulvibazar Wholesale Market, Dhaka", customerType: "WHOLESALE", creditLimit: 600000, openingBalance: 175000 },
    { name: "Khan Brothers Trading Co", phone: "01826-678901", email: "khanbros@khatunganj.com", address: "Khatunganj, Chittagong", customerType: "WHOLESALE", creditLimit: 750000, openingBalance: 215000 },
    { name: "Janata Departmental Store (Rajshahi)", phone: "01827-789012", email: "janata@rajshahimart.com", address: "Shaheb Bazar, Rajshahi", customerType: "RETAIL", creditLimit: 160000, openingBalance: 34000 },
    { name: "Green Leaf Modern Groceries (Khulna)", phone: "01828-890123", email: "greenleaf@khulna.com", address: "Shibbari More, Khulna", customerType: "RETAIL", creditLimit: 170000, openingBalance: 27000 },
    { name: "Barisal Central Super Mart", phone: "01829-901234", email: "supermart@barisal.com", address: "Sadar Road, Barisal", customerType: "RETAIL", creditLimit: 140000, openingBalance: 22000 },
    { name: "Comilla Megamart", phone: "01921-012345", email: "sales@comillamegamart.com", address: "Kandirpar, Comilla", customerType: "RETAIL", creditLimit: 190000, openingBalance: 36000 },
    { name: "Bogra Daily Mart", phone: "01922-123456", email: "dailymart@bogra.net", address: "Satmatha, Bogra", customerType: "RETAIL", creditLimit: 150000, openingBalance: 19000 },
  ];

  const createdCustomers = [];
  for (const c of customersData) {
    let cust = await prisma.customer.findFirst({ where: { name: c.name } });
    if (!cust) {
      cust = await prisma.customer.create({ data: c });
    }
    createdCustomers.push(cust);
  }

  // 6. Purchase Orders (20 POs)
  const poStatuses = ["APPROVED", "RECEIVED", "COMPLETED", "DRAFT", "PENDING_APPROVAL"];
  const createdPOs = [];
  for (let i = 1; i <= 20; i++) {
    const orderNo = `PO-2026-${String(i).padStart(3, "0")}`;
    const sup = createdSuppliers[(i - 1) % createdSuppliers.length];
    const total = 25000 + (i * 4750);
    const status = poStatuses[(i - 1) % poStatuses.length];
    const orderDate = new Date(Date.now() - (21 - i) * 86400000);

    const po = await prisma.purchaseOrder.upsert({
      where: { orderNo },
      update: { total, status, orderDate, supplierId: sup.id },
      create: { orderNo, supplierId: sup.id, status, total, orderDate },
    });
    createdPOs.push(po);
  }

  // 7. Production Orders (20 Production Orders)
  const prdStatuses = ["COMPLETED", "IN_PROGRESS", "QUALITY_CHECK", "PLANNED", "SCHEDULED"];
  const createdProductionOrders = [];
  for (let i = 1; i <= 20; i++) {
    const orderNo = `PRD-2026-${String(i).padStart(3, "0")}`;
    const prod = createdProducts[(i - 1) % createdProducts.length];
    const plannedQty = 500 + i * 150;
    const producedQty = i % 4 === 0 ? 0 : plannedQty - (i % 3 === 0 ? 25 : 0);
    const status = prdStatuses[(i - 1) % prdStatuses.length];
    const batchNo = `BATCH-26${String(i).padStart(2, "0")}`;
    const manufacturingDate = new Date(Date.now() - (30 - i) * 86400000);
    const expiryDate = new Date(Date.now() + (365 - i * 5) * 86400000);

    const prd = await prisma.productionOrder.upsert({
      where: { orderNo },
      update: { productId: prod.id, plannedQty, producedQty, status, batchNo, manufacturingDate, expiryDate },
      create: { orderNo, productId: prod.id, plannedQty, producedQty, status, batchNo, manufacturingDate, expiryDate },
    });
    createdProductionOrders.push(prd);
  }

  // 8. Sales Orders (20 Sales Orders)
  const soStatuses = ["DELIVERED", "CONFIRMED", "PROCESSING", "DISPATCHED", "PENDING"];
  const payStatuses = ["PAID", "PAID", "PARTIAL", "PAID", "UNPAID"];
  const createdSalesOrders = [];
  for (let i = 1; i <= 20; i++) {
    const orderNo = `SO-2026-${String(i).padStart(3, "0")}`;
    const cust = createdCustomers[(i - 1) % createdCustomers.length];
    const total = 18000 + i * 3650;
    const status = soStatuses[(i - 1) % soStatuses.length];
    const paymentStatus = payStatuses[(i - 1) % payStatuses.length];
    const orderDate = new Date(Date.now() - (25 - i) * 86400000);

    const so = await prisma.salesOrder.upsert({
      where: { orderNo },
      update: { customerId: cust.id, status, total, orderDate, paymentStatus },
      create: { orderNo, customerId: cust.id, status, total, orderDate, paymentStatus },
    });
    createdSalesOrders.push(so);
  }

  // 9. Stock Movements (20 Stock Movements)
  const moveTypes = ["IN", "OUT", "IN", "OUT", "TRANSFER", "ADJUSTMENT"];
  const existingMovementsCount = await prisma.stockMovement.count();
  if (existingMovementsCount < 20) {
    for (let i = 1; i <= 20; i++) {
      const prod = createdProducts[(i - 1) % createdProducts.length];
      const wh = createdWarehouses[(i - 1) % createdWarehouses.length];
      const type = moveTypes[(i - 1) % moveTypes.length];
      const quantity = 50 + (i * 20);
      const reference = type === "IN" ? `GRN-2026-${String(i).padStart(3, "0")}` : type === "OUT" ? `DISP-SO-${String(i).padStart(3, "0")}` : `ADJ-2026-${String(i).padStart(3, "0")}`;
      const notes = `${type} movement for ${prod.name} at ${wh.name}`;

      await prisma.stockMovement.create({
        data: {
          productId: prod.id,
          warehouseId: wh.id,
          type,
          quantity,
          reference,
          notes,
          createdAt: new Date(Date.now() - (20 - i) * 86400000),
        },
      });
    }
  }

  // 10. Product Returns (20 Returns)
  const returnReasons = [
    "Damaged carton seal during transit",
    "Customer requested replacement for nearing expiry",
    "Label printing imperfection",
    "Incorrect outer box dispatched",
    "Store overstock return agreement",
  ];
  const returnDispositions = ["QUARANTINE", "RESTOCK", "SCRAP", "RETURN_TO_SUPPLIER"];
  const returnStatuses = ["RESOLVED", "APPROVED", "INSPECTING", "PENDING"];

  for (let i = 1; i <= 20; i++) {
    const returnNo = `RET-2026-${String(i).padStart(3, "0")}`;
    const so = createdSalesOrders[(i - 1) % createdSalesOrders.length];
    const prod = createdProducts[(i - 1) % createdProducts.length];
    const quantity = 5 + (i % 6) * 3;
    const reason = returnReasons[(i - 1) % returnReasons.length];
    const disposition = returnDispositions[(i - 1) % returnDispositions.length];
    const status = returnStatuses[(i - 1) % returnStatuses.length];

    await prisma.productReturn.upsert({
      where: { returnNo },
      update: { salesOrderId: so.id, productId: prod.id, quantity, reason, status, disposition },
      create: { returnNo, salesOrderId: so.id, productId: prod.id, quantity, reason, status, disposition },
    });
  }

  // 11. Courier Shipments (20 Shipments)
  const providers = ["Steadfast", "Pathao Courier", "RedX Express", "Paperfly", "eCourier", "Sundarban Courier", "SA Paribahan"];
  const shipmentStatuses = ["DELIVERED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "BOOKED", "RETURNED"];

  for (let i = 1; i <= 20; i++) {
    const consignmentId = `CN-2026-${String(1000 + i)}`;
    const provider = providers[(i - 1) % providers.length];
    const so = createdSalesOrders[(i - 1) % createdSalesOrders.length];
    const trackingCode = `${provider.slice(0, 3).toUpperCase()}-${String(840210 + i * 17)}`;
    const status = shipmentStatuses[(i - 1) % shipmentStatuses.length];
    const codAmount = status === "DELIVERED" || status === "IN_TRANSIT" ? 3500 + i * 450 : 0;
    const deliveryCharge = 120 + (i % 4) * 30;

    const existingShipment = await prisma.courierShipment.findFirst({ where: { consignmentId } });
    if (!existingShipment) {
      await prisma.courierShipment.create({
        data: { consignmentId, provider, salesOrderId: so.id, trackingCode, status, codAmount, deliveryCharge },
      });
    }
  }

  // 12. VAT Transactions (Mushak 6.3 Tax Invoices)
  for (let i = 1; i <= 20; i++) {
    const transactionNo = `TX-VAT-2026-${String(i).padStart(3, "0")}`;
    const transactionType = "SALES_VAT";
    const mushakForm = "Mushak 6.3";
    const taxableAmount = 20000 + i * 4500;
    const vatRate = 15.0;
    const vatAmount = Math.round((taxableAmount * vatRate) / 100);
    const transactionDate = new Date(Date.now() - (22 - i) * 86400000);

    await prisma.vatTransaction.upsert({
      where: { transactionNo },
      update: { transactionType, taxableAmount, vatRate, vatAmount, transactionDate, mushakForm },
      create: { transactionNo, transactionType, taxableAmount, vatRate, vatAmount, transactionDate, mushakForm },
    });
  }

  // 13. Audit Logs (20 Audit Logs)
  const auditActions = ["USER_LOGIN", "PRODUCT_CREATED", "PO_APPROVED", "STOCK_ADJUSTED", "SO_DISPATCHED", "BATCH_RELEASED", "VAT_FILED"];
  const existingAuditCount = await prisma.auditLog.count();
  if (existingAuditCount < 20) {
    for (let i = 1; i <= 20; i++) {
      const u = createdUsers[(i - 1) % createdUsers.length];
      const action = auditActions[(i - 1) % auditActions.length];
      const entity = ["Product", "SalesOrder", "PurchaseOrder", "StockMovement", "ProductionOrder", "VatTransaction"][i % 6];
      const details = `Action ${action} executed on ${entity} by ${u.name} (${u.role})`;

      await prisma.auditLog.create({
        data: {
          userId: u.id,
          action,
          entity,
          entityId: `REF-${1000 + i}`,
          details,
          createdAt: new Date(Date.now() - (20 - i) * 3600000),
        },
      });
    }
  }

  console.log("Successfully seeded 20+ records across all ERP entities!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
