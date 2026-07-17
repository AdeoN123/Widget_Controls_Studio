export function unionKeys(...collections: Array<Map<string, unknown> | Record<string, unknown>>): string[] {
  const keys = new Set<string>()
  for (const c of collections) {
    if (c instanceof Map) {
      for (const k of c.keys()) keys.add(k)
    } else {
      for (const k of Object.keys(c)) keys.add(k)
    }
  }
  return [...keys]
}
