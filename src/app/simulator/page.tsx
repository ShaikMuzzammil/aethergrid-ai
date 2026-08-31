import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SimulatorClient from "./simulator-client";
import DashboardLayout from "@/components/dashboard-layout";

export default async function SimulatorPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <DashboardLayout><SimulatorClient /></DashboardLayout>;
}
