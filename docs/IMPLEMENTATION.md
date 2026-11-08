# Implementation map

## Implemented foundations
- 58 route entries and sidebar navigation.
- Dashboard live counts.
- Generic CRUD REST endpoints for products, suppliers, customers, warehouses, stock movements, purchase orders, production orders, sales orders, returns, courier shipments and VAT transactions.
- Login/logout cookie flow with password hashing and signed JWT.
- Prisma schema and sample seed records.
- Search, create, edit, delete, CSV export, empty/loading/error states.

## Screens requiring domain-specific workflow completion
The UI registry includes all 58 pages. Several screens currently share the nearest underlying entity workspace (for example, Mushak registers use VAT transactions and purchase GRN uses purchase orders). Before production use, implement dedicated transaction tables, line-item relations, atomic stock posting, approval workflows, and role-specific permissions for each process.

## Critical production engineering tasks
1. Add database transactions for purchase receiving, production consumption/output, sales dispatch, returns and COD settlement.
2. Add BOM and BOM line models; calculate expected vs actual material consumption.
3. Add stock balance projection or ledger aggregation with warehouse, batch and FEFO rules.
4. Add invoice numbering, immutable document snapshots and audit trail writes.
5. Implement provider-specific courier adapters with secure credential storage, webhook signature verification, idempotency and retry queue.
6. Implement NBR-validated Mushak layouts and VAT rules with effective dates.
7. Add RBAC enforcement to every API endpoint, rate limiting, CSRF strategy, input schemas, tests and backups.
