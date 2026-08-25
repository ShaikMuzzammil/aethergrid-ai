import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { AnalyticsClient } from "./analytics-client";
export const metadata = { title: "Analytics" };
export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <DashboardLayout><AnalyticsClient /></DashboardLayout>;
}
