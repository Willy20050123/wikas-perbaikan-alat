import { requireRole } from "@/src/lib/session";

export default async function UserDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireRole("USER");

  return children;
}
