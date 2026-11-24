import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionValue } from "./session";

export async function isAdmin() {
  return verifySessionValue(cookies().get(SESSION_COOKIE)?.value);
}

/** Call at the top of every admin page and admin action. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
