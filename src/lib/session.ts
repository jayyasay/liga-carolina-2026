import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export type SessionData = {
  isLoggedIn: boolean;
  username?: string;
};

export const sessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "liga_admin_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  return session;
}
