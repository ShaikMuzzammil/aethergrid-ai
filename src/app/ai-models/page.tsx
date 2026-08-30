import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardLayout } from "@/components/dashboard-layout";
import AIModelsClient from "./ai-models-client";

export const dynamic = "force-dynamic";

export default async function AIModelsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <DashboardLayout><AIModelsClient /></DashboardLayout>;
}
