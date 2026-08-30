import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = (session.user as any).id;
  try {
    const body = await req.json();
    const webhook = await prisma.webhook.update({ where: { id: params.id, userId: uid }, data: body });
    return NextResponse.json(webhook);
  } catch { return NextResponse.json({ error: "Failed to update webhook" }, { status: 500 }); }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = (session.user as any).id;
  try {
    await prisma.webhook.delete({ where: { id: params.id, userId: uid } });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Failed to delete webhook" }, { status: 500 }); }
}
