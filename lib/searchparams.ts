// Simple search params cache for type-safe access
export const searchParamsCache = {
  parse: (searchParams: Record<string, string | string[] | undefined>) => {
    // This is a placeholder implementation
    // In a real app, you might want to validate and cache search params
    return searchParams;
  },
};

// Serialize search params for cache keys
export const serialize = (params: Record<string, any>) => {
  return JSON.stringify(params);
};
