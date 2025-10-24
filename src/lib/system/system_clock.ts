/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

// SystemClock represents a UNIX time of the resource.
export interface SystemClock {
  // SetTimestamp sets the UNIX time for the resource.
  //
  // @params
  //  - @p timestamp - UNIX timestamp, in seconds.
  //
  // Return null if operations succeed.
  setTimestamp(timestamp: number): Error | null;

  // GetTimestamp returns the UNIX time for the resource.
  //
  // Notes:
  //  - -1 should be returned on error.
  //
  // Return UNIX timestamp, in seconds, or an error.
  getTimestamp(): { timestamp: number; error: Error | null };
}
