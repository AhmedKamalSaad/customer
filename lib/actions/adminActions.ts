// server-side logic to handle login and set cookies

"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { encryptKey } from "./ecryptAndDecrypt";

export const loginAction = async (password: string) => {
  const storedPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

  if (password === storedPassword) {
    const encryptedKey = encryptKey(storedPassword);
    const cookieStore = cookies();
    (await cookieStore).set("adminSession", encryptedKey, {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    redirect("/clients");
  } else {
    return "Invalid password";
  }
};
