import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/src/lib/backend";

export async function GET(request: NextRequest) {
  try {
    // ── Ambil query param bulan & tahun dari request masuk ──
    const { searchParams } = new URL(request.url);
    const bulan = searchParams.get("bulan");
    const tahun = searchParams.get("tahun");

    // ── Susun ulang query string buat diteruskan ke Laravel ──
    const params = new URLSearchParams();
    if (bulan) params.set("bulan", bulan);
    if (tahun) params.set("tahun", tahun);

    const queryString = params.toString();
    const endpoint = queryString
      ? `/absensi/history?${queryString}`
      : "/absensi/history";

    const response = await backendFetch({
      endpoint,
      method: "GET",
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(error);

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