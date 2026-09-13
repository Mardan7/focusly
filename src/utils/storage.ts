export const safeStorage = {
  getItem(name: string): string | null {
    try {
      return localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem(name: string, value: string): void {
    try {
      localStorage.setItem(name, value)
    } catch {
      /* quota or private mode */
    }
  },
  removeItem(name: string): void {
    try {
      localStorage.removeItem(name)
    } catch {
      /* ignore */
    }
  },
}

export function parseJson<T>(value: string | null): T | null {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}
