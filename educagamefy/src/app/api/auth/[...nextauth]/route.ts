import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/services/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role?: string | null;
    };
  }

  interface JWT {
    id?: string;
    role?: string;
  }
}

const handler = NextAuth({
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        // Buscar o usuário no banco
        const user = await prisma.users.findFirst({
          where: { email: { equals: credentials.email, mode: "insensitive" } },
        });

        if (!user) return null;

        // Validar senha
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        // Retornar dados necessários
        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role.toString().toLowerCase(),
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      if (token.role) session.user.role = token.role as string;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
