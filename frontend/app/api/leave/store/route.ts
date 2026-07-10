import { NextResponse } from "next/server";
import { backendFetch } from "@/src/lib/backend";

export async function POST() {
  try {
    const response = await backendFetch({
      endpoint: "/izin/store",
      method: "POST",
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}