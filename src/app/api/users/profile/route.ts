import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = (session.user as any).id;
  try {
    const user = await prisma.user.findUnique({
      where: { id: uid },
      select: { id:true,name:true,email:true,bio:true,timezone:true,language:true,theme:true,
                notifyEmail:true,notifyPush:true,notifySlack:true,role:true,createdAt:true },
    });
    if (!user) return NextResponse.json({ error:"User not found" },{ status:404 });
    return NextResponse.json(user);
  } catch { return NextResponse.json({ error:"Failed" },{ status:500 }); }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error:"Unauthorized" },{ status:401 });
  const uid = (session.user as any).id;
  try {
    const body = await req.json();

    // Password change branch
    if (body.currentPassword && body.newPassword) {
      const user = await prisma.user.findUnique({ where:{ id:uid }, select:{ password:true } });
      if (!user?.password) return NextResponse.json({ error:"No password set" },{ status:400 });
      const valid = await bcrypt.compare(body.currentPassword, user.password);
      if (!valid) return NextResponse.json({ error:"Current password is incorrect" },{ status:400 });
      if (body.newPassword.length < 8) return NextResponse.json({ error:"Password too short (min 8 chars)" },{ status:400 });
      const hashed = await bcrypt.hash(body.newPassword, 10);
      await prisma.user.update({ where:{ id:uid }, data:{ password:hashed } });
      return NextResponse.json({ success:true, message:"Password updated" });
    }

    // Profile / prefs update
    const allowed: Record<string,unknown> = {};
    const fields = ["name","bio","timezone","language","theme","density","notifyEmail","notifyPush","notifySlack"];
    fields.forEach(f => { if (f in body) allowed[f] = body[f]; });
    if (Object.keys(allowed).length === 0) return NextResponse.json({ error:"No valid fields" },{ status:400 });

    const updated = await prisma.user.update({ where:{ id:uid }, data: allowed, select:{
      id:true,name:true,email:true,bio:true,timezone:true,language:true,theme:true,
      notifyEmail:true,notifyPush:true,notifySlack:true,
    }});
    return NextResponse.json(updated);
  } catch (e:any) {
    console.error("Profile PATCH error:", e);
    return NextResponse.json({ error:"Failed to update" },{ status:500 });
  }
}
