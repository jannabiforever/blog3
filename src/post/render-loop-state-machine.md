---
title: The render loop is a state machine in disguise
date: "2026-04-21"
category: Frontend
excerpt: Rethinking component updates as transitions instead of mutations made a tangled UI suddenly tractable.
coverCaption: figure — states, not mutations
---

For a long time I thought of UI as a pile of mutations: this click sets that flag, which toggles this class, which maybe resets that field. It worked until it didn't, and the day it didn't there was no single place to look.

## Transitions, not mutations

The shift was small to write and large to think about: stop describing _what changes_ and start describing _what state we are in_. A component is in one of a finite set of states, and events move it between them.

```typescript
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; items: Item[] };

function next(state: State, event: Event): State {
  if (state.status === "loading" && event.type === "resolved") {
    return { status: "ready", items: event.items };
  }
  // ...one arm per legal transition
  return state;
}
```

Suddenly the impossible states are _unrepresentable_ — there is no way to be `loading` and `error` at once, because the type won't let you.

## The payoff

Once updates are transitions, the render function gets boring in the best way: it is a pure projection of the current state onto markup. Debugging becomes "which state are we in, and was this transition legal?" — two questions with definite answers, instead of an archaeology dig through a dozen mutations.
