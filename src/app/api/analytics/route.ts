import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const hours = parseInt(searchParams.get("hours") || "24");

  try {
    const since = new Date(Date.now() - hours * 3600 * 1000);

    const [readings, deviceCount, modelCount, deploymentStats] = await Promise.all([
      prisma.sensorReading.findMany({
        where: { device: { userId: uid }, timestamp: { gte: since }, metric: { in: ["cpu","memory"] } },
        orderBy: { timestamp: "asc" },
        take: 1000,
      }),
      prisma.device.count({ where: { userId: uid, status: "ONLINE" } }),
      prisma.aiModel.count({ where: { userId: uid, status: "DEPLOYED" } }),
      prisma.deployment.findMany({
        where: { userId: uid, status: "RUNNING" },
        select: { cpuUsage: true, memoryUsage: true, reqPerMin: true, errorRate: true },
      }),
    ]);

    // Group by hour bucket
    const bucketMs = Math.max(3600000, (hours * 3600000) / 48);
    const buckets: Record<string, { cpu: number[]; memory: number[]; ts: number }> = {};
    readings.forEach(r => {
      const bucket = Math.floor(r.timestamp.getTime() / bucketMs) * bucketMs;
      const k = bucket.toString();
      if (!buckets[k]) buckets[k] = { cpu: [], memory: [], ts: bucket };
      if (r.metric === "cpu") buckets[k].cpu.push(r.value);
      else if (r.metric === "memory") buckets[k].memory.push(r.value);
    });

    const chartData = Object.values(buckets)
      .sort((a, b) => a.ts - b.ts)
      .map(b => ({
        time: new Date(b.ts).toISOString(),
        cpu: b.cpu.length ? Math.round(b.cpu.reduce((a, x) => a + x, 0) / b.cpu.length) : 0,
        memory: b.memory.length ? Math.round(b.memory.reduce((a, x) => a + x, 0) / b.memory.length) : 0,
      }));

    const totalReq = deploymentStats.reduce((a, d) => a + (d.reqPerMin || 0), 0);
    const avgCpu = deploymentStats.length
      ? Math.round(deploymentStats.reduce((a, d) => a + (d.cpuUsage || 0), 0) / deploymentStats.length)
      : 0;

    return NextResponse.json({
      chartData,
      summary: {
        activeDevices: deviceCount,
        deployedModels: modelCount,
        totalReqPerMin: totalReq,
        avgCpu,
        dataPoints: readings.length,
      },
      hours,
    });
  } catch (e) {
    console.error("Analytics error:", e);
    return NextResponse.json({ chartData: [], summary: {}, hours }, { status: 200 });
  }
}
