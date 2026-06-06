---
name: presentational-components-with-hooks
description: Enforces a separation in React components where presentational components stay pure (props → JSX) and all state subscriptions, effects, callbacks, and derivations live in named single-purpose custom hooks. Use when writing or refactoring React/Next.js components, when a component starts mixing rendering with useState/useEffect/router/store calls, or when the user asks to separate logic from rendering.
---

# Presentational Components with Hooks

## The rule

- **Components are presentational**: pure `props → JSX`. No `useState`, no `useEffect`, no store subscriptions, no router calls, no inline event-handler logic beyond `onClick={handler}`.
- **All logic lives in hooks**: state subscriptions, effects, callbacks, derived values, and any imperative side effects go into named custom hooks (`useX`).
- **Unavoidable client-component leaves may make ONE hook call** at the top, then render pure JSX. Keep them tiny.

## Why

- Presentational components render with any props — trivial in Storybook, tests, or with synthetic data.
- Hooks are independently testable with `renderHook` from `@testing-library/react`.
- Each hook has one job → easy to name, easy to read, easy to swap implementations (e.g. swap Jotai for Zustand inside the hook without touching the component).
- Grepping for "where is this state read" or "where does this effect fire" lands in one named place.

## Folder layout

```
domains/<feature>/
├── components/   ← presentational (and tiny hook-carrier wrappers)
├── hooks/        ← all logic
└── state/        ← atoms / stores
```

## Workflow

1. **Identify side-effects** in the component: `useState`, `useEffect`, `useRouter`, store reads, derived computations, callbacks that touch state.
2. **For each cluster of related logic, extract a hook.** Name it for what it does (`useHotspotClick`, `useTransitionOverlay`), not for what it returns.
3. **Hook returns a flat object**: plain values for rendering, callbacks for events. No JSX, no refs to the component.
4. **Component calls the hook once at the top**, destructures, renders JSX. If the component ends up with zero hook calls, drop `'use client'` and it becomes a server component.

## Common shapes

**Wrapper carrier**: when several hooks need to fire on a screen but the renderer is pure, introduce a thin client wrapper.

```tsx
// FeatureClient.tsx — calls hooks, delegates rendering
'use client';
export function FeatureClient(props) {
  usePrefetchOnMount(props.targets);
  useResetSomeStateOnMount();
  return <FeatureView {...props} />; // ← pure presentational
}
```

**Single-hook leaf**: buttons that dispatch state call exactly one hook.

```tsx
'use client';
export function Hotspot({ hotspot, sceneId }) {
  const onClick = useHotspotClick(hotspot, sceneId);
  return <button onClick={onClick} className="..." />;
}
```

**State-machine renderer**: components that branch on a phase stay pure if the phase comes from a hook.

```tsx
'use client';
export function Overlay() {
  const { phase, videoUrl, onVideoEnded } = useOverlay();
  if (phase === 'idle') return null;
  if (phase === 'playing')
    return <video src={videoUrl!} onEnded={onVideoEnded} />;
  return <div className="fade" />;
}
```

## Anti-patterns

- `useState` inside a component that also renders — move state to a hook.
- `useEffect` inside a renderer — move to `useXOnMount` / `useX` hook.
- Inline `onClick={() => setStore({ a, b, c })}` that computes the payload — extract `useXClick` hook.
- Hooks returning JSX or component refs — hooks return data + callbacks only.
- "Smart" components that fetch, derive, AND render — split into a hook + a presentational component.

## When NOT to apply

- Trivial wrappers with no state at all (`<Card>`, `<PageShell>`). Already presentational.
- One-off prototype or scratch files you'll throw away.
- Established codebase convention that diverges — match the codebase instead.
