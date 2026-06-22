---
title: A field guide to consensus, minus the math anxiety
date: "2026-05-09"
category: Distributed
excerpt: Raft, Paxos, and the handful of ideas that actually matter when a cluster needs to agree on a single number.
coverCaption: figure — quorums must overlap
---

Consensus has a reputation for being impenetrable, and the papers do not help. But strip away the proofs and the protocols rest on a handful of ideas you can hold in your head. The rest is bookkeeping.

## Why quorums overlap

A cluster of $n$ nodes can tolerate $f$ failures only if $n \ge 2f + 1$. Every decision must be acknowledged by a majority — a _quorum_ — before it counts:

$$
q = \left\lfloor \frac{n}{2} \right\rfloor + 1
$$

The point of that number is not the arithmetic; it is that **any two quorums must share at least one node**. That single overlapping node is what stops two leaders, elected in ignorance of each other, from committing conflicting values for the same slot. Overlap is the whole safety argument in one sentence.

## Leaders make it boring (on purpose)

Raft's contribution was not a new safety result — it was _legibility_. By electing a single leader per term and funnelling all writes through it, Raft turns "agree on a sequence of values" into "replicate the leader's log." The hard part moves into leader election, which happens rarely, instead of into every single write.

> "The goal of a consensus protocol is to make the interesting case rare and the common case dull."

## What actually bites you

In practice the algorithm is rarely where systems break. The failures cluster around its edges:

- **Clock assumptions.** Leases and timeouts quietly assume bounded clock drift. They are an optimization, never the safety mechanism.
- **Disk lies.** A vote or term that was acknowledged but not truly `fsync`'d can un-commit a decision after a crash.
- **Reconfiguration.** Changing membership is its own miniature consensus problem; most real outages live here.

Learn the overlap argument cold and the rest of the literature reads like commentary on it.
