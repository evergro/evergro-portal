// Development only. The built page gets these values from Jinja (www/portal/index.html).
export async function loadDevelopmentBoot() {
  if (!import.meta.env.DEV) return;
  const response = await fetch("/api/method/portal.www.portal.index.get_context_for_dev", {
    credentials: "include",
  });
  if (!response.ok) throw new Error(`Could not load the development boot data (${response.status})`);
  Object.assign(window, (await response.json()).message);
}
