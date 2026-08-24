import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "../../../lib/auth";

export async function POST(request) {
  const { password } = await request.json();

  if (password !== process.env.TEAM_PASSWORD) {
    return NextResponse.json({ error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, password, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
