import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().default("Training Run"),
  epochs: z.number().min(1).max(1000).optional().default(50),
  batchSize: z.number().min(1).max(512).optional().default(32),
  learningRate: z.number().min(0.000001).max(1).optional().default(0.001),
  config: z.record(z.any()).optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const model = await prisma.aiModel.findFirst({ where: { id, userId: (session.user as any).id } });
    if (!model) return NextResponse.json({ error: "Model not found" }, { status: 404 });
    const job = await prisma.trainingJob.create({ data: { modelId: id, ...data, status: "QUEUED" } });
    await prisma.aiModel.update({ where: { id }, data: { status: "TRAINING" } });
    return NextResponse.json(job, { status: 201 });
  } catch (e: any) {
    if (e?.name === "ZodError") return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to start training" }, { status: 500 });
  }
}
