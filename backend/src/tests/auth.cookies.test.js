/**
 * Integration smoke test against a running API + MongoDB.
 * Usage: node src/tests/auth.cookies.test.js
 */
const API = process.env.API_URL || "http://localhost:5000/api";

async function req(path, { method = "GET", body, jar } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (jar?.cookie) headers.Cookie = jar.cookie;
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const setCookie = res.headers.getSetCookie?.() || [];
  if (setCookie.length) {
    jar.cookie = setCookie.map((c) => c.split(";")[0]).join("; ");
  }
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, jar };
}

const jar = { cookie: "" };
const email = `test_${Date.now()}@cove.dev`;

const registered = await req("/auth/register", {
  method: "POST",
  jar,
  body: { name: "Test User", email, password: "password123" },
});
if (registered.status !== 201) {
  console.error(registered);
  process.exit(1);
}
if (!jar.cookie.includes("cove_access") || !jar.cookie.includes("cove_refresh")) {
  console.error("Expected auth cookies", jar.cookie);
  process.exit(1);
}

const me = await req("/auth/me", { jar });
if (me.status !== 200 || me.data?.data?.user?.email !== email) {
  console.error("me failed", me);
  process.exit(1);
}

const refreshed = await req("/auth/refresh", { method: "POST", jar });
if (refreshed.status !== 200) {
  console.error("refresh failed", refreshed);
  process.exit(1);
}

const loggedOut = await req("/auth/logout", { method: "POST", jar });
if (loggedOut.status !== 200) {
  console.error("logout failed", loggedOut);
  process.exit(1);
}

console.log("auth cookie integration tests passed");
