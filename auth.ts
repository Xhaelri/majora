import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "./lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { Environments } from "./constants/constants";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  pages: {
    signIn: "/signin"
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, //7 days
    updateAge: 24 * 60 * 60, //24 h
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === Environments.DEV,

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true, // Allows linking accounts with same email
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await db.user.findUnique({
            where: {
              email: credentials.email as string,
            },
          });

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email ?? "",
            name: user.name ?? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
            firstName: user.firstName ?? "",
            lastName: user.lastName ?? "",
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Handle Google sign-in
      if (account?.provider === "google") {
        try {
          // Check if user exists
          const existingUser = await db.user.findUnique({
            where: { email: user.email! },
          });

          // If user doesn't exist, create one
          if (!existingUser) {
            const names = user.name?.split(" ") || [];
            const firstName = names[0] || "";
            const lastName = names.slice(1).join(" ") || "";

            const newUser = await db.user.create({
              data: {
                email: user.email!,
                name: user.name || "",
                firstName,
                lastName,
                image: user.image,
                // No password for Google users
              },
            });

            // Create a cart for the new user
            await db.cart.create({
              data: {
                userId: newUser.id,
              },
            });
          }
        } catch (error) {
          console.error("Error creating user:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }
      
      // For Google users, get additional info from database
      if (account?.provider === "google" && user?.email) {
        const dbUser = await db.user.findUnique({
          where: { email: user.email },
        });
        
        if (dbUser) {
          token.firstName = dbUser.firstName;
          token.lastName = dbUser.lastName;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
      }
      return session;
    },
  },
});