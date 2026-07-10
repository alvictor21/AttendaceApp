export async function verifyToken() {
  try {
    const response = await fetch("/api/me", {
      method: "GET",
      credentials: "include",
    });

    return response.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
}