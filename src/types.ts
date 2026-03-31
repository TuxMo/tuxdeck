export type SlideRef = {
  path: string; // e.g. "/present/001-intro"
  title: string; // used for search display/matching
  notes?: string; // optional speaker notes (markdown or plain text)
  section?: string; // optional section/chapter label, e.g. "Chapter 1: Intro"
};

export type SlideSearchResult = SlideRef & { number: number };

export type SlideState = {
  currentIndex: number; // 0-based
  total: number;
  isFirst: boolean;
  isLast: boolean;
  current: SlideRef | null;
};
