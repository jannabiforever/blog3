---
title: Zero-copy parsing without losing your mind
date: "2026-05-28"
category: Rust
excerpt: Lifetimes get a bad reputation. Borrowing slices of an input buffer can make a parser both faster and clearer.
coverCaption: figure — borrowing, not copying
---

Lifetimes get a bad reputation, usually from people who met them while fighting the borrow checker at 2am. But for parsing they are exactly the right tool: they let you hand out _views_ into a buffer without ever copying a byte, and the compiler proves nobody outlives the data they point at.

## A header is just two slices

Consider parsing an HTTP-style header line. The naive version allocates a `String` for the name and another for the value. The zero-copy version allocates nothing:

```rust
struct Header<'a> {
    name: &'a str,
    value: &'a str,
}

fn parse_header(line: &str) -> Option<Header<'_>> {
    let (name, value) = line.split_once(": ")?;
    Some(Header { name, value: value.trim_end() })
}
```

Every `&'a str` above points back into the original request buffer. The `'a` lifetime is the compiler's receipt: a `Header` may not outlive the bytes it borrows from.

## When to break the rule

Zero-copy stops paying off the moment you need to _own_ the data past the buffer's life — caching parsed values, sending them across a thread boundary, mutating them. At that point a deliberate `.to_owned()` is not a defeat; it is you telling the reader exactly where the copy happens. The goal was never zero allocations. It was _no accidental_ ones.
