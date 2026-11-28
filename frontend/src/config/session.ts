import { call } from "frappe-ui";

export function goToLogin() {
  const path = window.location.pathname + window.location.search;
  window.location.href = `/login?redirect-to=${encodeURIComponent(path)}`;
}

export async function logout() {
  await call("logout");
  window.location.href = "/";
}
