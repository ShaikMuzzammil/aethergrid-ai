import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  status: z.enum(["PENDING","DEPLOYING","RUNNING","STOPPED","FAILED","UPDATING"]).optional(),
  replicas: z.number().min(0).max(100).optional(),
  url: z.string().url().optional(),
  config: z.record(z.any()).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const deployment = await prisma.deployment.findFirst({
      where: { id, userId: (session.user as any).id },
      include: {
        model: { select: { name: true, type: true, accuracy: true } },
        logs: { orderBy: { timestamp: "desc" }, take: 100 },
        metrics: { orderBy: { timestamp: "desc" }, take: 50 },
      },
    });
    if (!deployment) return NextResponse.json({ error: "Deployment not found" }, { status: 404 });
    return NextResponse.json(deployment);
  } catch { return NextResponse.json({ error: "Failed to fetch deployment" }, { status: 500 }); }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const data = updateSchema.parse(body);
    const dep = await prisma.deployment.updateMany({
      where: { id, userId: (session.user as any).id },
      data: { ...data, updatedAt: new Date() },
    });
    if (dep.count === 0) return NextResponse.json({ error: "Deployment not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e?.name === "ZodError") return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to update deployment" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const result = await prisma.deployment.deleteMany({ where: { id, userId: (session.user as any).id } });
    if (result.count === 0) return NextResponse.json({ error: "Deployment not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Failed to delete deployment" }, { status: 500 }); }
}
