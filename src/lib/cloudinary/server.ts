import { v2 as cloudinary } from 'cloudinary';

let isConfigured = false;

function configureCloudinary() {
  if (isConfigured) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Cloudinary env vars missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.',
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  isConfigured = true;
}

export type CloudinaryUploadResult = {
  publicId: string;
  secureUrl: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
};

export async function uploadImageBuffer({
  buffer,
  filename,
  folder,
}: {
  buffer: Buffer;
  filename?: string;
  folder?: string;
}): Promise<CloudinaryUploadResult> {
  configureCloudinary();

  const result = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
        filename_override: filename,
      },
      (error, res) => {
        if (error) return reject(error);
        return resolve(res);
      },
    );

    stream.end(buffer);
  });

  return {
    publicId: result.public_id,
    secureUrl: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

export async function destroyImage(publicId: string): Promise<any> {
  configureCloudinary();

  return cloudinary.uploader.destroy(publicId, {
    invalidate: true,
    resource_type: 'image',
  });
}
