import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/db/mongo';
import Product from '@/lib/db/models/Product';
import { log } from '@/lib/utils/logger';
import { adminAuth } from '@/lib/utils/adminAuth';

const handler = async (req: NextRequest, context: any) => {
  const { id } = context.params;
  await connectToDB();
  log('server', 'Connected to DB');

  if (req.method === 'PUT') {
    const data = await req.json();
    const product = await Product.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true },
    );
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    log('success', `Product updated: ${product._id}`);
    return NextResponse.json(product);
  }

  if (req.method === 'DELETE') {
    const product = await Product.findByIdAndDelete(id);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    log('success', `Product deleted: ${product._id}`);
    return NextResponse.json({ message: 'Deleted' });
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
};

export const PUT = adminAuth(handler);
export const DELETE = adminAuth(handler);
