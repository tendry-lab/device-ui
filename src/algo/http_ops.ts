export class HTTPOps {
  // Add query parameters to @p baseURL from @p params.
  static addQueryParams(
    baseURL: string,
    params: Record<string, any>,
  ): { url: string | null; error: Error | null } {
    try {
      // baseURL is a relative URL, so we need to provide the base part.
      // See https://developer.mozilla.org/en-US/docs/Web/API/URL/URL#base.
      const url = new URL(baseURL, window.location.origin);

      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });

      return {
        url: url.toString(),
        error: null,
      };
    } catch (error) {
      return {
        url: null,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
}
