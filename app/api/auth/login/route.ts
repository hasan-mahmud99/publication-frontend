import { NextRequest,NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken,verifyPassword } from "@/lib/auth";
export async function POST(req:NextRequest){
 const body=await req.json();const email=String(body.email||"").trim().toLowerCase();const password=String(body.password||"");
 const user=await prisma.user.findUnique({where:{email}});
 if(!user||!user.isActive||!(await verifyPassword(password,user.passwordHash)))return NextResponse.json({error:"Invalid email or password"},{status:401});
 const token=await createToken({userId:user.id,email:user.email,role:user.role});
 const res=NextResponse.json({user:{id:user.id,name:user.name,email:user.email,role:user.role}});
 res.cookies.set("food_erp_token",token,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:60*60*12});return res;
}
