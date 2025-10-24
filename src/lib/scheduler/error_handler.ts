/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ErrorHandler {
  // Handle errors.
  handleError(error: Error): void;
}
