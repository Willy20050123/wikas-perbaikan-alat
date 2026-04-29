import AccountSettingsPage from "@/src/components/account/AccountSettingsPage";
import { requireSessionUser } from "@/src/lib/session";

export default async function DashboardAccountPage() {
  const currentUser = await requireSessionUser();

  return <AccountSettingsPage currentUser={currentUser} />;
}
