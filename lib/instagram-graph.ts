// Instagram Graph API client — "Instagram API with Instagram Login".
//
// Used by scripts/instagram/sync.ts (a build-time/cron sync), NOT by the
// runtime: the Graph API's media_url values are SHORT-LIVED CDN links that
// expire in hours, so we fetch + download the media to /public at sync time
// and the site serves permanent local files. See docs/instagram-wall-product.md.
//
// No "server-only" guard here on purpose: this module runs inside a plain Node
// script, not a React Server Component.

// Versionless host: graph.instagram.com accepts unversioned paths, which avoids
// breakage when Meta deprecates a numbered API version.
const GRAPH_HOST = "https://graph.instagram.com";

export type IgMediaType = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";

export type IgChild = {
  id: string;
  media_type: IgMediaType;
  media_url?: string;
  thumbnail_url?: string;
};

export type IgMedia = {
  id: string;
  caption?: string;
  media_type: IgMediaType;
  /** Direct CDN url to the asset (image, or video file for VIDEO). Expires. */
  media_url?: string;
  /** Poster frame for VIDEO. Expires. */
  thumbnail_url?: string;
  permalink: string;
  /** ISO 8601, e.g. 2026-05-22T10:00:00+0000 */
  timestamp: string;
  children?: { data: IgChild[] };
};

type MediaResponse = {
  data: IgMedia[];
  paging?: { cursors?: { after?: string }; next?: string };
};

type GraphError = { error?: { message?: string; type?: string; code?: number } };

const MEDIA_FIELDS =
  "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp," +
  "children{id,media_type,media_url,thumbnail_url}";

/**
 * Fetch the most recent media for the authenticated Instagram user, following
 * pagination up to `limit` items. Throws loudly on any API error — we never
 * silently fall back to stale or fake data.
 */
export async function fetchUserMedia(
  userId: string,
  accessToken: string,
  limit = 24,
): Promise<IgMedia[]> {
  const out: IgMedia[] = [];
  let url =
    `${GRAPH_HOST}/${userId}/media` +
    `?fields=${encodeURIComponent(MEDIA_FIELDS)}` +
    `&limit=${Math.min(limit, 50)}` +
    `&access_token=${encodeURIComponent(accessToken)}`;

  while (url && out.length < limit) {
    const res = await fetch(url);
    const json = (await res.json()) as MediaResponse & GraphError;
    if (!res.ok || json.error) {
      const e = json.error;
      throw new Error(
        `Instagram Graph API error (${res.status}): ${e?.message ?? "unknown"}` +
          (e?.code ? ` [code ${e.code}]` : ""),
      );
    }
    out.push(...(json.data ?? []));
    url = json.paging?.next ?? "";
  }

  return out.slice(0, limit);
}

/**
 * Refresh a long-lived token (valid 60 days, refreshable once ≥24h old).
 * Returns the new token + seconds until expiry. Call from a cron before expiry.
 */
export async function refreshLongLivedToken(
  accessToken: string,
): Promise<{ token: string; expiresInSeconds: number }> {
  const url =
    `${GRAPH_HOST}/refresh_access_token` +
    `?grant_type=ig_refresh_token` +
    `&access_token=${encodeURIComponent(accessToken)}`;
  const res = await fetch(url);
  const json = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
  } & GraphError;
  if (!res.ok || json.error || !json.access_token) {
    throw new Error(
      `Token refresh failed (${res.status}): ${json.error?.message ?? "unknown"}`,
    );
  }
  return { token: json.access_token, expiresInSeconds: json.expires_in ?? 0 };
}

/**
 * Pick the still-image URL to download for a given media item:
 *   IMAGE          → media_url
 *   VIDEO / REEL   → thumbnail_url (poster frame)
 *   CAROUSEL_ALBUM → first child's image (media_url or its thumbnail)
 * Returns null when no usable image url is present (caller renders placeholder).
 */
export function pickImageUrl(media: IgMedia): string | null {
  if (media.media_type === "VIDEO") return media.thumbnail_url ?? null;
  if (media.media_type === "CAROUSEL_ALBUM") {
    const first = media.children?.data?.[0];
    if (!first) return media.media_url ?? null;
    if (first.media_type === "VIDEO") return first.thumbnail_url ?? null;
    return first.media_url ?? null;
  }
  return media.media_url ?? null;
}
