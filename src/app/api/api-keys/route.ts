import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateApiKey } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.string()).min(1),
  expiresAt: z.string().datetime().optional(),
});

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const keys = await prisma.apiKey.findMany({
      where: { userId: (session.user as any).id, revokedAt: null },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ keys: keys.map(k => ({ ...k, key: k.key.slice(0, 16) + "••••••••••••" })) });
  } catch { return NextResponse.json({ error: "Failed to fetch API keys" }, { status: 500 }); }
}

export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const key = generateApiKey();
    const apiKey = await prisma.apiKey.create({
      data: { name: data.name, key, permissions: data.permissions, userId: (session.user as any).id, expiresAt: data.expiresAt ? new Date(data.expiresAt) : null },
    });
    return NextResponse.json({ ...apiKey }, { status: 201 });
  } catch (e: any) {
    if (e?.name === "ZodError") return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to create API key" }, { status: 500 });
  }
}
