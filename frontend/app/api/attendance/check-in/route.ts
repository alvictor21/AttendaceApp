import { NextResponse } from "next/server";
import { backendFetch } from "@/src/lib/backend";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const response = await backendFetch({
      endpoint: "/absensi/check-in",
      method: "POST",
      body: formData,
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