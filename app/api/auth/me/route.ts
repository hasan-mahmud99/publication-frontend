import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("food_erp_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = await readToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        permissions: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "User not found or inactive" }, { status: 401 });
    }

    let parsedPermissions: Record<string, boolean> = {};
    if (user.permissions) {
      try {
        parsedPermissions = JSON.parse(user.permissions);
      } catch {
        parsedPermissions = {};
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        permissions: parsedPermissions,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to get user session" }, { status: 500 });
  }
}

