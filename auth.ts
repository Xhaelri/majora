import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "./lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { Environments } from "./constants/constants";
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  pages:{
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
    Google,
    Credentials({
      name: "credentials",
      credentials: {
        email: {
          type: "email",
          label: "Email",
          placeholder: "johndoe@gmail.com",
        },
        password: {
          type: "password",
          label: "Password",
          placeholder: "*****",
        },
      },
      authorize: (credentials) => {
        const user = credentials;
        return {
          id: crypto.randomUUID(),
          ...user,
        };
      },
    }),
  ],
});
