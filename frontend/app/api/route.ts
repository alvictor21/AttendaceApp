import { NextResponse } from "next/server";
import { API } from "@/src/meta/api";

export async function POST(req: Request) {
  const body = await req.json();

  const backendRes = await fetch(API.LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json();

  if (!backendRes.ok) {
    return NextResponse.json({ message: data.message }, { status: backendRes.status });
  }

  const res = NextResponse.json({ user: data.user });

  // Token asli -> httpOnly, JS di browser TIDAK bisa baca ini
  res.cookies.set("token", data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 hari, sesuaikan
  });

  return res;
}