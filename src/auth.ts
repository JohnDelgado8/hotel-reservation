import NextAuth, { User } from "next-auth"; // <-- Import the 'User' type
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { PrismaClient, UserRole } from "@prisma/client"; // <-- Import UserRole
import bcrypt from "bcryptjs"; // Use bcryptjs for consistency

const prisma = new PrismaClient();

// This is our custom user type that includes the 'role'
type UserWithRole = User & {
  role: UserRole;
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          return null;
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (isPasswordCorrect) {
          return user; // Prisma's user model already includes the role
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // The 'user' object is only passed on the initial sign-in.
      if (user) {
        // THE FIX IS HERE:
        // We cast the incoming user to our custom type 'UserWithRole'.
        // This tells TypeScript that we expect a 'role' property to be present.
        const userWithRole = user as UserWithRole;
        token.id = userWithRole.id;
        token.role = userWithRole.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.role) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});