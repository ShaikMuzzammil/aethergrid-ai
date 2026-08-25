import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { TeamClient } from "./team-client";
export const metadata = { title: "Team" };
export default async function TeamPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <DashboardLayout><TeamClient currentUser={session.user} /></DashboardLayout>;
}
