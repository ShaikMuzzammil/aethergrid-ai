import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "overview";
  const range = searchParams.get("range") || "24h";
  const userId = (session.user as any).id;

  const hours = range === "1h" ? 1 : range === "24h" ? 24 : range === "7d" ? 168 : range === "30d" ? 720 : 2160;
  const since = new Date(Date.now() - hours * 3600000);

  try {
    if (type === "overview") {
      const [devices, models, deployments] = await Promise.all([
        prisma.device.groupBy({ by: ["status"], where: { userId }, _count: { id: true } }),
        prisma.aiModel.groupBy({ by: ["status"], where: { userId }, _count: { id: true } }),
        prisma.deployment.groupBy({ by: ["status"], where: { userId }, _count: { id: true } }),
      ]);
      const totalDevices = await prisma.device.count({ where: { userId } });
      const totalModels = await prisma.aiModel.count({ where: { userId } });
      return NextResponse.json({ devices, models, deployments, totals: { devices: totalDevices, models: totalModels } });
    }

    if (type === "telemetry") {
      const readings = await prisma.sensorReading.findMany({
        where: { device: { userId }, timestamp: { gte: since } },
        orderBy: { timestamp: "asc" },
        take: 1000,
      });
      return NextResponse.json({ readings });
    }

    if (type === "alerts") {
      const alerts = await prisma.deviceAlert.findMany({
        where: { device: { userId }, createdAt: { gte: since } },
        include: { device: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      return NextResponse.json({ alerts });
    }

    return NextResponse.json({ error: "Invalid analytics type" }, { status: 400 });
  } catch (e) { return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 }); }
}
