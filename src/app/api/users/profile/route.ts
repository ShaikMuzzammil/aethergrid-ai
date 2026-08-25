import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  image: z.string().url().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: { id: true, name: true, email: true, image: true, role: true, createdAt: true, twoFactorEnabled: true },
    });
    return NextResponse.json(user);
  } catch { return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 }); }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const data = updateSchema.parse(body);
    const user = await prisma.user.update({ where: { id: (session.user as any).id }, data });
    return NextResponse.json({ id: user.id, name: user.name, email: user.email });
  } catch (e: any) {
    if (e?.name === "ZodError") return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
