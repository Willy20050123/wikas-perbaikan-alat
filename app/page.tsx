import { redirect } from "next/navigation";
import { getDefaultRedirectForRole, getSessionUser } from "@/src/lib/session";

export default async function HomePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  redirect(getDefaultRedirectForRole(user.role));
}
