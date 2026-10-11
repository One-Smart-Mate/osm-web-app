import { useLocation } from "react-router-dom";
import { useAppSelector } from "../../core/store";
import { selectSiteId } from "../../core/genericReducer";
import useCurrentUser from "./useCurrentUser";

/**
 * Resolves the active siteId from the most reliable source available, in order:
 *   1. the navigation state (location.state.siteId) — set when navigating from
 *      another in-app screen that already knew the site,
 *   2. the global site selector (Redux),
 *   3. the first site assigned to the logged-in user.
 *
 * Screens used to read location.state.siteId directly, which was empty when the
 * screen was opened straight from the menu or on a hard refresh, leaving the
 * screen blank or bouncing to Unauthorized. Using this hook keeps every screen
 * working regardless of how it was reached.
 *
 * Returns the siteId as a string (or "" when none can be resolved).
 */
const useSiteId = (): string => {
  const location = useLocation();
  const siteIdFromSelector = useAppSelector(selectSiteId);
  const { user } = useCurrentUser();

  const resolved =
    location.state?.siteId ||
    siteIdFromSelector ||
    user?.sites?.[0]?.id ||
    "";

  return resolved ? String(resolved) : "";
};

export default useSiteId;
