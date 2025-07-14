// prisma/seed.ts
import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'admin@hotel.com'
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } })

  if (!admin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    admin = await prisma.user.create({
      data: {
        name: 'Main Admin',
        email: adminEmail,
        password: hashedPassword,
        role: UserRole.ADMIN,
      },
    })
    console.log(`Created admin user: ${admin.email}`)
  } else {
    console.log('Admin user already exists.')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })