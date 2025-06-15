import { Environments } from "@/constants/constants";
import { PrismaClient } from "./generated/prisma";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === Environments.DEV
        ? ["query", "error", "warn"]
        : ["error"],
  });

  if (process.env.NODE_ENV !== Environments.PROD) globalForPrisma.prisma = db