import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/app/lib/prisma";
import { verifyPassword } from "@/app/lib/auth";

// Validate NEXTAUTH_SECRET at startup (warning only, don't crash)
if (!process.env.NEXTAUTH_SECRET) {
  console.error(
    '⚠️ WARNING: NEXTAUTH_SECRET is not set! ' +
    'This is a critical security issue. Generate one with: openssl rand -base64 32'
  );
} else if (process.env.NEXTAUTH_SECRET.length < 32) {
  console.warn(
    '⚠️ WARNING: NEXTAUTH_SECRET is shorter than recommended (32 characters). ' +
    'Consider generating a new one with: openssl rand -base64 32'
  );
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: {
            subscription: true,
          },
        });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        // Verify password
        const isValid = await verifyPassword(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error(
            "Please verify your email address before signing in. Check your inbox for the verification link."
          );
        }

        // Return user object
        return {
          id: user.id,
          email: user.email,
          name: user.firstName
            ? `${user.firstName} ${user.lastName || ""}`.trim()
            : user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          plan: user.subscription?.plan || "free",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.plan = user.plan;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.plan = token.plan as string;
        session.user.firstName = token.firstName as string | null;
        session.user.lastName = token.lastName as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour
  },
  secret: process.env.NEXTAUTH_SECRET,
};
