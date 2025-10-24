/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ConnectionHandler {
  // Connection with the device has been established.
  handleConnected(): void;

  // There is no connection to the device.
  handleDisconnected(): void;
}
