---
title: Designing a write-ahead log that survives power loss
date: "2026-06-14"
category: Systems
excerpt: A practical walk through fsync semantics, group commit, and why your "durable" database might be lying about what made it to disk.
featured: true
coverCaption: figure 1 — the durable write path
---

Every durable store eventually confronts the same uncomfortable truth: the operating system will happily tell you a write succeeded long before the bytes are anywhere near a platter. The gap between "the syscall returned" and "the data is safe" is where most data-loss bugs quietly live.

The fix is not glamorous. We append every change to a sequential log, force it to stable storage, and only then acknowledge the write. Reads can be fast and scattered; the write path stays boring and strictly ordered.

## What fsync actually guarantees

Calling `fsync()` flushes a file's dirty pages and its metadata. What it does _not_ do is flush the directory entry, which is why a freshly created log segment can vanish even after a successful sync.

```rust
fn append(log: &mut Log, rec: Record) -> io::Result<()> {
    log.buf.extend(rec.bytes());
    log.file.write_all(&log.buf)?;
    log.file.sync_all()?;   // durable here, not before
    log.dir.sync_all()?;    // don't forget the directory
    Ok(())
}
```

The order of those four lines is the whole game. Swap the `sync_all` calls after the acknowledgement and you have a log that is fast, elegant, and wrong.

> "A write that has not been fsync'd and acknowledged is, for all practical purposes, a write that never happened."

## Batching without lying

Group commit lets many concurrent writers share a single sync. The trick is to never acknowledge a writer until _their_ record is on the correct side of a completed flush — batching latency is fine, batching the lie is not.

A workable shape:

- Writers append their record to an in-memory batch and park on a condition variable.
- One thread owns the flush: it writes the batch, calls `sync_all`, then wakes everyone whose record made it.
- Late arrivals simply join the next batch.

Get those invariants right and the rest of the database can be as clever or as lazy as it likes. The log keeps its promises so nothing above it has to.
