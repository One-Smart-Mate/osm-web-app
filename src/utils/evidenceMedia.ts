import { useEffect, useState } from "react";
import Constants from "./Constants";
import { Evidences } from "../data/card/card";
import { isAudioURL, isImageURL, isVideoURL } from "./Extensions";

/**
 * Evidence media helpers.
 *
 * Card evidences produced by the mobile app are stored in Cloudflare R2 and are
 * NOT publicly reachable. The backend persists a service route as `evidenceName`
 * (e.g. `/card/evidence/:siteId/content/:token`) and streams the binary from an
 * authenticated endpoint guarded by JWT + site access. A plain `<img src>` can
 * neither resolve that relative route against the API host nor attach the Bearer
 * token, so evidences must be fetched authenticated and shown via a blob URL.
 *
 * Older/legacy evidences may still carry an absolute `http(s)` URL; those are
 * used as-is.
 */

type EvidenceMediaKind = "image" | "video" | "audio" | "unknown";

/**
 * Resolve the media kind from the authoritative `evidenceType` code
 * (IM* = image, VI* = video, AU* = audio). Falls back to the URL extension for
 * legacy rows where `evidenceType` is missing.
 */
export const getEvidenceKind = (evidence: Evidences): EvidenceMediaKind => {
  const type = (evidence.evidenceType || "").toUpperCase();
  if (type.startsWith("IM")) return "image";
  if (type.startsWith("VI")) return "video";
  if (type.startsWith("AU")) return "audio";

  // Legacy fallback: classify by the URL/name extension.
  const name = evidence.evidenceName || "";
  if (isImageURL(name)) return "image";
  if (isVideoURL(name)) return "video";
  if (isAudioURL(name)) return "audio";
  return "unknown";
};

export const isImageEvidence = (evidence: Evidences): boolean =>
  getEvidenceKind(evidence) === "image";

export const isVideoEvidence = (evidence: Evidences): boolean =>
  getEvidenceKind(evidence) === "video";

export const isAudioEvidence = (evidence: Evidences): boolean =>
  getEvidenceKind(evidence) === "audio";

/** True when the stored reference is already an absolute, directly-usable URL. */
export const isAbsoluteEvidenceUrl = (evidenceName: string): boolean =>
  /^(https?:|blob:|data:)/i.test(evidenceName || "");

const getStoredToken = (): string | undefined => {
  const serializedUser = sessionStorage.getItem(Constants.SESSION_KEYS.user);
  if (!serializedUser) return undefined;
  try {
    return JSON.parse(serializedUser)?.token as string | undefined;
  } catch {
    return undefined;
  }
};

/**
 * Build the absolute URL for an evidence reference. Absolute URLs are returned
 * untouched; a service route is prefixed with the API base so it hits the
 * backend instead of the frontend origin.
 */
export const resolveEvidenceUrl = (evidenceName: string): string => {
  if (isAbsoluteEvidenceUrl(evidenceName)) return evidenceName;
  const base = (import.meta.env.VITE_API_SERVICE || "").replace(/\/+$/, "");
  const path = evidenceName.startsWith("/") ? evidenceName : `/${evidenceName}`;
  return `${base}${path}`;
};

/**
 * Fetch an evidence and expose it as an object URL usable by <img>/<video>/<audio>.
 *
 * - Absolute URLs are returned directly (no fetch, no blob).
 * - Service routes are fetched with the Bearer token and converted to a blob URL,
 *   which is revoked on unmount / when the source changes.
 */
export const useAuthenticatedMedia = (
  evidenceName: string
): { url?: string; loading: boolean; error: boolean } => {
  const [url, setUrl] = useState<string | undefined>(
    isAbsoluteEvidenceUrl(evidenceName) ? evidenceName : undefined
  );
  const [loading, setLoading] = useState<boolean>(
    !isAbsoluteEvidenceUrl(evidenceName)
  );
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!evidenceName) {
      setError(true);
      setLoading(false);
      return;
    }

    // Already-usable absolute URL: nothing to fetch.
    if (isAbsoluteEvidenceUrl(evidenceName)) {
      setUrl(evidenceName);
      setLoading(false);
      setError(false);
      return;
    }

    let objectUrl: string | undefined;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const token = getStoredToken();
        const response = await fetch(resolveEvidenceUrl(evidenceName), {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!response.ok) throw new Error(`Evidence request failed: ${response.status}`);
        const blob = await response.blob();
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [evidenceName]);

  return { url, loading, error };
};
