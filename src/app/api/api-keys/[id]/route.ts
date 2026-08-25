import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const result = await prisma.apiKey.updateMany({
      where: { id, userId: (session.user as any).id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (result.count === 0) return NextResponse.json({ error: "API key not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Failed to revoke API key" }, { status: 500 }); }
}
