export const REMOTE_BASE = 'https://wheelsense-dashboard-default-rtdb.asia-southeast1.firebasedatabase.app';

export async function remotePut<T>(path: string, data: T): Promise<boolean> {
  try {
    const res = await fetch(`${REMOTE_BASE}${path}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function remoteGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${REMOTE_BASE}${path}.json`);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function debounce<F extends (...args: any[]) => void>(fn: F, delayMs: number) {
  let t: number | undefined;
  return (...args: Parameters<F>) => {
    if (t) window.clearTimeout(t);
    // @ts-ignore
    t = window.setTimeout(() => fn(...args), delayMs);
  };
}













