/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

import { Updater } from "@device-ui/lib/device/updater";

export enum UpdaterId {
  // Updater type is unknown.
  None,

  // Firmware updater.
  Firmware,

  // UI updater.
  UI,
}

// Selected firmware updater.
export type UpdaterSelectorResult = {
  id: UpdaterId;
  updater: Updater | null;
  error: Error | null;
};

// Firmware updater selector.
export interface UpdaterSelector {
  // Select the firmware updater based on the given file name.
  select(filename: string): UpdaterSelectorResult;
}
