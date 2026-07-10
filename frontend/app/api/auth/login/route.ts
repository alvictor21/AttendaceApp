import { NextRequest, NextResponse } from "next/server";
import { API } from "@/src/meta/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const backendResponse = await fetch(API.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          message: data.message ?? "Login gagal.",
        },
        {
          status: backendResponse.status,
        }
      );
    }

    const response = NextResponse.json({
      message: data.message,
      user: data.user,
    });

    response.cookies.set({
      name: "token",
      value: data.access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 jam
    });

    return response;
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