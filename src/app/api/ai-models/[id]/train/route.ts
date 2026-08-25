import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const trainSchema = z.object({
  name: z.string().min(1),
  epochs: z.number().min(1).max(1000).optional().default(20),
  batchSize: z.number().min(1).max(512).optional().default(32),
  learningRate: z.number().min(0.00001).max(1).optional().default(0.001),
  config: z.record(z.any()).optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const data = trainSchema.parse(body);
    const model = await prisma.aiModel.findFirst({ where: { id: params.id, userId: (session.user as any).id } });
    if (!model) return NextResponse.json({ error: "Model not found" }, { status: 404 });
    const job = await prisma.trainingJob.create({
      data: { modelId: params.id, name: data.name, epochs: data.epochs, batchSize: data.batchSize, learningRate: data.learningRate, config: data.config || {}, status: "QUEUED" },
    });
    await prisma.aiModel.update({ where: { id: params.id }, data: { status: "TRAINING" } });
    return NextResponse.json(job, { status: 201 });
  } catch (e: any) {
    if (e?.name === "ZodError") return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to start training" }, { status: 500 });
  }
}
