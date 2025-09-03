export class LimitQueue<T> {
  // Initialize.
  //
  // @params
  //  - @p maxSize - maximum number of elements in the queue.
  constructor(maxSize: number) {
    if (maxSize <= 0) {
      throw new Error("queue size should be >0");
    }

    this.maxSize = maxSize;
  }

  // Add element to the queue.
  //
  // @return
  //  Error if queue is full.
  add(item: T): Error | null {
    if (this.items.length >= this.maxSize) {
      return new Error("queue is full");
    }

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
  private maxSize: number;
}
