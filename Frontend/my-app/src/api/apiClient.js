const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const authHeader = () => {
  const token = localStorage.getItem("token");
  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};

export const apiRequest = async (
  url,
  method = "GET",
  body = null,
  isAuth = false
) => {
  const headers = {
    "Content-Type": "application/json",
    ...(isAuth ? authHeader() : {})
  };

  const res = await fetch(`${BASE_URL}${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "API Error");
  }

  return data;
};
