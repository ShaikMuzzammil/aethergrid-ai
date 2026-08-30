import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = (session.user as any).id;

  try {
    const [
      deviceStats, 
      modelStats, 
      deploymentStats,
      recentEvents,
      topModels,
      telemetry,
      alerts,
    ] = await Promise.all([
      // Device stats
      prisma.device.groupBy({ by: ["status"], where: { userId: uid }, _count: true }),
      // Model stats
      prisma.aiModel.groupBy({ by: ["status"], where: { userId: uid }, _count: true }),
      // Deployment stats
      prisma.deployment.findMany({
        where: { userId: uid },
        select: { status: true, cpuUsage: true, memoryUsage: true, reqPerMin: true },
      }),
      // Recent notifications as events
      prisma.notification.findMany({
        where: { userId: uid },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      // Top deployed models
      prisma.aiModel.findMany({
        where: { userId: uid, status: "DEPLOYED" },
        select: { id: true, name: true, accuracy: true, latency: true, framework: true, status: true, deployments: { select: { id: true } } },
        take: 5,
      }),
      // Sensor telemetry (last 24h)
      prisma.sensorReading.findMany({
        where: {
          device: { userId: uid },
          timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          metric: { in: ["cpu", "memory"] },
        },
        orderBy: { timestamp: "asc" },
        take: 200,
      }),
      // Active alerts
      prisma.deviceAlert.findMany({
        where: { device: { userId: uid }, resolved: false },
        include: { device: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const deviceCounts = { total: 0, online: 0, offline: 0, warning: 0, error: 0, maintenance: 0 };
    deviceStats.forEach(s => {
      deviceCounts.total += s._count;
      const key = s.status.toLowerCase() as keyof typeof deviceCounts;
      if (key in deviceCounts) deviceCounts[key] = s._count;
    });

    const deployedModels = modelStats.find(s => s.status === "DEPLOYED")?._count || 0;

    const runningDeploys = deploymentStats.filter(d => d.status === "RUNNING");
    const avgCpu = runningDeploys.length ? runningDeploys.reduce((a, d) => a + (d.cpuUsage || 0), 0) / runningDeploys.length : 0;
    const avgMem = runningDeploys.length ? runningDeploys.reduce((a, d) => a + (d.memoryUsage || 0), 0) / runningDeploys.length : 0;
    const totalReqPerMin = runningDeploys.reduce((a, d) => a + (d.reqPerMin || 0), 0);

    // Group telemetry by hour
    const hourMap: Record<string, { cpu: number[]; memory: number[] }> = {};
    telemetry.forEach(r => {
      const h = new Date(r.timestamp).toISOString().slice(0, 13);
      if (!hourMap[h]) hourMap[h] = { cpu: [], memory: [] };
      if (r.metric === "cpu") hourMap[h].cpu.push(r.value);
      if (r.metric === "memory") hourMap[h].memory.push(r.value);
    });
    const chartData = Object.entries(hourMap).slice(-24).map(([h, v]) => ({
      time: h,
      cpu: v.cpu.length ? Math.round(v.cpu.reduce((a, b) => a + b, 0) / v.cpu.length) : 0,
      memory: v.memory.length ? Math.round(v.memory.reduce((a, b) => a + b, 0) / v.memory.length) : 0,
    }));

    return NextResponse.json({
      devices: deviceCounts,
      models: { deployed: deployedModels, total: modelStats.reduce((a, s) => a + s._count, 0) },
      system: { cpu: Math.round(avgCpu), memory: Math.round(avgMem), reqPerMin: totalReqPerMin },
      recentEvents,
      topModels: topModels.map(m => ({ ...m, deviceCount: m.deployments.length })),
      chartData,
      alerts,
    });
  } catch (e) {
    console.error("Dashboard error:", e);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
