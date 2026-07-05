import { cookies } from "next/headers";

const BASE_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

export async function fetchLaravel(
  path: string,
  options: RequestInit = {}
) {
  const token = (await cookies()).get("token")?.value;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  return res;
}