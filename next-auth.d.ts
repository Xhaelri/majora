/* eslint-disable @typescript-eslint/no-unused-vars */

import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      firstName?: string
      lastName?: string
      image?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    firstName?: string
    lastName?: string
    image?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    firstName?: string
    lastName?: string
  }
}