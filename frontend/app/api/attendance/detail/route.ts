import { NextResponse } from "next/server";
import { backendFetch } from "@/src/lib/backend";

export async function GET() {
  try {
    const response = await backendFetch({
      endpoint: "/absensi/detail",
      method: "GET",
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}