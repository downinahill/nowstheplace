// Signed admin session cookie. Uses Web Crypto so it works in middleware too.
export const SESSION_COOKIE = "ntp_admin";
const WEEK = 60 * 60 * 24 * 7;

const enc = new TextEncoder();

async function hmac(value: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) throw new Error("SESSION_SECRET must be set (16+ characters)");
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionValue() {
  const exp = Math.floor(Date.now() / 1000) + WEEK;
  return { value: `${exp}.${await hmac(String(exp))}`, maxAge: WEEK };
}

export async function verifySessionValue(value: string | undefined) {
  if (!value) return false;
  const [exp, sig] = value.split(".");
  if (!exp || !sig || Number(exp) * 1000 < Date.now()) return false;
  try {
    return safeEqual(sig, await hmac(exp));
  } catch {
    return false;
  }
}

/** Compares the typed password with ADMIN_PASSWORD without leaking timing. */
export async function passwordMatches(input: string) {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false;
  return safeEqual(await hmac("pw:" + input), await hmac("pw:" + real));
}
