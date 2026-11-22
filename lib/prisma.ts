import { mockDb } from "./mock-db";
import type { PrismaClient } from "@prisma/client";

// Export mockDb as prisma to provide seamless zero-DB in-memory persistence for Vercel deployment & client demo
export const prisma = mockDb as unknown as PrismaClient;
export default prisma;
