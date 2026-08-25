import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const readingSchema = z.object({
  readings: z.array(z.object({
    metric: z.string(),
    value: z.number(),
    unit: z.string().optional(),
    quality: z.number().min(0).max(100).optional(),
    timestamp: z.string().datetime().optional(),
  })),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const metric = searchParams.get("metric");
  const limit = parseInt(searchParams.get("limit") || "200");
  const since = searchParams.get("since") ? new Date(searchParams.get("since")!) : new Date(Date.now() - 86400000);
  try {
    const readings = await prisma.sensorReading.findMany({
      where: { deviceId: params.id, device: { userId: (session.user as any).id }, ...(metric ? { metric } : {}), timestamp: { gte: since } },
      orderBy: { timestamp: "asc" },
      take: limit,
    });
    return NextResponse.json({ readings, count: readings.length });
  } catch { return NextResponse.json({ error: "Failed to fetch readings" }, { status: 500 }); }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { readings } = readingSchema.parse(body);
    const device = await prisma.device.findFirst({ where: { id: params.id, userId: (session.user as any).id } });
    if (!device) return NextResponse.json({ error: "Device not found" }, { status: 404 });
    await prisma.sensorReading.createMany({
      data: readings.map(r => ({ deviceId: params.id, ...r, timestamp: r.timestamp ? new Date(r.timestamp) : new Date() })),
    });
    await prisma.device.update({ where: { id: params.id }, data: { lastSeen: new Date(), status: "ONLINE" } });
    return NextResponse.json({ success: true, count: readings.length });
  } catch (e: any) {
    if (e?.name === "ZodError") return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to save readings" }, { status: 500 });
  }
}
