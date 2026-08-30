import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import crypto from "crypto";

const schema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.string()).min(1),
  expiresAt: z.string().datetime().optional().nullable(),
  environment: z.enum(["live", "test"]).optional().default("live"),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = (session.user as any).id;
  try {
    const keys = await prisma.apiKey.findMany({
      where: { userId: uid, revokedAt: null },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, prefix: true, permissions: true, lastUsed: true, expiresAt: true, createdAt: true },
    });
    return NextResponse.json({ keys });
  } catch { return NextResponse.json({ error: "Failed to fetch keys" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = (session.user as any).id;
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const env = data.environment || "live";
    const secret = crypto.randomBytes(24).toString("hex");
    const key = `ag_${env}_${secret}`;
    const prefix = `ag_${env}_`;
    const apiKey = await prisma.apiKey.create({
      data: { name: data.name, key, prefix, permissions: data.permissions, userId: uid, expiresAt: data.expiresAt ? new Date(data.expiresAt) : null },
    });
    // Return the full key only on creation
    return NextResponse.json({ ...apiKey, fullKey: key }, { status: 201 });
  } catch (e: any) {
    if (e?.name === "ZodError") return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to create key" }, { status: 500 });
  }
}
