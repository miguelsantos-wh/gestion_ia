/**
 * Normaliza el fragmento (#...) a path sin query, con slash inicial.
 * Tolera #eval-360 (sin /), hashbang #!/ruta, espacios.
 */
export function getPathFromLocationHash(hash: string): string {
  let h = (hash ?? '').replace(/^#/, '').trim();
  if (h.startsWith('!')) {
    h = h.slice(1).trim();
  }
  if (h.length > 0 && !h.startsWith('/')) {
    h = `/${h}`;
  }
  const pathOnly = h.split('?')[0] || '/';
  return pathOnly.replace(/\/+$/, '') || '/';
}

export function isEval360Hash(hash: string): boolean {
  const p = getPathFromLocationHash(hash);
  return p === '/eval-360' || p.startsWith('/eval-360/');
}

export function isPercepcionHash(hash: string): boolean {
  const p = getPathFromLocationHash(hash);
  return (
    p === '/eval-percepcion' ||
    p.startsWith('/eval-percepcion/') ||
    p === '/eval-perception' ||
    p.startsWith('/eval-perception/')
  );
}

export function isAutoPercepcionHash(hash: string): boolean {
  const p = getPathFromLocationHash(hash);
  return p === '/eval-autopercepcion' || p.startsWith('/eval-autopercepcion/');
}

/** Hash efectivo: el del padre o, si viene vacío, el de window (por si el estado de React va detrás). */
export function effectiveLocationHash(routeHashFromParent: string): string {
  if (typeof window === 'undefined') {
    return routeHashFromParent ?? '';
  }
  const fromWindow = window.location.hash || '';
  const parent = routeHashFromParent ?? '';
  if (!parent.trim() && fromWindow) {
    return fromWindow;
  }
  return parent;
}
