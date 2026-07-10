import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/src/lib/backend";

interface Params {
  params: Promise<{
    nik: string;
  }>;
}

export async function GET(
  req: NextRequest,
  { params }: Params
) {
  try {
    const { nik } = await params;

    const response = await backendFetch({
      endpoint: `/admin/guru/${nik}/statistik-bulanan`,
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