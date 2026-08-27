import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = schema.parse(body);

    // Test DB connection first
    try {
      await prisma.$connect();
    } catch (connErr) {
      console.error("[register] DB connection failed:", connErr);
      return NextResponse.json(
        { error: "Database connection failed. Please check DATABASE_URL in your environment variables." },
        { status: 503 }
      );
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "Email already registered. Please sign in instead." }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    return NextResponse.json({ id: user.id, email: user.email, name: user.name });
  } catch (err: unknown) {
    const e = err as Record<string, unknown>;
    if (e?.name === "ZodError") {
      return NextResponse.json({ error: (e.errors as unknown[]) }, { status: 400 });
    }
    // Prisma unique constraint
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Email already registered." }, { status: 400 });
    }
    console.error("[register] Unexpected error:", err);
    return NextResponse.json(
      { error: "Registration failed. Please ensure your database is configured correctly and try again." },
      { status: 500 }
    );
  }
}
