import { redirect } from "next/navigation";
import { getSession } from "./session";

export async function requireAdminSession() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/admin/login");
  }

  return session;
}
