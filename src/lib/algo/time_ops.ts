/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

export class TimeOps {
  // Format duration from seconds to readable format.
  static formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const days = Math.floor(hours / 24);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days}d ${hours - days * 24}h`;
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }

    return `${secs}s`;
  }
}
