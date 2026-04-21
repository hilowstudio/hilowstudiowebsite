import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, setSessionCookie } from "@/lib/ops/auth";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };

  if (!body.email || !body.password) {
    return NextResponse.json(
      { error: "Email and password required" },
      { status: 400 },
    );
  }

  const user = await authenticateUser(body.email, body.password);
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await setSessionCookie(user.id);
  return NextResponse.json({ id: user.id });
}
