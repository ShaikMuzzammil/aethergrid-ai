import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DeploymentsClient } from "./deployments-client";
export const metadata = { title: "Deployments" };
export default async function DeploymentsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <DashboardLayout><DeploymentsClient /></DashboardLayout>;
}
