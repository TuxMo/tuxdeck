# @tuxmo/tuxdeck

Slide deck navigation logic for React (and beyond). Router-agnostic utilities for building presentation apps — keyboard navigation, touch swipe, jump-to-slide search, and multi-tab presenter sync.

## Install

```sh
pnpm add @tuxmo/tuxdeck
```

React bindings require React 18+ as a peer dependency:

```sh
pnpm add @tuxmo/tuxdeck react
```

## Quick start

Define your deck as an array of `SlideRef` objects, then wire up `PresentationShell`:

```tsx
import { PresentationShell, useSlideState } from '@tuxmo/tuxdeck/react';

const DECK = [
  { path: '/slides/intro', title: 'Introduction', section: 'Part 1' },
  { path: '/slides/problem', title: 'The Problem', section: 'Part 1' },
  { path: '/slides/solution', title: 'Our Solution', section: 'Part 2' },
  { path: '/slides/demo', title: 'Demo', section: 'Part 2' },
];

function App() {
  // Use your router's pathname + navigate here (React Router, Next.js, etc.)
  const pathname = window.location.pathname;
  const onNavigate = (path: string) => history.pushState(null, '', path);

  const state = useSlideState(DECK, pathname);

  return (
    <PresentationShell deck={DECK} pathname={pathname} onNavigate={onNavigate} enableSwipe>
      <div>
        {state.currentIndex + 1} / {state.total}
      </div>
      {/* render your slide content here */}
    </PresentationShell>
  );
}
```

`PresentationShell` handles keyboard navigation, swipe, and the jump-search dialog automatically.

## Keyboard shortcuts

| Key       | Action                  |
| --------- | ----------------------- |
| `→` / `←` | Next / previous slide   |
| `/`       | Open jump-search dialog |
| `f`       | Toggle fullscreen       |

## Packages

| Import                 | Contents                                         |
| ---------------------- | ------------------------------------------------ |
| `@tuxmo/tuxdeck`       | Framework-agnostic core (pure functions + types) |
| `@tuxmo/tuxdeck/react` | React components and hooks                       |

---

## Core API (`@tuxmo/tuxdeck`)

### Types

```ts
type SlideRef = {
  path: string; // URL path, e.g. "/slides/intro"
  title: string; // used for search and display
  notes?: string; // optional speaker notes
  section?: string; // optional section label for grouping
};

type SlideState = {
  currentIndex: number; // 0-based
  total: number;
  isFirst: boolean;
  isLast: boolean;
  current: SlideRef | null;
};

type SlideSearchResult = SlideRef & { number: number }; // 1-based slide number
```

### `getSlideState(deck, pathname)`

Derives the current slide state from the deck and the active pathname.

```ts
import { getSlideState } from '@tuxmo/tuxdeck';

const state = getSlideState(deck, '/slides/problem');
// { currentIndex: 1, total: 4, isFirst: false, isLast: false, current: { path: '/slides/problem', ... } }
```

### `searchSlides(deck, query)`

Searches the deck by slide number (e.g. `"3"`) or title substring. Returns all slides when query is empty.

```ts
import { searchSlides } from '@tuxmo/tuxdeck';

searchSlides(deck, ''); // all slides, each with a `number` field
searchSlides(deck, 'solution'); // slides whose title contains "solution"
searchSlides(deck, '2'); // slide number 2
```

### `createPresenterSync(channelName)`

Creates a [`BroadcastChannel`](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel)-based sync object for keeping multiple tabs in step. The presenter tab broadcasts navigation; audience tabs follow along.

```ts
import { createPresenterSync } from '@tuxmo/tuxdeck';

const sync = createPresenterSync('my-deck');

// Presenter: broadcast navigation
sync.broadcast('/slides/demo');

// Audience: subscribe to navigation events
const unsubscribe = sync.subscribe((path) => navigate(path));

// Cleanup
unsubscribe();
sync.close();
```

### `slideIndexForPath(deck, pathname)` / `slideNumberForPath(deck, pathname)`

```ts
slideIndexForPath(deck, '/slides/demo'); // 3  (0-based, falls back to 0)
slideNumberForPath(deck, '/slides/demo'); // 4  (1-based, returns null if not found)
```

### `nextIndex(current, direction, count)` / `clampIndex(index, count)`

```ts
nextIndex(0, 'next', 4); // 1
nextIndex(3, 'next', 4); // 3  (clamped at last)
nextIndex(0, 'prev', 4); // 0  (clamped at first)
clampIndex(10, 4); // 3
```

### `swipeDirection(deltaX, threshold)`

Returns `'next'`, `'prev'`, or `null`. Swipe left (`deltaX < 0`) → `'next'`.

```ts
swipeDirection(-80, 50); // 'next'
swipeDirection(30, 50); // null  (below threshold)
```

---

## React API (`@tuxmo/tuxdeck/react`)

### `<PresentationShell>`

Top-level wrapper. Registers keyboard navigation and (optionally) swipe, and renders the jump-search dialog when triggered.

```tsx
<PresentationShell
  deck={DECK}
  pathname={pathname}
  onNavigate={onNavigate}
  enableSwipe={false} // optional, default false
>
  {children}
</PresentationShell>
```

### `useSlideState(deck, pathname)`

Returns a memoized `SlideState`.

```tsx
const { currentIndex, total, isFirst, isLast, current } = useSlideState(deck, pathname);
```

### `useKeyboardNav(options)`

Registers arrow key navigation, `/` to open a dialog, and `f` for fullscreen. Used internally by `PresentationShell`; wire it up directly if you want more control.

```tsx
useKeyboardNav({
  deck,
  pathname,
  onNavigate,
  isDialogOpen,
  onOpenDialog,
});
```

### `useSwipeNav(options)`

Registers touch swipe navigation.

```tsx
useSwipeNav({
  deck,
  pathname,
  onNavigate,
  threshold: 50, // optional px threshold, default 50
});
```

### `usePresenterSync(options)`

Manages the BroadcastChannel lifecycle. The presenter calls `broadcast` on each navigation; audience tabs receive the path via `onNavigate`.

```tsx
// Presenter tab
const { broadcast } = usePresenterSync({
  channelName: 'my-deck',
  role: 'presenter',
  onNavigate: () => {}, // unused for presenter
});

// Call on each navigation:
broadcast(newPath);

// Audience tab
usePresenterSync({
  channelName: 'my-deck',
  role: 'audience',
  onNavigate, // called whenever presenter navigates
});
```

### `<JumpSearchDialog>`

A modal dialog for jumping to a slide by number or title. Opens on `/`, closed by `Escape` or backdrop click. Groups results by `section` when present. Used internally by `PresentationShell`.

```tsx
{
  isOpen && (
    <JumpSearchDialog deck={deck} onClose={() => setIsOpen(false)} onSelectPath={onNavigate} />
  );
}
```

---

## Framework integration

`onNavigate` and `pathname` are just strings and callbacks — plug in whatever router you use:

**React Router**

```tsx
import { useNavigate, useLocation } from 'react-router-dom';
const navigate = useNavigate();
const { pathname } = useLocation();
<PresentationShell deck={deck} pathname={pathname} onNavigate={navigate} />;
```

**Next.js (App Router)**

```tsx
import { useRouter, usePathname } from 'next/navigation';
const router = useRouter();
const pathname = usePathname();
<PresentationShell deck={deck} pathname={pathname} onNavigate={router.push} />;
```

## License

MIT
