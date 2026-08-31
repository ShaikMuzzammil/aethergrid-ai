import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

const DEMO_EMAIL = "demo@aethergrid.ai";
const DEMO_PASS  = "DemoPass123!";

// Cache demo user existence to avoid repeated DB checks
let _demoUserCached = false;

async function ensureDemoUser(): Promise<boolean> {
  if (_demoUserCached) return true;
  try {
    await prisma.$queryRaw`SELECT 1`;
    const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL }, select: { id: true } });
    if (existing) { _demoUserCached = true; return true; }
    // Use 8 rounds for demo user creation speed (still secure)
    const hashed = await bcrypt.hash(DEMO_PASS, 8);
    await prisma.user.create({
      data: { name: "Demo User", email: DEMO_EMAIL, password: hashed, role: "USER",
               bio: "Edge AI enthusiast and IoT developer", theme: "dark" },
    });
    _demoUserCached = true;
    console.log("[auth] ✅ Demo user auto-created");
    return true;
  } catch (e) {
    console.warn("[auth] ⚠️ ensureDemoUser failed:", e);
    return false;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 days
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
          if (credentials.email === DEMO_EMAIL) await ensureDemoUser();
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: { id: true, email: true, name: true, image: true, role: true, password: true }
          });
          if (!user?.password) return null;
          const valid = await bcrypt.compare(credentials.password, user.password);
          if (!valid) return null;
          return { id: user.id, email: user.email!, name: user.name, image: user.image, role: user.role };
        } catch (e) {
          console.error("[auth] authorize error:", e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = user.id; token.role = (user as any).role; }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id   = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to relative paths to avoid wrong domain issues
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false,
};
