import AdminDashboard from "@/src/components/dashboard/AdminDashboard";
import { requireRole } from "@/src/lib/session";

export default async function AdminDashboardPage() {
  const currentUser = await requireRole("ADMIN");

  return (
    <AdminDashboard
      currentUser={currentUser}
      title="Dashboard Laporan Kerusakan Barang & Alat"
    />
  );
}
