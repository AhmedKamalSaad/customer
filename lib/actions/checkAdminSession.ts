import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decryptKey } from "./ecryptAndDecrypt";

export async function checkAdminSession() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("adminSession");

  if (
    !adminSession ||
    decryptKey(adminSession.value) !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD
  ) {
    redirect("/"); 
  }
}
