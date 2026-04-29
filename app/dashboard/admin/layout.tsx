import { requireRole } from "@/src/lib/session";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireRole("ADMIN");

  return children;
}
