import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// IMPORTATNT: Update this path to match the "output"
// import { PrismaClient } from "../app/generated/prisma";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

const prismaClientSingleton = () => {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(
    pool as unknown as ConstructorParameters<typeof PrismaPg>[0]
  );
  return new PrismaClient({ adapter });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

