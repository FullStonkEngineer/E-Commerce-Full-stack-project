let refreshPromise = null;

export const runSingleRefresh = async (refreshFn) => {
  if (!refreshPromise) {
    refreshPromise = refreshFn().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};
