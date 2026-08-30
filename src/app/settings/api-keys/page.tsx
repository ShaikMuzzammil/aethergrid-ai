import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import ApiKeysClient from "./api-keys-client";

export const metadata = { title: "API Keys — AetherGrid AI" };
export const dynamic = "force-dynamic";

export default async function ApiKeysPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <DashboardLayout><ApiKeysClient /></DashboardLayout>;
}
