/**
 * Flush Promises - F5 Anti-Leak Tests
 * Wait for all pending promises to resolve
 */

export async function flushPromises(): Promise<void> {
  await new Promise((resolve) => setImmediate(resolve));
}
