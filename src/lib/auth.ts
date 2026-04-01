const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3031";

export function getGoogleLoginUrl() {
  return `${API_URL}/auth/google`;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function setToken(token: string) {
  localStorage.setItem("access_token", token);
}

export function removeToken() {
  localStorage.removeItem("access_token");
}

export async function fetchProfile() {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`${API_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    removeToken();
    return null;
  }

  return res.json();
}
