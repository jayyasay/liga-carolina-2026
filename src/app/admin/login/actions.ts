"use server";

import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
  const username = formData.get("username")?.toString().trim();
  const password = formData.get("password")?.toString();

  const validUsername = process.env.ADMIN_USERNAME;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (username !== validUsername || password !== validPassword) {
    return { error: "Invalid username or password." };
  }

  const session = await getSession();
  session.isLoggedIn = true;
  session.username = username;
  await session.save();

  redirect("/admin");
}

export async function logoutAction() {
  const session = await getSession();
  session.destroy();
  redirect("/admin/login");
}
