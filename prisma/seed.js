import {
  connectDatabase,
  disconnectDatabase,
  prisma,
} from "../lib/prisma.js";

const categories = [
  {
    name: "Мясо и птица",
    slug: "myaso-i-ptitsa",
    sortOrder: 10,
    isFeatured: true,
  },
  {
    name: "Колбасы и деликатесы",
    slug: "kolbasy-i-delikatesy",
    sortOrder: 20,
    isFeatured: true,
  },
  {
    name: "Полуфабрикаты",
    slug: "polufabrikaty",
    sortOrder: 30,
    isFeatured: true,
  },
  {
    name: "Готовая еда",
    slug: "gotovaya-eda",
    sortOrder: 40,
    isFeatured: true,
  },
  {
    name: "Молочные продукты и яйца",
    slug: "molochnye-produkty-i-yaytsa",
    sortOrder: 50,
    isFeatured: true,
  },
  {
    name: "Овощи, фрукты и зелень",
    slug: "ovoshchi-frukty-i-zelen",
    sortOrder: 60,
    isFeatured: true,
  },
  {
    name: "Хлеб и выпечка",
    slug: "khleb-i-vypechka",
    sortOrder: 70,
    isFeatured: true,
  },
  {
    name: "Бакалея",
    slug: "bakaleya",
    sortOrder: 80,
    isFeatured: true,
  },
  {
    name: "Заморозка",
    slug: "zamorozka",
    sortOrder: 90,
    isFeatured: false,
  },
  {
    name: "Рыба и морепродукты",
    slug: "ryba-i-moreprodukty",
    sortOrder: 100,
    isFeatured: false,
  },
  {
    name: "Напитки",
    slug: "napitki",
    sortOrder: 110,
    isFeatured: false,
  },
  {
    name: "Сладости",
    slug: "sladosti",
    sortOrder: 120,
    isFeatured: false,
  },
  {
    name: "Товары для дома",
    slug: "tovary-dlya-doma",
    sortOrder: 130,
    isFeatured: false,
  },
  {
    name: "Товары для детей",
    slug: "tovary-dlya-detey",
    sortOrder: 140,
    isFeatured: false,
  },
  {
    name: "Товары для животных",
    slug: "tovary-dlya-zhivotnykh",
    sortOrder: 150,
    isFeatured: false,
  },
];

async function seedCategories() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        slug: category.slug,
      },

      update: {
        name: category.name,
        sortOrder: category.sortOrder,
        isFeatured: category.isFeatured,
        isActive: true,
      },

      create: {
        ...category,
        isActive: true,
      },
    });
  }
}

async function main() {
  await connectDatabase();

  await seedCategories();

  console.log(
    `Seed completed successfully: ${categories.length} categories synchronized.`,
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
