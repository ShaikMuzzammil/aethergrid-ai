import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { WebhooksClient } from "./webhooks-client";
export const metadata = { title: "Webhooks" };
export default async function WebhooksPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <DashboardLayout><WebhooksClient /></DashboardLayout>;
}
