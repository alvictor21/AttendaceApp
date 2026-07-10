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
  const { nik } = await params;

  const response = await backendFetch({
    endpoint: `/admin/guru/${nik}`,
    method: "GET",
  });

  const data = await response.json();

  return NextResponse.json(data, {
    status: response.status,
  });
}

export async function PUT(
  req: NextRequest,
  { params }: Params
) {
  const { nik } = await params;

  const body = await req.json();

  const response = await backendFetch({
    endpoint: `/admin/guru/${nik}`,
    method: "PUT",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  return NextResponse.json(data, {
    status: response.status,
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: Params
) {
  const { nik } = await params;

  const response = await backendFetch({
    endpoint: `/admin/guru/${nik}`,
    method: "DELETE",
  });

  const data = await response.json();

  return NextResponse.json(data, {
    status: response.status,
  });
}