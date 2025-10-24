/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Queue<T> {
  // Add element to the queue.
  add(item: T): Error | null;

  // Remove element from the queue by reference.
  //
  // @return
  //  Error if element was not found.
  remove(item: T): Error | null;

  // Return number of elements in the queue.
  len(): number;

  // Iterate over all elements in the queue.
  forEach(fn: (item: T) => void): void;
}
