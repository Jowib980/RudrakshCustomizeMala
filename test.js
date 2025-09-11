import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const session = await prisma.sessions.create({
    data: {
      shop: "test-shop",
      state: "active",
      isOnline: true,
      accessToken: "abc123",
    },
  });
  console.log(session);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
