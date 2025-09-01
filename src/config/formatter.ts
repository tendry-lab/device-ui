// Format an arbitrary data into the key-value config representation.
export interface Formatter {
  format(data: Uint8Array): {
    data: Record<string, any> | null;
    error: Error | null;
  };
}
