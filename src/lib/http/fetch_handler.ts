/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

// Handler to notify when data is fetched.
export interface FetchHandler {
  handleFetched(data: Uint8Array): void;
}
