export type WithMS<T> = [result: T, ms?: number];

export async function withMS<T extends () => Promise<any>>(fn: T): Promise<WithMS<Awaited<ReturnType<T>>>> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  const ms = Math.round(end - start);

  return [result, ms];
}
