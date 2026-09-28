import {
  BaseQueryApi,
  FetchArgs,
  createApi,
  fetchBaseQuery,
  retry,
} from "@reduxjs/toolkit/query/react";
import Constants from "../utils/Constants";
import User from "../data/user/user";
import { logOut, setCredentials } from "../core/authReducer";

type ApiEnvelope<T> = { data: T };

interface TokenPayload {
  exp?: number;
  sessionType?: "primary" | "fast";
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_SERVICE,
  credentials: "same-origin",
  prepareHeaders: (headers) => {
    const user = getStoredUser();
    if (user?.token) {
      headers.set("Authorization", `Bearer ${user.token}`);
    }
    return headers;
  },
});

const publicEndpoints = [
  "/auth/login",
  "/auth/send-fastpassword-by-phone",
  "/users/send-code",
  "/users/verify-code",
  "/users/reset-password",
];

let refreshPromise: Promise<boolean> | null = null;

function getStoredUser(): User | undefined {
  const serializedUser = sessionStorage.getItem(Constants.SESSION_KEYS.user);
  if (!serializedUser) return undefined;

  try {
    return JSON.parse(serializedUser) as User;
  } catch {
    sessionStorage.removeItem(Constants.SESSION_KEYS.user);
    return undefined;
  }
}

function decodeToken(token: string): TokenPayload | undefined {
  try {
    const encodedPayload = token.split(".")[1];
    if (!encodedPayload) return undefined;
    const normalizedPayload = encodedPayload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(encodedPayload.length / 4) * 4, "=");
    return JSON.parse(atob(normalizedPayload)) as TokenPayload;
  } catch {
    return undefined;
  }
}

function shouldRefreshToken(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload?.exp || payload.sessionType === "fast") return false;

  const expiresInMs = payload.exp * 1000 - Date.now();
  return expiresInMs > 0 && expiresInMs <= 5 * 60 * 1000;
}

function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  return Boolean(payload?.exp && payload.exp * 1000 <= Date.now());
}

function getRequestUrl(args: string | FetchArgs): string {
  return typeof args === "string" ? args : args.url;
}

function isPublicEndpoint(args: string | FetchArgs): boolean {
  const url = getRequestUrl(args);
  return publicEndpoints.some((endpoint) => url.startsWith(endpoint));
}

function clearSession(api: BaseQueryApi) {
  sessionStorage.removeItem(Constants.SESSION_KEYS.user);
  sessionStorage.removeItem(Constants.SESSION_KEYS.primaryUser);
  localStorage.removeItem("session_locked");
  localStorage.removeItem("last_user_info");
  api.dispatch(logOut(null));
}

function restorePrimarySession(api: BaseQueryApi): boolean {
  const serializedPrimaryUser = sessionStorage.getItem(
    Constants.SESSION_KEYS.primaryUser,
  );
  if (!serializedPrimaryUser) return false;

  try {
    const primaryUser = JSON.parse(serializedPrimaryUser) as User;
    if (!primaryUser.token || isTokenExpired(primaryUser.token)) {
      return false;
    }

    sessionStorage.setItem(
      Constants.SESSION_KEYS.user,
      JSON.stringify(primaryUser),
    );
    localStorage.setItem("session_locked", "true");
    api.dispatch(setCredentials(primaryUser));
    return true;
  } catch {
    return false;
  }
}

async function refreshSession(api: BaseQueryApi, extraOptions: object) {
  const currentUser = getStoredUser();
  if (!currentUser?.token) return false;

  const result = await rawBaseQuery(
    {
      url: "/auth/refresh-token",
      method: "POST",
      body: { token: currentUser.token },
    },
    api,
    extraOptions,
  );

  if (result.data) {
    const refreshedUser = (result.data as ApiEnvelope<User>).data;
    sessionStorage.setItem(
      Constants.SESSION_KEYS.user,
      JSON.stringify(refreshedUser),
    );
    const serializedPrimaryUser = sessionStorage.getItem(
      Constants.SESSION_KEYS.primaryUser,
    );
    if (serializedPrimaryUser) {
      try {
        const primaryUser = JSON.parse(serializedPrimaryUser) as User;
        if (primaryUser.token === currentUser.token) {
          sessionStorage.setItem(
            Constants.SESSION_KEYS.primaryUser,
            JSON.stringify(refreshedUser),
          );
        }
      } catch {
        sessionStorage.removeItem(Constants.SESSION_KEYS.primaryUser);
      }
    }
    api.dispatch(setCredentials(refreshedUser));
    return true;
  }

  if (result.error?.status === 401 || result.error?.status === 403) {
    clearSession(api);
  }
  return false;
}

const baseQueryWithSession = async (
  args: string | FetchArgs,
  api: BaseQueryApi,
  extraOptions: object,
) => {
  const user = getStoredUser();
  const isRefreshRequest = getRequestUrl(args).startsWith(
    "/auth/refresh-token",
  );

  if (!isRefreshRequest && user?.token && shouldRefreshToken(user.token)) {
    if (!refreshPromise) {
      refreshPromise = refreshSession(api, extraOptions).finally(() => {
        refreshPromise = null;
      });
    }
    await refreshPromise;
  }

  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401 && !isPublicEndpoint(args)) {
    const currentToken = getStoredUser()?.token;
    const currentPayload = currentToken
      ? decodeToken(currentToken)
      : undefined;
    const isFastLoginAttempt = getRequestUrl(args).startsWith(
      "/auth/login-fast",
    );
    const canRetryFastLogin = Boolean(
      isFastLoginAttempt && currentToken && !isTokenExpired(currentToken),
    );

    if (currentPayload?.sessionType === "fast" && restorePrimarySession(api)) {
      if (window.location.pathname !== "/locked-session") {
        window.location.replace("/locked-session");
      }
    } else if (!canRetryFastLogin) {
      clearSession(api);
      if (window.location.pathname !== "/") {
        window.location.replace("/");
      }
    }
    retry.fail(result.error);
  }

  if (
    typeof result.error?.status === "number" &&
    result.error.status >= 400 &&
    result.error.status < 500
  ) {
    retry.fail(result.error);
  }

  return result;
};

const baseQueryWithRetry = retry(baseQueryWithSession, { maxRetries: 3 });

export const apiSlice = createApi({
  baseQuery: baseQueryWithRetry,
  tagTypes: ["User", "OplLevel", "AmDiscardReason"],
  endpoints: (_) => ({}),
  refetchOnFocus: false,
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: 60,
  keepUnusedDataFor: 300,
});
