import AdminStatistikPageClient from "@/src/components/dashboard/AdminStatistikPageClient";
import { getMonthlyReportStats } from "@/src/lib/monthly-report-stats";

export default async function AdminStatistikPage() {
  const initialStats = await getMonthlyReportStats();

  return <AdminStatistikPageClient initialStats={initialStats} />;
}
