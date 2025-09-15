// Fetcher fetches the data from the arbitrary source.
export interface Fetcher {
  fetch(): Promise<{ data: Uint8Array | null; error: Error | null }>;
}
