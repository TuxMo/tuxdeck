import type { SlideRef, SlideSearchResult } from './types';

export function searchSlides(deck: readonly SlideRef[], queryRaw: string): SlideSearchResult[] {
  const query = queryRaw.trim();
  if (!query) {
    return deck.map((s, i) => ({ ...s, number: i + 1 }));
  }

  if (/^\d+$/.test(query)) {
    const n = Number(query);
    if (Number.isFinite(n) && n >= 1 && n <= deck.length) {
      const slide = deck[n - 1];
      return [{ ...slide, number: n }];
    }
    return [];
  }

  const q = query.toLowerCase();
  return deck
    .map((s, i) => ({ ...s, number: i + 1 }))
    .filter((s) => s.title.toLowerCase().includes(q));
}
