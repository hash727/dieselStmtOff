// fix-users.ts
// import { PrismaClient } from '@prisma/client'
// const prisma = new PrismaClient()

import { prisma } from "./lib/prisma";

async function main() {
  const firstOffice = await prisma.office.findFirst();
  if (!firstOffice) return console.log("No offices found. Create one first.");

  await prisma.user.updateMany({
    where: { activeOfficeId: null },
    data: { activeOfficeId: firstOffice.id }
  });
  console.log("Updated all users with a default office.");
}

main();
