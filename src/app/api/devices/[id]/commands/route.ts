import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  command: z.string().min(1).max(100),
  payload: z.record(z.any()).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const device = await prisma.device.findFirst({ where: { id, userId: (session.user as any).id } });
    if (!device) return NextResponse.json({ error: "Device not found" }, { status: 404 });
    const commands = await prisma.deviceCommand.findMany({ where: { deviceId: id }, orderBy: { sentAt: "desc" }, take: 50 });
    return NextResponse.json({ commands });
  } catch { return NextResponse.json({ error: "Failed to fetch commands" }, { status: 500 }); }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const device = await prisma.device.findFirst({ where: { id, userId: (session.user as any).id } });
    if (!device) return NextResponse.json({ error: "Device not found" }, { status: 404 });
    const cmd = await prisma.deviceCommand.create({ data: { deviceId: id, ...data, status: "PENDING" } });
    return NextResponse.json(cmd, { status: 201 });
  } catch (e: any) {
    if (e?.name === "ZodError") return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to send command" }, { status: 500 });
  }
}
