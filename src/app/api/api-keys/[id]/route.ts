import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = (session.user as any).id;
  try {
    await prisma.apiKey.update({ where: { id: params.id, userId: uid }, data: { revokedAt: new Date() } });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Failed to revoke key" }, { status: 500 }); }
}
