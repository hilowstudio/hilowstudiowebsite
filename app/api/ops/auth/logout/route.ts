import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/ops/auth";

export async function POST() {
  await clearSessionCookie();
  return new NextResponse(null, { status: 204 });
}

export async function DELETE() {
  await clearSessionCookie();
  return new NextResponse(null, { status: 204 });
}
