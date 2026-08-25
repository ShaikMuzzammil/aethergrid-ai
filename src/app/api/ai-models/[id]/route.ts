import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  version: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["DRAFT","TRAINING","TRAINED","DEPLOYED","ARCHIVED"]).optional(),
  accuracy: z.number().min(0).max(100).optional(),
  latency: z.number().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const model = await prisma.aiModel.findFirst({
      where: { id, userId: (session.user as any).id },
      include: {
        trainingJobs: { orderBy: { createdAt: "desc" }, take: 5 },
        deployments: { select: { id: true, name: true, status: true } },
        _count: { select: { inferenceRequests: true } },
      },
    });
    if (!model) return NextResponse.json({ error: "Model not found" }, { status: 404 });
    return NextResponse.json(model);
  } catch { return NextResponse.json({ error: "Failed to fetch model" }, { status: 500 }); }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const data = updateSchema.parse(body);
    const model = await prisma.aiModel.updateMany({ where: { id, userId: (session.user as any).id }, data: { ...data, updatedAt: new Date() } });
    if (model.count === 0) return NextResponse.json({ error: "Model not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e?.name === "ZodError") return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to update model" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const result = await prisma.aiModel.deleteMany({ where: { id, userId: (session.user as any).id } });
    if (result.count === 0) return NextResponse.json({ error: "Model not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Failed to delete model" }, { status: 500 }); }
}
