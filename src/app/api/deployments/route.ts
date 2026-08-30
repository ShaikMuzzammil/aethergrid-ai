import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["API_SERVICE","MODEL_SERVING","WEB_APP","BACKGROUND_WORKER","DATA_PIPELINE","EDGE_FUNCTION"]),
  modelId: z.string().optional().nullable(),
  replicas: z.number().min(1).max(100).optional().default(1),
  region: z.string().optional().default("us-east-1"),
  cpuLimit: z.string().optional().default("500m"),
  memoryLimit: z.string().optional().default("512Mi"),
  config: z.record(z.any()).optional(),
});

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = (session.user as any).id;
  try {
    const deployments = await prisma.deployment.findMany({
      where: { userId: uid },
      include: { model: { select: { name: true, type: true } } },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ deployments, total: deployments.length });
  } catch { return NextResponse.json({ error: "Failed to fetch deployments" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = (session.user as any).id;
  try {
    const body = await req.json();
    const data = schema.parse(body);
    // simulate deploy → set running after creation
    const deployment = await prisma.deployment.create({
      data: {
        name: data.name,
        type: data.type,
        modelId: data.modelId || null,
        replicas: data.replicas,
        region: data.region,
        cpuLimit: data.cpuLimit,
        memoryLimit: data.memoryLimit,
        config: data.config || {},
        status: "PENDING",
        userId: uid,
        cpuUsage: 0,
        memoryUsage: 0,
        reqPerMin: 0,
        errorRate: 0,
      },
    });
    // Background: simulate becoming RUNNING
    setTimeout(async () => {
      try {
        await prisma.deployment.update({
          where: { id: deployment.id },
          data: { status: "RUNNING", cpuUsage: 20 + Math.random() * 30, memoryUsage: 25 + Math.random() * 25, reqPerMin: 0 },
        });
      } catch {}
    }, 3000);
    return NextResponse.json(deployment, { status: 201 });
  } catch (e: any) {
    if (e?.name === "ZodError") return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to create deployment" }, { status: 500 });
  }
}
