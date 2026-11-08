import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
export async function GET(){
 const [products,suppliers,customers,purchases,orders,production,returns,shipments,stock]=await Promise.all([
 prisma.product.count(),prisma.supplier.count(),prisma.customer.count(),prisma.purchaseOrder.count(),prisma.salesOrder.count(),prisma.productionOrder.count(),prisma.productReturn.count(),prisma.courierShipment.count(),prisma.stockMovement.findMany({include:{product:true},take:100})
 ]);
 return NextResponse.json({metrics:{products,suppliers,customers,purchases,orders,production,returns,shipments},recentMovements:stock});
}
