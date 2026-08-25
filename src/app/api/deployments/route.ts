import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["API_SERVICE","MODEL_SERVING","WEB_APP","BACKGROUND_WORKER","DATA_PIPELINE","EDGE_FUNCTION"]),
  modelId: z.string().optional(),
  replicas: z.number().min(1).max(100).optional().default(1),
  cpuLimit: z.string().optional().default("500m"),
  memoryLimit: z.string().optional().default("512Mi"),
  config: z.record(z.any()).optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const deployments = await prisma.deployment.findMany({
      where: { userId: (session.user as any).id },
      include: { model: { select: { name: true, type: true } }, _count: { select: { logs: true } } },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ deployments, total: deployments.length });
  } catch { return NextResponse.json({ error: "Failed to fetch deployments" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const deployment = await prisma.deployment.create({
      data: { ...data, userId: (session.user as any).id, status: "PENDING" },
    });
    return NextResponse.json(deployment, { status: 201 });
  } catch (e: any) {
    if (e?.name === "ZodError") return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to create deployment" }, { status: 500 });
  }
}
