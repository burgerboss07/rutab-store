'use client';

import { useEffect } from 'react';

export default function FaviconUpdater() {
  useEffect(() => {
    const bust = `?v=${Date.now()}`;
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (link) link.href = '/api/favicon' + bust;
    const apple = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
    if (apple) apple.href = '/api/favicon' + bust;
  }, []);

  return null;
}
