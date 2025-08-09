import { useEffect } from 'react';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  useEffect(() => {
    if (typeof (globalThis as any).EventManager !== 'undefined') {
      (globalThis as any).EventManager.frameworkReady?.();
    }
  });
}
