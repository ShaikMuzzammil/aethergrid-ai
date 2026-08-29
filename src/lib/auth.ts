import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

const DEMO_EMAIL = "demo@aethergrid.ai";
const DEMO_PASS  = "DemoPass123!";

async function ensureDemoUser(): Promise<boolean> {
  try {
    // First check if DB is alive
    await prisma.$queryRaw`SELECT 1`;

    const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
    if (existing) return true;

    const hashed = await bcrypt.hash(DEMO_PASS, 10);
    await prisma.user.create({
      data: { name: "Demo User", email: DEMO_EMAIL, password: hashed, role: "USER" },
    });
    console.log("[auth] ✅ Demo user auto-created");
    return true;
  } catch (e) {
    console.warn("[auth] ⚠️ ensureDemoUser failed:", e);
    return false;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // Auto-create demo user on first demo login
          if (credentials.email === DEMO_EMAIL) {
            await ensureDemoUser();
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user?.password) return null;

          const valid = await bcrypt.compare(credentials.password, user.password);
          if (!valid) return null;

          return {
            id: user.id,
            email: user.email!,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        } catch (e) {
          console.error("[auth] authorize error:", e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = (user as Record<string, unknown>).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as Record<string, unknown>).id   = token.id;
        (session.user as Record<string, unknown>).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
