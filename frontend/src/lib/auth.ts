export async function verifyToken() {
  const token = localStorage.getItem("token");

  if (!token) {
    return false;
  }

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/api/user/dashboard",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
}