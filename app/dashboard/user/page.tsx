import UserDashboard from "@/src/components/dashboard/UserDashboard";
import { requireRole } from "@/src/lib/session";

export default async function UserDashboardPage() {
  const currentUser = await requireRole("USER");

  return <UserDashboard currentUser={currentUser} />;
}
