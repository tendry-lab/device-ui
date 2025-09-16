import { SystemClock } from "@device-ui/lib/system/system_clock";

export class LocalSystemClock implements SystemClock {
  // Set the UNIX system time.
  setTimestamp(_: number): Error | null {
    return new Error("not supported");
  }

  // Return the UNIX system time.
  getTimestamp(): { timestamp: number; error: Error | null } {
    return {
      timestamp: Date.now() / 1000,
      error: null,
    };
  }
}
