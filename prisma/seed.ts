import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const office = await prisma.office.upsert({
    where: { name: 'Main Exchange' },
    update: {},
    create: {
      name: 'Main Exchange',
      location: 'Station Road, Bellary',
    },
  })

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      username: 'admin',
      password: 'admin', // Remember to hash this!
      activeOfficeId: office.id,
    },
  })

  console.log('✅ Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
