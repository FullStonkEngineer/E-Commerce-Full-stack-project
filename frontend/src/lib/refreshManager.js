/**
 * Ensures that only one token refresh request runs at a time.
 *
 * Without this guard, multiple simultaneous 401 responses
 * could trigger multiple refresh requests, causing race conditions.
 *
 * Instead, all requests await the same refresh promise.
 */

let refreshPromise = null;

export const runSingleRefresh = async (refreshFn) => {
  if (!refreshPromise) {
    refreshPromise = refreshFn().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};
