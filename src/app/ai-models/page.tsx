import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { AiModelsClient } from "./ai-models-client";
export const metadata = { title: "AI Models" };
export default async function AiModelsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <DashboardLayout><AiModelsClient /></DashboardLayout>;
}
