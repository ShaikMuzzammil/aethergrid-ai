import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ExportClient } from "./export-client";
export const metadata = { title: "Export Center" };
export default async function ExportPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <DashboardLayout><ExportClient /></DashboardLayout>;
}
