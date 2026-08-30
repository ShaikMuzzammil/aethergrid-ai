import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import crypto from "crypto";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = (session.user as any).id;
  try {
    const membership = await prisma.teamMember.findFirst({
      where: { userId: uid },
      include: {
        team: {
          include: {
            members: { include: { user: { select: { id: true, name: true, email: true, image: true, createdAt: true } } } },
            invitations: { where: { accepted: false, expiresAt: { gt: new Date() } } },
          },
        },
      },
    });
    if (!membership) {
      return NextResponse.json({ team: null, members: [], invitations: [] });
    }
    return NextResponse.json({
      team: membership.team,
      members: membership.team.members,
      invitations: membership.team.invitations,
      myRole: membership.role,
    });
  } catch { return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = (session.user as any).id;
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "invite") {
      const schema = z.object({ email: z.string().email(), role: z.enum(["ADMIN","MEMBER","VIEWER"]) });
      const data = schema.parse(body);
      const membership = await prisma.teamMember.findFirst({ where: { userId: uid } });
      if (!membership) return NextResponse.json({ error: "No team found" }, { status: 404 });
      const token = crypto.randomBytes(24).toString("hex");
      const invitation = await prisma.teamInvitation.create({
        data: { teamId: membership.teamId, email: data.email, role: data.role as any, token, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      });
      return NextResponse.json({ invitation, inviteUrl: `${process.env.NEXTAUTH_URL}/invite/${token}` }, { status: 201 });
    }

    if (action === "remove") {
      const { memberId } = body;
      await prisma.teamMember.delete({ where: { id: memberId } });
      return NextResponse.json({ success: true });
    }

    if (action === "update_role") {
      const schema = z.object({ memberId: z.string(), role: z.enum(["ADMIN","MEMBER","VIEWER"]) });
      const data = schema.parse(body);
      const member = await prisma.teamMember.update({ where: { id: data.memberId }, data: { role: data.role as any } });
      return NextResponse.json(member);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    if (e?.name === "ZodError") return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to process team action" }, { status: 500 });
  }
}
