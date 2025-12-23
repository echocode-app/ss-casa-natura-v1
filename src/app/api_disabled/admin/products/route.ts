import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/db/mongo';
import Product, { IProduct } from '@/lib/db/models/Product';
import { log } from '@/lib/utils/logger';
import { adminAuth } from '@/lib/utils/adminAuth';

const handler = async (req: NextRequest, _context: any) => {
  await connectToDB();
  log('server', 'Connected to DB');

  if (req.method === 'GET') {
    const products = await Product.find().lean<IProduct[]>();
    log('success', 'Fetched all products');
    return NextResponse.json(products);
  }

  if (req.method === 'POST') {
    const data: Partial<IProduct> = await req.json();
    const product = new Product({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await product.save();

    log('success', `Product created: ${product._id}`);
    return NextResponse.json(product);
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
};

export const GET = adminAuth(handler);
export const POST = adminAuth(handler);
