import { NextResponse } from "next/server";
import { backendFetch } from "@/src/lib/backend";

export async function DELETE() {
  try {
    const response = await backendFetch({
      endpoint: "/izin/cancel",
      method: "DELETE",
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