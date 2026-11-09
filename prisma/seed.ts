import { PrismaClient } from "@prisma/client";
import { INITIAL_PRODUCTS, INITIAL_SHOPS } from "../src/lib/mock-data";
import { hashPassword } from "../src/lib/auth";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding TokTrend Flow SQLite Database...");

  // 0. Owner / Admin Account (Only this account can see the Admin Panel)
  const adminHash = hashPassword("admin123");
  await prisma.user.upsert({
    where: { email: "admin@toktrend.id" },
    update: { passwordHash: adminHash, planTier: "PRO" },
    create: {
      id: "admin-owner-1",
      email: "admin@toktrend.id",
      name: "Owner / Admin TokTrend",
      passwordHash: adminHash,
      planTier: "PRO",
      dailySearchUsed: 0,
      dailyPromptUsed: 0,
    },
  });
  await prisma.$executeRawUnsafe(
    `UPDATE User SET role = 'ADMIN' WHERE email = 'admin@toktrend.id'`
  );

  // 1. Default Demo User (Regular User - Cannot see Admin Panel)
  const defaultHash = hashPassword("password123");
  const demoUser = await prisma.user.upsert({
    where: { email: "creator@toktrend.id" },
    update: { passwordHash: defaultHash },
    create: {
      id: "demo-user-1",
      email: "creator@toktrend.id",
      name: "Rina Affiliate Creator",
      passwordHash: defaultHash,
      planTier: "FREE",
      dailySearchUsed: 1,
      dailyPromptUsed: 1,
    },
  });

  // 2. Seed Shops
  for (const shop of INITIAL_SHOPS) {
    await prisma.shop.upsert({
      where: { id: shop.id },
      update: {},
      create: {
        id: shop.id,
        shopName: shop.name,
        category: shop.category,
        rating: shop.rating,
        totalProducts: shop.activeProducts,
        gmv30dIdr: BigInt(shop.gmv30dNumeric),
        avgCommission: shop.avgCommission,
        heroProduct: shop.heroProduct,
        fulfillmentSla: shop.fulfillmentSla,
      },
    });
  }

  // 3. Seed Products
  for (const p of INITIAL_PRODUCTS) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        shopId: p.shopId,
        title: p.title,
        categoryName: p.category,
        icon: p.icon,
        priceIdr: p.price,
        commissionRate: p.commissionRate,
        commissionAmountIdr: p.commissionAmount,
        sold7d: p.sold7d,
        totalSoldAllTime: p.sold7d * 4,
        growthRate7d: p.growth7d,
        gmv7dIdr: BigInt(p.gmv7d),
        statusNote: p.statusNote,
        visualLocksJson: JSON.stringify(p.visualLocks),
        hashtagsJson: JSON.stringify(p.hashtags),
        sparklineJson: JSON.stringify(p.sparkline),
      },
    });
  }

  console.log(`✅ Seeded ${INITIAL_SHOPS.length} shops and ${INITIAL_PRODUCTS.length} products for ${demoUser.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
