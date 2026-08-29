import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = schema.parse(body);

    // Check DB is reachable
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (connErr: unknown) {
      const msg = connErr instanceof Error ? connErr.message : String(connErr);
      console.error("[register] DB unreachable:", msg);
      return NextResponse.json(
        { error: "Database not reachable. Ensure DATABASE_URL + DIRECT_URL are set in Vercel environment variables, then redeploy." },
        { status: 503 }
      );
    }

    // Check if tables exist (schema not pushed yet)
    try {
      await prisma.user.count();
    } catch (tableErr: unknown) {
      const msg = tableErr instanceof Error ? tableErr.message : String(tableErr);
      console.error("[register] Table missing:", msg);
      return NextResponse.json(
        { error: "Database schema not initialised. Redeploy the app — the build step will auto-create all tables." },
        { status: 503 }
      );
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json(
        { error: "Email already registered. Sign in instead." },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err: unknown) {
    const e = err as Record<string, unknown>;
    if (e?.name === "ZodError") {
      const issues = (e.errors as Array<{ message: string }>).map((i) => i.message);
      return NextResponse.json({ error: issues.join(". ") }, { status: 400 });
    }
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Email already registered." }, { status: 400 });
    }
    // Table does not exist (P2021) or relation missing (P2022)
    if (e?.code === "P2021" || e?.code === "P2022") {
      return NextResponse.json(
        { error: "Database tables not created yet. Please redeploy — the new build command auto-creates them." },
        { status: 503 }
      );
    }
    console.error("[register] Error:", err);
    return NextResponse.json(
      { error: "Registration failed. Check server logs for details." },
      { status: 500 }
    );
  }
}
