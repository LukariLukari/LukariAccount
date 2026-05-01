import { prisma } from "@/lib/prisma";

type ResourceLike = {
  id: string;
  title: string;
  price: number;
  isPaid: boolean;
};

function normalizeTitle(value: string) {
  return value.trim().toLowerCase();
}

export async function syncLegacyResourcePurchases(userId: string) {
  const [resources, purchases, walletTransactions] = await Promise.all([
    prisma.resource.findMany({
      where: { isPaid: true, price: { gt: 0 } },
      select: { id: true, title: true, price: true, isPaid: true },
    }),
    prisma.resourcePurchase.findMany({
      where: { userId },
      select: { resourceId: true },
    }),
    prisma.walletTransaction.findMany({
      where: {
        userId,
        type: "PURCHASE",
        OR: [{ referenceType: "Resource" }, { note: { startsWith: "Mua t" } }],
      },
      select: {
        referenceId: true,
        note: true,
        amount: true,
      },
    }),
  ]);

  const purchasedIds = new Set(purchases.map((item) => item.resourceId));
  const resourcesById = new Map(resources.map((resource) => [resource.id, resource]));
  const resourcesByTitle = new Map(resources.map((resource) => [normalizeTitle(resource.title), resource]));
  const recovered: ResourceLike[] = [];

  for (const tx of walletTransactions) {
    let matched: ResourceLike | undefined;

    if (tx.referenceId && resourcesById.has(tx.referenceId)) {
      matched = resourcesById.get(tx.referenceId);
    }

    if (!matched && tx.note) {
      const title = tx.note.split(":").slice(1).join(":").trim();
      if (title) {
        matched = resourcesByTitle.get(normalizeTitle(title));
      }
    }

    if (!matched) continue;
    if (purchasedIds.has(matched.id)) continue;
    if (Math.abs(Number(tx.amount)) < matched.price) continue;

    purchasedIds.add(matched.id);
    recovered.push(matched);
  }

  if (recovered.length > 0) {
    await prisma.resourcePurchase.createMany({
      data: recovered.map((resource) => ({
        userId,
        resourceId: resource.id,
        amount: resource.price,
      })),
      skipDuplicates: true,
    });
  }

  return Array.from(purchasedIds);
}
