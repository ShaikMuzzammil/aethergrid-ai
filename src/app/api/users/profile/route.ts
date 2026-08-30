import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  theme: z.string().optional(),
  notifyEmail: z.boolean().optional(),
  notifyPush: z.boolean().optional(),
  notifySlack: z.boolean().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = (session.user as any).id;
  try {
    const user = await prisma.user.findUnique({
      where: { id: uid },
      select: { id: true, name: true, email: true, bio: true, timezone: true, language: true, theme: true, notifyEmail: true, notifyPush: true, notifySlack: true, role: true, createdAt: true, twoFactorEnabled: true },
    });
    return NextResponse.json(user);
  } catch { return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 }); }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = (session.user as any).id;
  try {
    const body = await req.json();
    const data = profileSchema.parse(body);
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.language !== undefined) updateData.language = data.language;
    if (data.theme !== undefined) updateData.theme = data.theme;
    if (data.notifyEmail !== undefined) updateData.notifyEmail = data.notifyEmail;
    if (data.notifyPush !== undefined) updateData.notifyPush = data.notifyPush;
    if (data.notifySlack !== undefined) updateData.notifySlack = data.notifySlack;

    if (data.newPassword) {
      if (!data.currentPassword) return NextResponse.json({ error: "Current password required" }, { status: 400 });
      const user = await prisma.user.findUnique({ where: { id: uid } });
      if (!user?.password) return NextResponse.json({ error: "No password set" }, { status: 400 });
      const valid = await bcrypt.compare(data.currentPassword, user.password);
      if (!valid) return NextResponse.json({ error: "Current password incorrect" }, { status: 400 });
      updateData.password = await bcrypt.hash(data.newPassword, 12);
    }

    const user = await prisma.user.update({ where: { id: uid }, data: updateData, select: { id: true, name: true, email: true, bio: true, timezone: true, language: true, theme: true, notifyEmail: true, notifyPush: true, notifySlack: true } });
    return NextResponse.json(user);
  } catch (e: any) {
    if (e?.name === "ZodError") return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
