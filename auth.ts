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
              },
            });

            await db.cart.create({
              data: {
                userId: newUser.id,
              },
            });

            user.id = newUser.id;
          } else {
            user.id = existingUser.id;
          }
        } catch (error) {
          console.error("Error creating user:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
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
        } else {
          // Fallback to user object data
          token.sub = user.id;
          token.email = user.email;
          token.name = user.name;
          token.firstName = user.firstName;
          token.lastName = user.lastName;
          token.image = user.image;
        }
      }

      if (token.sub && !token.email) {
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
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.image = token.image as string;
      }

      return session;
    },
  },
});

// Add events for debugging
// events: {
//   async signIn({ user, account, profile }) {
//     console.log("Sign in event:", { user, account, profile });
//   },
//   async signOut(event) {
//     // event can be { session } or { token }
//     if ("token" in event) {
//       console.log("Sign out event (token):", { token: event.token });
//     } else if ("session" in event) {
//       console.log("Sign out event (session):", { session: event.session });
//     } else {
//       console.log("Sign out event: unknown event", event);
//     }
//   },
//   async session({ session, token }) {
//     console.log("Session event:", { session, token });
//   },
// },
