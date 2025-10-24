/*
 * SPDX-FileCopyrightText: 2025 Tendry Lab
 * SPDX-License-Identifier: Apache-2.0
 */

// Queue implementation based on JavaScript array.
export class ArrayQueue<T> {
  // Add element to the queue.
  add(item: T): Error | null {
    this.items.push(item);

    return null;
  }

  // Remove element from the queue by reference.
  //
  // @return
  //  Error if element was not found.
  remove(item: T): Error | null {
    const index = this.items.indexOf(item);
    if (index === -1) {
      return new Error("not found");
    }

    this.items.splice(index, 1);

    return null;
  }

  // Return number of elements in the queue.
  len(): number {
    return this.items.length;
  }

  // Iterate over all elements in the queue.
  forEach(fn: (item: T) => void): void {
    this.items.forEach(fn);
  }

  private items: T[] = [];
}
