import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { IntegrationsClient } from "./integrations-client";
export const metadata = { title: "Integrations" };
export default async function IntegrationsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <DashboardLayout><IntegrationsClient /></DashboardLayout>;
}
