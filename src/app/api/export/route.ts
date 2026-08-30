import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(100),
  format: z.enum(["CSV","JSON","PARQUET","XLSX"]),
  dataType: z.enum(["devices","models","deployments","analytics","automations"]),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = (session.user as any).id;
  try {
    const jobs = await prisma.exportJob.findMany({
      where: { userId: uid },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return NextResponse.json({ jobs });
  } catch { return NextResponse.json({ error: "Failed to fetch exports" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = (session.user as any).id;
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const job = await prisma.exportJob.create({ data: { ...data, userId: uid, status: "PROCESSING" } });

    // Simulate export processing in background
    setTimeout(async () => {
      try {
        let rowCount = 0;
        if (data.dataType === "devices") rowCount = await prisma.device.count({ where: { userId: uid } });
        else if (data.dataType === "models") rowCount = await prisma.aiModel.count({ where: { userId: uid } });
        else if (data.dataType === "deployments") rowCount = await prisma.deployment.count({ where: { userId: uid } });
        else if (data.dataType === "automations") rowCount = await prisma.automation.count({ where: { userId: uid } });

        const fileSize = rowCount * 256; // estimate
        await prisma.exportJob.update({
          where: { id: job.id },
          data: { status: "COMPLETED", rowCount, fileSize, completedAt: new Date(), fileUrl: `/api/export/${job.id}/download` },
        });
      } catch {}
    }, 2000);

    return NextResponse.json(job, { status: 201 });
  } catch (e: any) {
    if (e?.name === "ZodError") return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to create export" }, { status: 500 });
  }
}
