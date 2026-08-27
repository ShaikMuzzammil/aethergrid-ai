import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

async function ensureDemoUser() {
  try {
    const exists = await prisma.user.findUnique({ where: { email: "demo@aethergrid.ai" } });
    if (!exists) {
      const hashed = await bcrypt.hash("DemoPass123!", 12);
      await prisma.user.create({
        data: { name: "Demo User", email: "demo@aethergrid.ai", password: hashed, role: "USER" },
      });
      console.log("[auth] Demo user auto-created");
    }
  } catch (e) {
    console.warn("[auth] Could not ensure demo user:", e);
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
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          // Auto-create demo user on first login attempt
          if (credentials.email === "demo@aethergrid.ai") {
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
        token.id = user.id;
        token.role = (user as Record<string, unknown>).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as Record<string, unknown>).id = token.id as string;
        (session.user as Record<string, unknown>).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
