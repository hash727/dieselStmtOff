import NextAuth from "next-auth";
import authConfig from "./auth.config";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),

  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Credentials received:", credentials);
        if (!credentials?.username || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: {
            username: credentials.username as string,
          },
          include: { offices: true }
        });

        if (!user || !user.password) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        // return isPasswordValid ? user : null;
        return {
          id: user.id,
          name: user.name ?? undefined,
          role: user.role ?? "USER",
          email: user.email ?? undefined,
          image: user.image ?? undefined,
          officeId: user.offices[0]?.id ?? undefined,
          username: user.username ?? undefined,
        };
      },
    }),
  ],
  // trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
});
