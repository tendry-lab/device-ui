export interface Runner {
  // Run executes a single operational loop.
  run(): Error | null;
}
