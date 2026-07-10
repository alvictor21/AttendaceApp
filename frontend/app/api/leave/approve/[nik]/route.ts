import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/src/lib/backend";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ nik: string }> }
) {
  const { nik } = await params;

  const response = await backendFetch({
    endpoint: `/izin/approve/${nik}`,
    method: "POST",
  });

  const data = await response.json();

  return NextResponse.json(data, {
    status: response.status,
  });
}