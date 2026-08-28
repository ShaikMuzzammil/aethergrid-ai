import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(100),
  format: z.string().min(1),
  config: z.record(z.any()).optional(),
});

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const jobs = await prisma.exportJob.findMany({
      where: { userId: (session.user as any).id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ jobs, total: jobs.length });
  } catch { return NextResponse.json({ error: "Failed to fetch export jobs" }, { status: 500 }); }
}

export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const job = await prisma.exportJob.create({
      data: { ...data, userId: (session.user as any).id, status: "PENDING" },
    });
    return NextResponse.json(job, { status: 201 });
  } catch (e: any) {
    if (e?.name === "ZodError") return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to create export job" }, { status: 500 });
  }
}
