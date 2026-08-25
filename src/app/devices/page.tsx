import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DevicesClient } from "./devices-client";

export const metadata = { title: "Devices" };

export default async function DevicesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return (
    <DashboardLayout>
      <DevicesClient />
    </DashboardLayout>
  );
}
