import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = (session.user as any).id;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  try {
    const [devices, models, deployments] = await Promise.all([
      prisma.device.findMany({
        where: { userId: uid, OR: [{ name: { contains: q, mode: "insensitive" } }, { location: { contains: q, mode: "insensitive" } }] },
        select: { id: true, name: true, type: true, status: true, location: true }, take: 5,
      }),
      prisma.aiModel.findMany({
        where: { userId: uid, OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] },
        select: { id: true, name: true, framework: true, status: true }, take: 5,
      }),
      prisma.deployment.findMany({
        where: { userId: uid, name: { contains: q, mode: "insensitive" } },
        select: { id: true, name: true, status: true, region: true }, take: 5,
      }),
    ]);

    return NextResponse.json({
      results: [
        ...devices.map(d => ({ type: "device", id: d.id, label: d.name, sub: `${d.type} · ${d.status}`, href: "/devices" })),
        ...models.map(m => ({ type: "model", id: m.id, label: m.name, sub: `${m.framework} · ${m.status}`, href: "/ai-models" })),
        ...deployments.map(d => ({ type: "deployment", id: d.id, label: d.name, sub: `${d.region} · ${d.status}`, href: "/deployments" })),
      ],
    });
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
