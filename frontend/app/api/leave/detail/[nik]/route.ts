import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/src/lib/backend";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ nik: string }> }
) {
  const { nik } = await params;

  const response = await backendFetch({
    endpoint: `/izin/detail/${nik}`,
    method: "GET",
  });

  const data = await response.json();

  return NextResponse.json(data, {
    status: response.status,
  });
}