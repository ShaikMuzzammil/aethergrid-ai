import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { AutomationsClient } from "./automations-client";
export const metadata = { title: "Automations" };
export default async function AutomationsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <DashboardLayout><AutomationsClient /></DashboardLayout>;
}
