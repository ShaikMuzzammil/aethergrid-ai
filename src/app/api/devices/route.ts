import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["ESP32","ESP8266","RASPBERRY_PI","NVIDIA_JETSON","STM32","RISCV","ARDUINO","CUSTOM"]),
  firmwareVersion: z.string().optional(),
  ipAddress: z.string().optional(),
  macAddress: z.string().optional(),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  tags: z.array(z.string()).optional(),
  groupId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  try {
    const [devices, total] = await Promise.all([
      prisma.device.findMany({
        where: { userId: (session.user as any).id, ...(status && { status: status as any }), ...(type && { type: type as any }) },
        include: { group: true, alerts: { where: { resolved: false }, take: 5 } },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.device.count({ where: { userId: (session.user as any).id } }),
    ]);
    return NextResponse.json({ devices, total, page, pages: Math.ceil(total / limit) });
  } catch (_e) { return NextResponse.json({ error: "Failed to fetch devices" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const data = createSchema.parse(body);
    const device = await prisma.device.create({
      data: { ...data, userId: (session.user as any).id, tags: data.tags || [] },
    });
    return NextResponse.json(device, { status: 201 });
  } catch (e: any) {
    if (e?.name === "ZodError") return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to create device" }, { status: 500 });
  }
}
