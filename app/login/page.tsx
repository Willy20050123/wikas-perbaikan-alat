import { redirect } from "next/navigation";
import LoginPageClient from "@/src/components/auth/LoginPageClient";
import { getDefaultRedirectForRole, getSessionUser } from "@/src/lib/session";

export default async function LoginPage() {
  const user = await getSessionUser();

  if (user) {
    redirect(getDefaultRedirectForRole(user.role));
  }

  return <LoginPageClient />;
}
