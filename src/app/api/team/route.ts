import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const teams = await prisma.team.findMany({
      where: { members: { some: { userId: (session.user as any).id } } },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, image: true } } },
          orderBy: { joinedAt: "asc" },
        },
        _count: { select: { members: true } },
      },
    });
    return NextResponse.json({ teams });
  } catch { return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    if (body.action === "create_team") {
      const team = await prisma.team.create({
        data: {
          name: body.name, slug: body.name.toLowerCase().replace(/\s+/g, "-"),
          members: { create: { userId: (session.user as any).id, role: "OWNER" } },
        },
      });
      return NextResponse.json(team, { status: 201 });
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
