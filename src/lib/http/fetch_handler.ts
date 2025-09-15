// Handler to notify when data is fetched.
export interface FetchHandler {
  handleFetched(data: Uint8Array): void;
}
