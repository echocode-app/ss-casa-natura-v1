import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { destroyImage, uploadImageBuffer } from '@/lib/cloudinary/server';

export const runtime = 'nodejs';

const MAX_BYTES = 10 * 1024 * 1024; // 10MB

function sanitizeFolder(value: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  // Allow only safe folder chars
  const safe = trimmed.replace(/[^a-zA-Z0-9/_-]+/g, '-');
  return safe;
}

export const POST = handleApi(async (req: Request) => {
  const authError = await requireAdmin();
  if (authError) return authError;

  const contentType = req.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('multipart/form-data')) {
    return NextResponse.json(
      { success: false, error: 'Expected multipart/form-data' },
      { status: 415 },
    );
  }

  const form = await req.formData();
  const file = form.get('file');
  const folder = sanitizeFolder((form.get('folder') as string | null) ?? null);

  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: 'Missing file' }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { success: false, error: `File too large (max ${MAX_BYTES} bytes)` },
      { status: 413 },
    );
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ success: false, error: 'Only images are allowed' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploaded = await uploadImageBuffer({
    buffer,
    filename: file.name,
    folder,
  });

  return NextResponse.json({
    success: true,
    asset: {
      url: uploaded.secureUrl,
      publicId: uploaded.publicId,
      width: uploaded.width,
      height: uploaded.height,
      format: uploaded.format,
      bytes: uploaded.bytes,
    },
  });
});

export const DELETE = handleApi(async (req: Request) => {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await req.json().catch(() => null);
  const publicId = typeof body?.publicId === 'string' ? body.publicId.trim() : '';
  if (!publicId) {
    return NextResponse.json({ success: false, error: 'publicId is required' }, { status: 400 });
  }

  const result = await destroyImage(publicId);
  return NextResponse.json({ success: true, result });
});
