import { useEffect, useState } from 'react';

const ROUTE_KEY = 'wheelsense-last-route-path';

// Note: Navigation system in monitoring-dashboard also uses this localStorage mechanism
// for persisting navigation state (NAV_STATE_KEY = 'wheelsense-navigation-state')

export type PathRoute = '/' | '/login';

export function getCurrentPath(): PathRoute {
  const p = window.location.pathname as PathRoute;
  if (p === '/login') return '/login';
  return '/';
}

export function navigatePath(path: PathRoute) {
  if (window.location.pathname !== path) {
    window.history.pushState({}, '', path);
  }
  try { localStorage.setItem(ROUTE_KEY, path); } catch {}
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function usePathRoute(): [PathRoute, (p: PathRoute) => void] {
  const [route, setRoute] = useState<PathRoute>(() => {
    const saved = (localStorage.getItem(ROUTE_KEY) as PathRoute) || getCurrentPath();
    if (saved && saved !== window.location.pathname) {
      window.history.replaceState({}, '', saved);
    }
    return getCurrentPath();
  });

  useEffect(() => {
    const onPop = () => setRoute(getCurrentPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (p: PathRoute) => navigatePath(p);
  return [route, navigate];
}



