import { NextResponse } from 'next/server';

const MAPBOX_BASE = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

type ErrorBody = { error: { code: string; message: string } };

type MapboxFeature = {
  id: string;
  place_name: string;
  text: string;
  address?: string;
  center?: [number, number];
  context?: Array<{ id: string; text: string; short_code?: string } | undefined>;
  properties?: { postcode?: string };
};

type MapboxResponse = {
  features?: MapboxFeature[];
  message?: string;
};

function jsonError(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } } satisfies ErrorBody, { status });
}

function pickToken(): string {
  return (
    process.env.MAPBOX_ACCESS_TOKEN ||
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
    ''
  ).trim();
}

function parseLngLat(raw: string | null): [number, number] | null {
  if (!raw) return null;
  const parts = raw.split(',').map((p) => p.trim());
  if (parts.length !== 2) return null;
  const lng = Number(parts[0]);
  const lat = Number(parts[1]);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
  if (lng < -180 || lng > 180 || lat < -90 || lat > 90) return null;
  return [lng, lat];
}

function sanitizeTypes(raw: string | null): string {
  const allowed = new Set(['address', 'place', 'postcode', 'region', 'locality']);
  const parts = (raw || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .filter((p) => allowed.has(p));
  return parts.join(',') || 'address';
}

function sanitizeCountry(raw: string | null): string | null {
  if (!raw) return null;
  const cc = raw.trim().toLowerCase();
  if (!/^[a-z]{2}$/.test(cc)) return null;
  return cc;
}

function sanitizeLanguage(raw: string | null): string | null {
  if (!raw) return null;
  const lang = raw.trim().toLowerCase();
  // Mapbox expects BCP47-ish, keep it conservative.
  if (!/^[a-z]{2,3}(-[a-z0-9]{2,8})?$/.test(lang)) return null;
  return lang;
}

function sanitizeLimit(raw: string | null): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 6;
  return Math.min(10, Math.max(1, Math.floor(n)));
}

export async function GET(req: Request) {
  const token = pickToken();
  if (!token) {
    return jsonError(
      500,
      'MAPBOX_TOKEN_MISSING',
      'Mapbox token is not configured. Set MAPBOX_ACCESS_TOKEN (recommended) or NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN.',
    );
  }

  const { searchParams } = new URL(req.url);
  const reverse = searchParams.get('reverse') === '1';
  const types = sanitizeTypes(searchParams.get('types'));
  const country = sanitizeCountry(searchParams.get('country'));
  const language = sanitizeLanguage(searchParams.get('language'));
  const limit = sanitizeLimit(searchParams.get('limit'));
  const proximity = parseLngLat(searchParams.get('proximity'));

  let endpoint: string;

  if (reverse) {
    const center = parseLngLat(searchParams.get('center'));
    if (!center) return jsonError(400, 'BAD_REQUEST', 'Missing or invalid center (lng,lat).');
    endpoint = `${MAPBOX_BASE}/${center[0]},${center[1]}.json`;
  } else {
    const q = (searchParams.get('q') || '').trim();
    if (!q) return jsonError(400, 'BAD_REQUEST', 'Missing query param q.');
    endpoint = `${MAPBOX_BASE}/${encodeURIComponent(q)}.json`;
  }

  const url = new URL(endpoint);
  url.searchParams.set('access_token', token);
  url.searchParams.set('types', types);
  url.searchParams.set('limit', String(limit));
  if (!reverse) url.searchParams.set('autocomplete', 'true');
  if (country) url.searchParams.set('country', country);
  if (language) url.searchParams.set('language', language);
  if (proximity) url.searchParams.set('proximity', `${proximity[0]},${proximity[1]}`);

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      // Avoid caching across users; Mapbox already does its own edge caching.
      cache: 'no-store',
    });
  } catch {
    return jsonError(502, 'UPSTREAM_UNREACHABLE', 'Failed to reach Mapbox Geocoding API.');
  }

  let data: MapboxResponse | null = null;
  try {
    data = (await res.json()) as MapboxResponse;
  } catch {
    // ignore
  }

  if (!res.ok) {
    const upstreamMsg = data?.message ? ` (${data.message})` : '';
    if (res.status === 401 || res.status === 403) {
      return jsonError(502, 'UPSTREAM_UNAUTHORIZED', `Mapbox rejected the token${upstreamMsg}`);
    }
    if (res.status === 429) {
      return jsonError(429, 'RATE_LIMITED', `Rate limited by Mapbox${upstreamMsg}`);
    }
    return jsonError(502, 'UPSTREAM_ERROR', `Mapbox error: HTTP ${res.status}${upstreamMsg}`);
  }

  return NextResponse.json(
    {
      features: (data?.features || []).filter(Boolean),
    },
    {
      status: 200,
      headers: {
        'cache-control': 'no-store',
      },
    },
  );
}
