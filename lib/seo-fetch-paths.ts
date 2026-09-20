export function isSameOriginPath(path: string, trustedOrigin: string): boolean {
  if (!path.startsWith("/") || path.startsWith("//")) return false;

  try {
    return new URL(path, trustedOrigin).origin === trustedOrigin;
  } catch {
    return false;
  }
}

export async function mapInBatches<T, R>(
  items: T[],
  batchSize: number,
  mapper: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];

  for (let start = 0; start < items.length; start += batchSize) {
    const batch = items.slice(start, start + batchSize);
    results.push(...(await Promise.all(batch.map(mapper))));
  }

  return results;
}
