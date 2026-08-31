import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = (session.user as any).id;
  try {
    const body = await req.json();
    const { deviceId, readings } = body;
    const device = await prisma.device.findFirst({ where: { id: deviceId, userId: uid }, select: { id: true } });
    if (!device) return NextResponse.json({ error: "Device not found" }, { status: 404 });
    const ts = new Date();
    await prisma.sensorReading.createMany({
      data: readings.map((r: { metric: string; value: number; unit: string }) => ({
        deviceId, metric: r.metric, value: r.value, unit: r.unit, timestamp: ts,
      })),
      skipDuplicates: false,
    });
    const cpuR = readings.find((r: any) => r.metric === "cpu");
    const memR  = readings.find((r: any) => r.metric === "memory");
    const tmpR  = readings.find((r: any) => r.metric === "temperature");
    await prisma.device.update({
      where: { id: deviceId },
      data: { cpu: cpuR?.value, memory: memR?.value, temperature: tmpR?.value, lastSeen: ts, status: "ONLINE" },
    });
    return NextResponse.json({ success: true, timestamp: ts });
  } catch (e) {
    console.error("Simulator error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = (session.user as any).id;
  try {
    const devices = await prisma.device.findMany({
      where: { userId: uid },
      select: { id: true, name: true, type: true, status: true, cpu: true, memory: true, temperature: true, lastSeen: true },
      orderBy: { updatedAt: "desc" }, take: 50,
    });
    return NextResponse.json({ devices });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
