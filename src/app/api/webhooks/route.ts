import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  secret: z.string().optional(),
  active: z.boolean().optional().default(true),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const webhooks = await prisma.webhook.findMany({
      where: { userId: (session.user as any).id },
      include: { _count: { select: { deliveries: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ webhooks });
  } catch { return NextResponse.json({ error: "Failed to fetch webhooks" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const webhook = await prisma.webhook.create({ data: { ...data, userId: (session.user as any).id } });
    return NextResponse.json(webhook, { status: 201 });
  } catch (e: any) {
    if (e?.name === "ZodError") return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to create webhook" }, { status: 500 });
  }
}
