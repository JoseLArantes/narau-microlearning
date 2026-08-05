import "dotenv/config";
import { prisma, Role, AreaStatus, UserStatus } from "../src";

const TENANTS = [
  { id: "en", slug: "en", name: "English", language: "en", isDefault: true },
  { id: "es", slug: "es", name: "Español", language: "es", isDefault: false },
  { id: "pt", slug: "pt", name: "Português", language: "pt", isDefault: false },
] as const;

const TENANT_AREAS: Record<string, Array<{ name: string; slug: string; description: string; color: string; displayOrder: number; categories: string[] }>> = {
  en: [
    { name: "Science", slug: "science", description: "Discoveries, research, and the natural world.", color: "#2f5d50", displayOrder: 1, categories: ["Category:Science"] },
    { name: "History", slug: "history", description: "People, places, and events that shaped the world.", color: "#8a5a2b", displayOrder: 2, categories: ["Category:History"] },
    { name: "Art", slug: "art", description: "Painting, sculpture, architecture, and visual culture.", color: "#7d4a5e", displayOrder: 3, categories: ["Category:Visual arts"] },
    { name: "Technology", slug: "technology", description: "Engineering, computing, and how things are built.", color: "#34506e", displayOrder: 4, categories: ["Category:Technology"] },
    { name: "Space", slug: "space", description: "Astronomy, exploration, and the cosmos.", color: "#43376b", displayOrder: 5, categories: ["Category:Astronomy"] },
  ],
  es: [
    { name: "Ciencia", slug: "science", description: "Descubrimientos, investigación y el mundo natural.", color: "#2f5d50", displayOrder: 1, categories: ["Categoría:Ciencia"] },
    { name: "Historia", slug: "history", description: "Personas, lugares y eventos que dieron forma al mundo.", color: "#8a5a2b", displayOrder: 2, categories: ["Categoría:Historia"] },
    { name: "Arte", slug: "art", description: "Pintura, escultura, arquitectura y cultura visual.", color: "#7d4a5e", displayOrder: 3, categories: ["Categoría:Artes visuales"] },
    { name: "Tecnología", slug: "technology", description: "Ingeniería, informática y cómo se construyen las cosas.", color: "#34506e", displayOrder: 4, categories: ["Categoría:Tecnología"] },
    { name: "Espacio", slug: "space", description: "Astronomía, exploración y el cosmos.", color: "#43376b", displayOrder: 5, categories: ["Categoría:Astronomía"] },
  ],
  pt: [
    { name: "Ciência", slug: "science", description: "Descobertas, pesquisas e o mundo natural.", color: "#2f5d50", displayOrder: 1, categories: ["Categoria:Ciência"] },
    { name: "História", slug: "history", description: "Pessoas, lugares e eventos que moldaram o mundo.", color: "#8a5a2b", displayOrder: 2, categories: ["Categoria:História"] },
    { name: "Arte", slug: "art", description: "Pintura, escultura, arquitetura e cultura visual.", color: "#7d4a5e", displayOrder: 3, categories: ["Categoria:Artes visuais"] },
    { name: "Tecnologia", slug: "technology", description: "Engenharia, computação e como as coisas são construídas.", color: "#34506e", displayOrder: 4, categories: ["Categoria:Tecnologia"] },
    { name: "Espaço", slug: "space", description: "Astronomia, exploração e o cosmos.", color: "#43376b", displayOrder: 5, categories: ["Categoria:Astronomia"] },
  ],
};

async function main(): Promise<void> {
  // Seed Tenants
  for (const tenant of TENANTS) {
    await prisma.tenant.upsert({
      where: { id: tenant.id },
      update: { slug: tenant.slug, name: tenant.name, language: tenant.language, isDefault: tenant.isDefault, status: "ACTIVE" },
      create: {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
        language: tenant.language,
        isDefault: tenant.isDefault,
        status: "ACTIVE",
      },
    });
  }

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { role: Role.ADMIN, status: UserStatus.ACTIVE, tenantId: "en" },
    create: {
      email: "admin@example.com",
      name: "Admin",
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      tenantId: "en",
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: { role: Role.USER, status: UserStatus.ACTIVE, tenantId: "en" },
    create: {
      email: "user@example.com",
      name: "User",
      role: Role.USER,
      status: UserStatus.ACTIVE,
      tenantId: "en",
    },
  });

  let totalAreas = 0;
  for (const [tenantId, areaList] of Object.entries(TENANT_AREAS)) {
    const createdAreas = [];
    for (const area of areaList) {
      const created = await prisma.area.upsert({
        where: { slug_tenantId: { slug: area.slug, tenantId } },
        update: { name: area.name, status: AreaStatus.ACTIVE },
        create: {
          tenantId,
          parentId: null,
          level: "AREA",
          name: area.name,
          slug: area.slug,
          description: area.description,
          color: area.color,
          displayOrder: area.displayOrder,
          status: AreaStatus.ACTIVE,
          sourceConfig: {
            categories: area.categories,
            includeSubcategories: true,
            depth: 1,
            maxCandidates: 100,
            excludeCategories: ["Category:Disambiguation pages", "Categoría:Desambiguación", "Categoria:Desambiguação"],
          },
        },
      });
      createdAreas.push(created);
      totalAreas++;
    }

    if (tenantId === "en") {
      const mainAreas = createdAreas.slice(0, 3);
      for (const userId of [admin.id, user.id]) {
        for (const area of mainAreas) {
          await prisma.userArea.upsert({
            where: { userId_areaId: { userId, areaId: area.id } },
            update: {},
            create: { userId, tenantId, areaId: area.id, assignedBy: "seed" },
          });
        }
      }
    }
  }

  console.info(`Seeded tenants (${TENANTS.map((t) => t.id).join(", ")}), admin (${admin.email}), user (${user.email}), and ${totalAreas} areas.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
