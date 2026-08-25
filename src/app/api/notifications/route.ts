import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: (session.user as any).id },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    const unread = await prisma.notification.count({ where: { userId: (session.user as any).id, read: false } });
    return NextResponse.json({ notifications, unread });
  } catch { return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 }); }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { ids, markAll } = await req.json();
    if (markAll) {
      await prisma.notification.updateMany({ where: { userId: (session.user as any).id, read: false }, data: { read: true } });
    } else if (ids?.length) {
      await prisma.notification.updateMany({ where: { id: { in: ids }, userId: (session.user as any).id }, data: { read: true } });
    }
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 }); }
}
