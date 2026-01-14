import Inventory from '@/lib/db/models/Inventory';
import { PRODUCTS_MOCK } from '@/config/products/products.mock';

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
  const inventory = await Inventory.find({}).lean();

  const byKey = new Map<string, { stock: number; isAvailable: boolean }>();
  for (const row of inventory) {
    const key = `${row.productId}::${row.variantId ?? ''}`;
    byKey.set(key, { stock: row.stock, isAvailable: row.isAvailable });
  }

  return PRODUCTS_MOCK.map((p) => {
    const productKey = `${p.id}::`;
    const productInv = byKey.get(productKey);

    const mergedProduct = {
      ...p,
      stock: productInv?.stock ?? p.stock,
      isAvailable: productInv?.isAvailable ?? p.isAvailable,
      variants: (p.variants || []).map((v) => {
        const variantKey = `${p.id}::${v.id}`;
        const variantInv = byKey.get(variantKey);
        return {
          ...v,
          stock: variantInv?.stock ?? v.stock,
          isAvailable: variantInv?.isAvailable ?? v.isAvailable,
        };
      }),
    };

    return mergedProduct;
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
