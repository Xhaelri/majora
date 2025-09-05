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
    signIn: "/signin",
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
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("authorize called", credentials);
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

          console.log("authorize returning", user);
          return {
            id: user.id,
            email: user.email ?? "",
            name:
              user.name ??
              `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
            firstName: user.firstName ?? "",
            lastName: user.lastName ?? "",
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("signIn callback", { user, account, profile });

      // Only handle Google OAuth users here, not credentials users
      if (account?.provider === "google") {
        try {
          const existingUser = await db.user.findUnique({
            where: { email: user.email! },
          });

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
                role: "USER", // Default role for new users
              },
            });

            // Create cart for new user
            await db.cart.create({
              data: {
                userId: newUser.id,
                items: [],
              },
            });

            // Update user object with database values
            user.id = newUser.id;
            user.role = newUser.role;
            user.firstName = firstName;
            user.lastName = lastName;
          } else {
            // Update user object with existing user data
            user.id = existingUser.id;
            user.role = existingUser.role;
            user.firstName = existingUser.firstName || undefined;
            user.lastName = existingUser.lastName || undefined;
          }
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, trigger }) {
      // Handle initial login
      if (user) {
        try {
          const dbUser = await db.user.findUnique({
            where: { email: user.email! },
          });

          if (dbUser) {
            token.sub = dbUser.id;
            token.email = dbUser.email;
            token.name = dbUser.name;
            token.firstName = dbUser.firstName;
            token.lastName = dbUser.lastName;
            token.image = dbUser.image;
            token.role = dbUser.role;
          } else {
            // Fallback to user object data
            token.sub = user.id;
            token.email = user.email;
            token.name = user.name;
            token.firstName = user.firstName || "";
            token.lastName = user.lastName || "";
            token.image = user.image;
            token.role = user.role || "USER";
          }
        } catch (error) {
          console.error("Error in jwt callback during user login:", error);
          // Fallback to user object data
          token.sub = user.id;
          token.email = user.email;
          token.name = user.name;
          token.firstName = user.firstName || "";
          token.lastName = user.lastName || "";
          token.image = user.image;
          token.role = user.role || "USER";
        }
      }

      // Handle token refresh or update
      if ((token.sub && !token.email) || trigger === "update") {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.sub },
          });

          if (dbUser) {
            token.email = dbUser.email;
            token.name = dbUser.name;
            token.firstName = dbUser.firstName;
            token.lastName = dbUser.lastName;
            token.image = dbUser.image;
            token.role = dbUser.role;
          }
        } catch (error) {
          console.error("Error refreshing token:", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.email = token.email!;
        session.user.name = token.name as string;
        session.user.firstName = (token.firstName as string) || "";
        session.user.lastName = (token.lastName as string) || "";
        session.user.image = (token.image as string) || undefined;
        session.user.role = (token.role as string) || "USER";
      }

      return session;
    },
  },
});
