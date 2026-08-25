import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  try {
    const [totalDevices, onlineDevices, totalModels, deployedModels, totalDeployments] =
      await Promise.all([
        prisma.device.count({ where: { userId } }),
        prisma.device.count({ where: { userId, status: "ONLINE" } }),
        prisma.aiModel.count({ where: { userId } }),
        prisma.aiModel.count({ where: { userId, status: "DEPLOYED" } }),
        prisma.deployment.count({ where: { userId } }),
      ]);

    const recentAlerts = await prisma.deviceAlert.findMany({
      where: { device: { userId }, resolved: false },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { device: { select: { name: true } } },
    });

    const devicesByType = await prisma.device.groupBy({
      by: ["type"],
      where: { userId },
      _count: { type: true },
    });

    const devicesByStatus = await prisma.device.groupBy({
      by: ["status"],
      where: { userId },
      _count: { status: true },
    });

    const modelsByStatus = await prisma.aiModel.groupBy({
      by: ["status"],
      where: { userId },
      _count: { status: true },
    });

    return NextResponse.json({
      overview: {
        totalDevices,
        onlineDevices,
        offlineDevices: totalDevices - onlineDevices,
        deviceUptime: totalDevices > 0 ? Math.round((onlineDevices / totalDevices) * 100) : 0,
        totalModels,
        deployedModels,
        totalDeployments,
        activeAlerts: recentAlerts.length,
      },
      devicesByType: devicesByType.map((d) => ({
        type: d.type,
        count: d._count.type,
      })),
      devicesByStatus: devicesByStatus.map((d) => ({
        status: d.status,
        count: d._count.status,
      })),
      modelsByStatus: modelsByStatus.map((m) => ({
        status: m.status,
        count: m._count.status,
      })),
      recentAlerts,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
