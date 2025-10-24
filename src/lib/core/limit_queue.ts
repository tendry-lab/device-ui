/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

import { Queue } from "@device-ui/lib/core/queue";

// Limit maximum number of elements in the queue.
export class LimitQueue<T> implements Queue<T> {
  // Initialize.
  //
  // @params
  //  - @p queue to hold the actual data.
  //  - @p maxSize - maximum number of elements in the queue.
  constructor(queue: Queue<T>, maxSize: number) {
    if (maxSize <= 0) {
      throw new Error("queue size should be >0");
    }
    this.maxSize = maxSize;

    this.queue = queue;
  }

  // Add element to the queue.
  //
  // @return
  //  Error if queue is full.
  add(item: T): Error | null {
    if (this.queue.len() >= this.maxSize) {
      return new Error("queue is full");
    }

    return this.queue.add(item);
  }

  // Remove element from the queue by reference.
  //
  // @return
  //  Error if element was not found.
  remove(item: T): Error | null {
    return this.queue.remove(item);
  }

  // Return number of elements in the queue.
  len(): number {
    return this.queue.len();
  }

  // Iterate over all elements in the queue.
  forEach(fn: (item: T) => void): void {
    this.queue.forEach(fn);
  }

  private readonly maxSize: number;

  private queue: Queue<T>;
}
