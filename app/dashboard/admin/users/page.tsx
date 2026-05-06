import AdminUsersPage from "@/src/components/dashboard/AdminUsersPage";
import { requireRole } from "@/src/lib/session";

export default async function AdminUsersDashboardPage() {
  const currentUser = await requireRole("ADMIN");

  return <AdminUsersPage currentUserId={currentUser.id} />;
}
