import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import SettingsClient from "./settings-client";

export const metadata = { title: "Settings — AetherGrid AI" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <DashboardLayout><SettingsClient /></DashboardLayout>;
}
