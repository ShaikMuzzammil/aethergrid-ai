import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  status: z.enum(["ONLINE","OFFLINE","WARNING","ERROR","MAINTENANCE"]).optional(),
  firmwareVersion: z.string().optional(),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const device = await prisma.device.findFirst({
      where: { id, userId: (session.user as any).id },
      include: {
        group: true,
        alerts: { where: { resolved: false }, orderBy: { createdAt: "desc" }, take: 10 },
        commands: { orderBy: { sentAt: "desc" }, take: 10 },
        sensorReadings: { orderBy: { timestamp: "desc" }, take: 100 },
      },
    });
    if (!device) return NextResponse.json({ error: "Device not found" }, { status: 404 });
    return NextResponse.json(device);
  } catch { return NextResponse.json({ error: "Failed to fetch device" }, { status: 500 }); }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const data = updateSchema.parse(body);
    const device = await prisma.device.updateMany({
      where: { id, userId: (session.user as any).id },
      data: { ...data, updatedAt: new Date() },
    });
    if (device.count === 0) return NextResponse.json({ error: "Device not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e?.name === "ZodError") return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to update device" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const result = await prisma.device.deleteMany({ where: { id, userId: (session.user as any).id } });
    if (result.count === 0) return NextResponse.json({ error: "Device not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Failed to delete device" }, { status: 500 }); }
}
