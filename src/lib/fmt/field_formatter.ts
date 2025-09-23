import { Formatter } from "@device-ui/lib/fmt/formatter";

// Format a single key-value pair.
export class FieldFormatter implements Formatter {
  // Initialize.
  constructor(private readonly key: string) {}

  format(data: Uint8Array): {
    data: Record<string, any> | null;
    error: Error | null;
  } {
    let ret: Record<string, any> | null = null;
    let err: Error | null = null;

    try {
      const text = new TextDecoder().decode(data);
      ret = { [this.key]: text };
    } catch (error) {
      err = error instanceof Error ? error : new Error(String(error));
    }

    return { data: ret, error: err };
  }
}
