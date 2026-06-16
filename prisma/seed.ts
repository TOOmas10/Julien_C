import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.role.createMany({
    data: [
      { id: 1, nom: "User" },
      { id: 2, nom: "Admin" },
    ],
    skipDuplicates: true,
  });

  await prisma.prestation.createMany({
    data: [
      { id: 1, type: "Anniversaires" },
      { id: 2, type: "Mariages" },
      { id: 3, type: "Soirées Privées" },
    ],
    skipDuplicates: true,
  });

  await prisma.etat.createMany({
    data: [
      { id: 1, statut: "Validée" },
      { id: 2, statut: "Refusée" },
      { id: 3, statut: "En attente" },
    ],
    skipDuplicates: true,
  });

  console.log("Seed done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
