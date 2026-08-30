import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardLayout } from "@/components/dashboard-layout";

export const metadata = { title: "Documentation — AetherGrid AI" };

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (session) return <DashboardLayout>{children}</DashboardLayout>;
  return <>{children}</>;
}
