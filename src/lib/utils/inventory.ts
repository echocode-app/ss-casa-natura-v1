import Inventory from '@/lib/db/models/Inventory';
import { PRODUCTS_MOCK } from '@/config/products/products.mock';
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

function getMockProductInfo(productId: string, variantId: string) {
  const product = PRODUCTS_MOCK.find((p) => p.id === productId);
  const variant = product?.variants?.find((v) => v.id === variantId);
  return { product, variant };
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

    const { product, variant } = getMockProductInfo(item.productId, item.variantId);

    const isAvailable = inv?.isAvailable ?? variant?.isAvailable ?? product?.isAvailable ?? true;

    const stock = inv?.stock ?? variant?.stock ?? product?.stock;

    const hasEnoughStock = stock === undefined ? true : stock >= requested;

    if (!isAvailable || !hasEnoughStock) {
      issues.push({
        productId: item.productId,
        variantId: item.variantId,
        requested,
        available: stock,
        reason: !isAvailable ? 'NOT_AVAILABLE' : 'INSUFFICIENT_STOCK',
        title: product?.title,
        variantLabel: variant?.label,
      });
    }
  }

  return { ok: issues.length === 0, issues };
}

export async function applyInventoryToMockProducts() {
  return applyInventoryToCatalogProducts();
}

export async function applyInventoryToCatalogProducts(params?: { includeArchived?: boolean }) {
  const includeArchived = params?.includeArchived ?? false;

  const [inventory, catalogDocs] = await Promise.all([
    Inventory.find({}).lean(),
    CatalogProduct.find(includeArchived ? {} : { archived: { $ne: true } }).lean(),
  ]);

  const dbById = new Map<string, any>();
  for (const doc of catalogDocs) {
    dbById.set(String(doc.id), doc);
  }

  // Start with mock products and allow DB docs with the same id to override them.
  const base = PRODUCTS_MOCK.map((p) => {
    const override = dbById.get(String(p.id));
    if (!override) return p;
    // Remove mongoose internals.
    const { createdAt, updatedAt, ...rest } = override;
    delete (rest as any)._id;
    delete (rest as any).__v;
    delete (rest as any).archived;

    const newBadge = (rest as any).isNewProduct ?? (rest as any).isNew;
    delete (rest as any).isNewProduct;
    delete (rest as any).isNew;

    return {
      ...p,
      ...rest,
      id: p.id,
      ...(newBadge !== undefined ? { isNew: newBadge } : {}),
      createdAt: createdAt ? new Date(createdAt).toISOString() : p.createdAt,
      updatedAt: updatedAt ? new Date(updatedAt).toISOString() : p.updatedAt,
    };
  });

  // Add DB-only products (not present in mock).
  const mockIds = new Set(PRODUCTS_MOCK.map((p) => String(p.id)));
  for (const doc of catalogDocs) {
    if (mockIds.has(String(doc.id))) continue;
    const { createdAt, updatedAt, ...rest } = doc as any;
    delete (rest as any)._id;
    delete (rest as any).__v;
    delete (rest as any).archived;

    const newBadge = (rest as any).isNewProduct ?? (rest as any).isNew;
    delete (rest as any).isNewProduct;
    delete (rest as any).isNew;

    base.push({
      ...rest,
      id: String(doc.id),
      ...(newBadge !== undefined ? { isNew: newBadge } : {}),
      createdAt: createdAt ? new Date(createdAt).toISOString() : undefined,
      updatedAt: updatedAt ? new Date(updatedAt).toISOString() : undefined,
    });
  }

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

    // Prefer variant-level stock
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

    // Fallback to product-level stock
    await Inventory.updateOne(
      {
        productId: String(p.productId),
        variantId: null,
        isAvailable: { $ne: false },
        stock: { $gte: qty },
      },
      { $inc: { stock: -qty } },
    );
  }
}
