import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "development-only-secret-change-me");
export async function middleware(req:NextRequest) {
 const path=req.nextUrl.pathname;
 if(path.startsWith("/api/auth")||path.startsWith("/login")||path.startsWith("/_next")||path==="/favicon.ico") return NextResponse.next();
 const token=req.cookies.get("food_erp_token")?.value;
 if(!token){if(path.startsWith("/api/")) return NextResponse.json({error:"Unauthorized"},{status:401});return NextResponse.redirect(new URL("/login",req.url));}
 try{await jwtVerify(token,secret);return NextResponse.next()}catch{if(path.startsWith("/api/"))return NextResponse.json({error:"Invalid session"},{status:401});return NextResponse.redirect(new URL("/login",req.url))}
}
export const config={matcher:["/((?!.*\\.).*)"]};
