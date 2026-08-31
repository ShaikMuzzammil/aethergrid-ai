import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error:"Unauthorized" },{ status:401 });
  const uid = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get("unread") === "true";
  try {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId:uid, ...(unreadOnly ? { read:false } : {}) },
        orderBy: { createdAt:"desc" }, take:50,
      }),
      prisma.notification.count({ where:{ userId:uid, read:false } }),
    ]);
    return NextResponse.json({ notifications, unreadCount });
  } catch {
    return NextResponse.json({ error:"Failed" },{ status:500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error:"Unauthorized" },{ status:401 });
  const uid = (session.user as any).id;
  try {
    const body = await req.json();
    // markAllRead: true  OR  action: "markAllRead"  (handle both for compat)
    if (body.markAllRead === true || body.action === "markAllRead") {
      await prisma.notification.updateMany({ where:{ userId:uid, read:false }, data:{ read:true } });
      return NextResponse.json({ success:true });
    }
    if (body.id) {
      const n = await prisma.notification.update({ where:{ id:body.id, userId:uid }, data:{ read:true } });
      return NextResponse.json(n);
    }
    return NextResponse.json({ error:"Invalid request" },{ status:400 });
  } catch {
    return NextResponse.json({ error:"Failed" },{ status:500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error:"Unauthorized" },{ status:401 });
  const uid = (session.user as any).id;
  try {
    const body = await req.json();
    const n = await prisma.notification.create({
      data: { userId:uid, title:body.title||"Notification", message:body.message||"", type:body.type||"SYSTEM" },
    });
    return NextResponse.json(n, { status:201 });
  } catch {
    return NextResponse.json({ error:"Failed" },{ status:500 });
  }
}
