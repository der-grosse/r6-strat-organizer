/**
 * Creates a deep copy of an object.
 */
export function deepCopy<T extends any>(obj: T): T {
  if (typeof obj !== "object") return obj;
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map((ele) => deepCopy(ele)) as T;
  if (obj instanceof Date) return new Date(obj) as T;
  return Object.fromEntries(deepCopy(Object.entries(obj as Object))) as T;
}

export function deepEqual(a: any, b: any): boolean {
  if (a === b) {
    return true;
  }

  if (typeof a !== typeof b) {
    return false;
  }

  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) {
    return false;
  }

  if (a instanceof Date !== b instanceof Date) {
    return false;
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (!keysB.includes(key)) {
      return false;
    }

    const valueA = a[key];
    const valueB = b[key];

    if (!deepEqual(valueA, valueB)) {
      return false;
    }
  }

  return true;
}

export function filterNull<T>(arr: (T | null | undefined)[]): T[] {
  return arr.filter((item): item is T => Boolean(item));
}
