export async function getCurrentUser() {
  const response = await fetch("/api/auth/me", {
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unauthorized");
  }

  return response.json();
}