import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API } from "@/src/meta/api";

export async function GET() {
  const cookieStore = await cookies();

  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const response = await fetch(API.ME, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const data = await response.json();

  return NextResponse.json(data, {
    status: response.status,
  });
}