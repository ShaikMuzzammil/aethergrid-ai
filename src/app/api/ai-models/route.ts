import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  version: z.string().optional().default("1.0.0"),
  type: z.enum(["OBJECT_DETECTION","IMAGE_SEGMENTATION","CLASSIFICATION","ANOMALY_DETECTION","NLP","TIME_SERIES","RECOMMENDATION","GENERATIVE"]),
  framework: z.enum(["TENSORFLOW","PYTORCH","ONNX","TFLITE","OPENVINO","CUSTOM"]),
  description: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  try {
    const models = await prisma.aiModel.findMany({
      where: {
        userId: (session.user as any).id,
        ...(searchParams.get("status") ? { status: searchParams.get("status") as any } : {}),
        ...(searchParams.get("type") ? { type: searchParams.get("type") as any } : {}),
      },
      include: {
        trainingJobs: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true, progress: true, accuracy: true } },
        _count: { select: { inferenceRequests: true, deployments: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ models, total: models.length });
  } catch { return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const data = createSchema.parse(body);
    const model = await prisma.aiModel.create({
      data: { ...data, userId: (session.user as any).id, tags: data.tags ?? [] },
    });
    return NextResponse.json(model, { status: 201 });
  } catch (e: any) {
    if (e?.name === "ZodError") return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to create model" }, { status: 500 });
  }
}
