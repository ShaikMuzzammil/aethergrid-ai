import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  category: z.enum(["MONITORING","MAINTENANCE","INTEGRATION","SCALING","REPORTING","ML_OPS","SAFETY"]),
  active: z.boolean().optional().default(true),
  triggerType: z.string(),
  triggerConfig: z.record(z.any()),
  actionType: z.string(),
  actionConfig: z.record(z.any()),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = (session.user as any).id;
  try {
    const automations = await prisma.automation.findMany({
      where: { userId: uid },
      orderBy: { updatedAt: "desc" },
    });
    const stats = {
      total: automations.length,
      active: automations.filter(a => a.active).length,
      paused: automations.filter(a => !a.active).length,
      totalRuns: automations.reduce((sum, a) => sum + a.runCount, 0),
    };
    return NextResponse.json({ automations, stats });
  } catch { return NextResponse.json({ error: "Failed to fetch automations" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = (session.user as any).id;
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const automation = await prisma.automation.create({ data: { ...data, userId: uid } });
    return NextResponse.json(automation, { status: 201 });
  } catch (e: any) {
    if (e?.name === "ZodError") return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to create automation" }, { status: 500 });
  }
}
