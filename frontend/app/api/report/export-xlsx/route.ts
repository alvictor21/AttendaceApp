import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/src/lib/backend";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const response = await backendFetch({
      endpoint: `/laporan/export-xlsx?${searchParams.toString()}`,
      method: "GET",
    });

    const blob = await response.blob();

    return new NextResponse(blob, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") ??
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        "Content-Disposition":
          response.headers.get("Content-Disposition") ??
          'attachment; filename="laporan.xlsx"',
      },
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}