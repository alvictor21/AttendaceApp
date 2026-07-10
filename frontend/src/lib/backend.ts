import { cookies } from "next/headers";

interface BackendFetchOptions extends RequestInit {
  endpoint: string;
}

export async function backendFetch({
  endpoint,
  ...options
}: BackendFetchOptions) {
  const cookieStore = await cookies();

  const token = cookieStore.get("token")?.value;

  if (!token) {
    return new Response(
      JSON.stringify({
        message: "Unauthorized",
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
    {
      ...options,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers ?? {}),
      },
    }
  );

  return response;
}