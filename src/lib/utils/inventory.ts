import Inventory from '@/lib/db/models/Inventory';
import CatalogProduct from '@/lib/db/models/CatalogProduct';

export type InventoryCheckItem = {
  productId: string;
  variantId: string;
  quantity: number;
};

export type InventoryIssue = {
  productId: string;
  variantId: string;
  requested: number;
  available?: number;
  reason: 'NOT_AVAILABLE' | 'INSUFFICIENT_STOCK';
  title?: string;
  variantLabel?: string;
};

async function getProductInfo(productId: string, variantId: string) {
  // Get product from DB only
  const dbProduct = await CatalogProduct.findOne({
    id: productId,
    archived: { $ne: true },
  }).lean();

  const dbVariant = dbProduct?.variants?.find((v: any) => v.id === variantId);

  return { product: dbProduct, variant: dbVariant };
}

export async function checkItemsInStock(items: InventoryCheckItem[]): Promise<{
  ok: boolean;
  issues: InventoryIssue[];
}> {
  const issues: InventoryIssue[] = [];

  for (const item of items) {
    const requested = Math.max(1, Math.floor(item.quantity || 1));

    const invVariant = await Inventory.findOne({
      productId: item.productId,
      variantId: item.variantId,
    }).lean();

    const invProduct =
      invVariant ||
      (await Inventory.findOne({ productId: item.productId, variantId: null }).lean());

    const inv = invVariant || invProduct;

    const { product, variant } = await getProductInfo(item.productId, item.variantId);

    if (!product) {
      issues.push({
        productId: item.productId,
        variantId: item.variantId,
        requested,
        available: 0,
        reason: 'NOT_AVAILABLE',
      });
      continue;
    }

    const isAvailable = inv?.isAvailable ?? variant?.isAvailable ?? product?.isAvailable ?? true;

    const stock = inv?.stock ?? variant?.stock ?? (product as any)?.stock;

    const hasEnoughStock = stock === undefined ? true : stock >= requested;

    if (!isAvailable || !hasEnoughStock) {
      issues.push({
        productId: item.productId,
        variantId: item.variantId,
        requested,
        available: stock,
        reason: !isAvailable ? 'NOT_AVAILABLE' : 'INSUFFICIENT_STOCK',
        title: (product as any)?.title,
        variantLabel: variant?.label,
      });
    }
  }

  return { ok: issues.length === 0, issues };
}

export async function applyInventoryToCatalogProducts(params?: { includeArchived?: boolean }) {
  const includeArchived = params?.includeArchived ?? false;

  const [inventory, catalogDocs] = await Promise.all([
    Inventory.find({}).lean(),
    CatalogProduct.find(includeArchived ? {} : { archived: { $ne: true } }).lean(),
  ]);

  // Convert all DB docs to Product format
  const base = catalogDocs.map((doc: any) => {
    const { createdAt, updatedAt, ...rest } = doc;
    delete rest._id;
    delete rest.__v;
    delete rest.archived;

    const newBadge = rest.isNewProduct ?? rest.isNew;
    delete rest.isNewProduct;
    delete rest.isNew;

    return {
      ...rest,
      id: String(doc.id),
      ...(newBadge !== undefined ? { isNew: newBadge } : {}),
      createdAt: createdAt ? new Date(createdAt).toISOString() : undefined,
      updatedAt: updatedAt ? new Date(updatedAt).toISOString() : undefined,
    };
  });

  const byKey = new Map<string, { stock: number; isAvailable: boolean }>();
  for (const row of inventory) {
    const key = `${row.productId}::${row.variantId ?? ''}`;
    byKey.set(key, { stock: row.stock, isAvailable: row.isAvailable });
  }

  return base.map((p: any) => {
    const productKey = `${p.id}::`;
    const productInv = byKey.get(productKey);

    return {
      ...p,
      stock: productInv?.stock ?? p.stock,
      isAvailable: productInv?.isAvailable ?? p.isAvailable,
      variants: (p.variants || []).map((v: any) => {
        const variantKey = `${p.id}::${v.id}`;
        const variantInv = byKey.get(variantKey);
        return {
          ...v,
          stock: variantInv?.stock ?? v.stock,
          isAvailable: variantInv?.isAvailable ?? v.isAvailable,
        };
      }),
    };
  });
}

export async function decrementInventoryForOrderProducts(
  products: Array<{ productId: string; variantId: string; quantity: number }>,
): Promise<void> {
  for (const p of products) {
    const qty = Math.max(1, Math.floor(p.quantity || 1));

    // Try Inventory collection first (variant-level)
    const variantResult = await Inventory.updateOne(
      {
        productId: String(p.productId),
        variantId: String(p.variantId),
        isAvailable: { $ne: false },
        stock: { $gte: qty },
      },
      { $inc: { stock: -qty } },
    );

    if (variantResult.modifiedCount > 0) continue;

    // Fallback to Inventory product-level stock
    const productResult = await Inventory.updateOne(
      {
        productId: String(p.productId),
        variantId: null,
        isAvailable: { $ne: false },
        stock: { $gte: qty },
      },
      { $inc: { stock: -qty } },
    );

    if (productResult.modifiedCount > 0) continue;

    // Try CatalogProduct variant stock
    const catalogVariantResult = await CatalogProduct.updateOne(
      {
        id: String(p.productId),
        'variants.id': String(p.variantId),
        'variants.stock': { $gte: qty },
        archived: { $ne: true },
      },
      { $inc: { 'variants.$.stock': -qty } },
    );

    if (catalogVariantResult.modifiedCount > 0) continue;

    // Fallback to CatalogProduct product-level stock
    await CatalogProduct.updateOne(
      {
        id: String(p.productId),
        stock: { $gte: qty },
        archived: { $ne: true },
      },
      { $inc: { stock: -qty } },
    );
  }
}
