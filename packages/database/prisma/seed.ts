import "dotenv/config";
import { prisma, Role, AreaStatus, UserStatus } from "../src";

const AREAS = [
  {
    name: "Science",
    slug: "science",
    description: "Discoveries, research, and the natural world.",
    color: "#2f5d50",
    displayOrder: 1,
    sourceConfig: {
      categories: ["Category:Science"],
      includeSubcategories: true,
      depth: 1,
      maxCandidates: 100,
      excludeCategories: ["Category:Disambiguation pages"],
    },
  },
  {
    name: "History",
    slug: "history",
    description: "People, places, and events that shaped the world.",
    color: "#8a5a2b",
    displayOrder: 2,
    sourceConfig: {
      categories: ["Category:History"],
      includeSubcategories: true,
      depth: 1,
      maxCandidates: 100,
      excludeCategories: ["Category:Disambiguation pages"],
    },
  },
  {
    name: "Art",
    slug: "art",
    description: "Painting, sculpture, architecture, and visual culture.",
    color: "#7d4a5e",
    displayOrder: 3,
    sourceConfig: {
      categories: ["Category:Visual arts"],
      includeSubcategories: true,
      depth: 1,
      maxCandidates: 100,
      excludeCategories: ["Category:Disambiguation pages"],
    },
  },
  {
    name: "Technology",
    slug: "technology",
    description: "Engineering, computing, and how things are built.",
    color: "#34506e",
    displayOrder: 4,
    sourceConfig: {
      categories: ["Category:Technology"],
      includeSubcategories: true,
      depth: 1,
      maxCandidates: 100,
      excludeCategories: ["Category:Disambiguation pages"],
    },
  },
  {
    name: "Space",
    slug: "space",
    description: "Astronomy, exploration, and the cosmos.",
    color: "#43376b",
    displayOrder: 5,
    sourceConfig: {
      categories: ["Category:Astronomy"],
      includeSubcategories: true,
      depth: 1,
      maxCandidates: 100,
      excludeCategories: ["Category:Disambiguation pages"],
    },
  },
] as const;

async function main(): Promise<void> {
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { role: Role.ADMIN, status: UserStatus.ACTIVE },
    create: {
      email: "admin@example.com",
      name: "Admin",
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: { role: Role.USER, status: UserStatus.ACTIVE },
    create: {
      email: "user@example.com",
      name: "User",
      role: Role.USER,
      status: UserStatus.ACTIVE,
    },
  });

  const areas = [];
  for (const area of AREAS) {
    const created = await prisma.area.upsert({
      where: { slug: area.slug },
      update: { name: area.name, status: AreaStatus.ACTIVE },
      create: {
        name: area.name,
        slug: area.slug,
        description: area.description,
        color: area.color,
        displayOrder: area.displayOrder,
        status: AreaStatus.ACTIVE,
        sourceConfig: area.sourceConfig,
      },
    });
    areas.push(created);
  }

  const science = areas.find((area) => area.slug === "science");
  const history = areas.find((area) => area.slug === "history");
  const technology = areas.find((area) => area.slug === "technology");

  if (!science || !history || !technology) {
    throw new Error("Required seed areas were not created");
  }

  for (const userId of [admin.id, user.id]) {
    for (const area of [science, history, technology]) {
      await prisma.userArea.upsert({
        where: { userId_areaId: { userId, areaId: area.id } },
        update: {},
        create: { userId, areaId: area.id, assignedBy: "seed" },
      });
    }
  }

  console.info(`Seeded admin (${admin.email}), user (${user.email}), and ${areas.length} areas.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
