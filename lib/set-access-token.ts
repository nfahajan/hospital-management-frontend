"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TOKEN_KEY } from "./auth-utils";

const setAccessToken = async (token: string, option?: any) => {
  (await cookies()).set(TOKEN_KEY, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  if (option && option.redirect) {
    redirect(option.redirect);
  }
};

export const clearAccessToken = async () => {
  (await cookies()).delete(TOKEN_KEY);
};

export default setAccessToken;
