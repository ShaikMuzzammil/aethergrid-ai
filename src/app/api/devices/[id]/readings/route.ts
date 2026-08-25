import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const metric = searchParams.get("metric");
  const hours = parseInt(searchParams.get("hours") || "24");
  const since = new Date(Date.now() - hours * 3600 * 1000);
  try {
    const device = await prisma.device.findFirst({ where: { id, userId: (session.user as any).id } });
    if (!device) return NextResponse.json({ error: "Device not found" }, { status: 404 });
    const readings = await prisma.sensorReading.findMany({
      where: { deviceId: id, ...(metric ? { metric } : {}), timestamp: { gte: since } },
      orderBy: { timestamp: "asc" },
      take: 500,
    });
    return NextResponse.json({ readings, device: { id: device.id, name: device.name } });
  } catch { return NextResponse.json({ error: "Failed to fetch readings" }, { status: 500 }); }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { readings } = body;
    if (!Array.isArray(readings)) return NextResponse.json({ error: "readings must be an array" }, { status: 400 });
    const device = await prisma.device.findFirst({ where: { id, userId: (session.user as any).id } });
    if (!device) return NextResponse.json({ error: "Device not found" }, { status: 404 });
    await prisma.sensorReading.createMany({
      data: readings.map((r: any) => ({ deviceId: id, metric: r.metric, value: r.value, unit: r.unit })),
    });
    await prisma.device.update({ where: { id }, data: { lastSeen: new Date() } });
    return NextResponse.json({ success: true, count: readings.length }, { status: 201 });
  } catch { return NextResponse.json({ error: "Failed to store readings" }, { status: 500 }); }
}
