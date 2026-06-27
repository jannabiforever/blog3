---
title: "Deep dive into Bevy's ECS"
date: "2026-06-27"
category: "Engineering"
excerpt: "With emphasis on query caches"
---

# Inside Bevy's ECS: How Entity Queries Stay Fast

*A tour of `bevy_ecs` -- what an ECS is, and why Bevy's queries are so fast.*

## What's an ECS, in one minute

If you've never used an ECS, here's the whole idea. Instead of modeling a game as a tree
of objects that each bundle their own data *and* their own behavior (the classic
`class Player { health; position; update() {...} }`), an **Entity-Component-System**
splits those three things apart:

- **Entity** -- just an ID. A player, a bullet, a tree are each one number. No data, no
  methods.
- **Component** -- a plain bag of data you attach to an entity: a `Position`, a
  `Health`, a `Velocity`. An entity *is* simply whichever components are stuck to it.
- **System** -- a free function that operates on all entities matching some component
  pattern: "for every entity that has a `Position` and a `Velocity`, add the velocity to
  the position." It asks for the data it wants via a **query**.

The payoff: behavior isn't trapped inside objects, so you compose entities by mixing
components freely, and the engine can lay the data out in memory however is fastest and
run independent systems in parallel. The catch: the engine now has to answer "which
entities match this query?" millions of times per second. How Bevy makes *that* cheap is
the whole story below.

Every ECS makes the same promise; the interesting part is never the promise but the
phrase "as fast as the hardware allows." Feeding the right data to the right code at that
speed is where the real engineering lives, and in Bevy it cashes out as a specific set of
data-structure decisions you can read in the source.

This essay walks the whole pipeline -- entities, components, storage, the world, and
systems -- but it lingers on the part that does the heavy lifting on every single frame:
**the query**. By the end you should be able to explain, with the actual structs in
hand, why iterating a million entities in Bevy costs about as much as iterating a
million elements of a `Vec`.

All code references point at real lines in this checkout of `bevy_ecs`.

---

## First, the big picture: how the world moves forward

Before any data structures, here's the mental model. If it clicks, the rest of the
article is just "how is each step made fast?"

Think of the **World** as a single in-memory database that holds everything: all your
entities, all their component data, and global state (called *resources*). Your game
doesn't run continuously -- it advances in discrete **steps**. Each step is one call to
`App::update()`, and for a game that's one frame. Every step does the same thing: run a
list of **systems** (your functions) against the world, in a defined order, then do it
again next frame.

What actually happens inside one step? Bevy runs a top-level schedule called `Main`,
which simply runs a fixed, ordered list of sub-schedules
([`main_schedule.rs:290`](https://github.com/bevyengine/bevy/blob/434f3e9430757f72a22d5f8b7e6673816e9d8aaf/crates/bevy_app/src/main_schedule.rs#L290)).
You can read the order straight from the source's own doc comment
([`main_schedule.rs:29`](https://github.com/bevyengine/bevy/blob/434f3e9430757f72a22d5f8b7e6673816e9d8aaf/crates/bevy_app/src/main_schedule.rs#L29)):

```text
First -> PreUpdate -> StateTransition -> RunFixedMainLoop -> Update -> SpawnScene -> PostUpdate -> Last
```

`Update` is where your gameplay logic lives by default; the phases around it exist so
engine plumbing can run reliably *before* (`PreUpdate`: e.g. ingest input events) or
*after* (`PostUpdate`: e.g. recompute transforms) your code. Walking through a single
step, end to end:

1. **The step begins.** The world's internal clock -- a single integer called the
   **change tick** -- is read so the engine knows "this is now `T`."

2. **Each schedule phase runs its systems in order.** A system is just a function that
   declares what slices of the world it wants -- `Query<&mut Transform>`,
   `Res<Time>`, and so on. The scheduler hands each system exactly those slices.
   Crucially, systems whose requests don't overlap are run **in parallel on multiple
   threads**, because the engine knows up front they can't touch the same data.

3. **Systems don't edit the world's structure mid-run.** When a system spawns or
   despawns an entity, or adds/removes a component, it can't safely restructure the
   database while other systems are reading it in parallel. So those operations are
   recorded as deferred **commands** in a queue rather than applied immediately.

4. **Structural changes are flushed at sync points.** Between phases (and wherever a
   system needs the results of an earlier one), Bevy applies the queued commands --
   `World::flush_commands`
   ([`world/mod.rs:3056`](https://github.com/bevyengine/bevy/blob/434f3e9430757f72a22d5f8b7e6673816e9d8aaf/crates/bevy_ecs/src/world/mod.rs#L3056)).
   *This* is the moment entities actually get created, destroyed, or moved between
   archetypes. (Section 3 explains what "moved between archetypes" means.)

5. **The clock ticks.** The world's change tick advances by one --
   `World::increment_change_tick`
   ([`world/mod.rs:3094`](https://github.com/bevyengine/bevy/blob/434f3e9430757f72a22d5f8b7e6673816e9d8aaf/crates/bevy_ecs/src/world/mod.rs#L3094)):

   ```rust
   pub fn increment_change_tick(&mut self) -> Tick {
       let change_tick = self.change_tick.get_mut();
       let prev_tick = *change_tick;
       *change_tick = change_tick.wrapping_add(1);
       Tick::new(prev_tick)
   }
   ```

   That ever-rising number is how Bevy later answers "did this change since I last
   looked?" -- the basis of change detection in Section 6.

6. **Repeat next frame.** Rendering, by the way, happens in a *separate* world that
   exchanges data with this one between steps, so drawing never blocks your game logic.

So a "step" is: **read the world -> run systems in ordered phases (in parallel where
safe) -> flush the structural changes they queued -> advance the clock.** Two structural
facts hold this loop together, and both turn out to be what make the query machinery in
Section 5 cheap: **the world only changes structure at controlled flush points**, and
**a single monotone tick timestamps everything**.

---

## 1. The entity is just an ID

An entity is an element of an opaque index set, tagged with a generation that makes
reuse of an index safe. That's the entire abstraction: it carries no data and no
behavior, and the only structure it has is "which slot, in which lifetime of that slot."
Everything downstream is a map keyed on this.

The type is a 64-bit handle ([`entity/mod.rs:424`](https://github.com/bevyengine/bevy/blob/434f3e9430757f72a22d5f8b7e6673816e9d8aaf/crates/bevy_ecs/src/entity/mod.rs#L424)):

```rust
pub struct Entity {
    // Do not reorder the fields here. The ordering is explicitly used by repr(C)
    // to make this struct equivalent to a u64.
    #[cfg(target_endian = "little")]
    index: EntityIndex,
    generation: EntityGeneration,
    #[cfg(target_endian = "big")]
    index: EntityIndex,
}
```

The **index** picks the slot; the **generation** picks the lifetime. The
endianness-dependent field ordering is deliberate -- it guarantees the struct is
bit-for-bit a `u64`, so it lives in registers, copies for free, and hashes trivially.

The generation is what keeps the index set safe to reuse. Despawning an entity returns
its index to circulation but increments the generation on that slot, so the map "index
-> current generation" advances. A stale handle still carries the old generation; a
lookup compares the two and refuses to resolve a recycled slot to someone else's data.
No reference counting, no tombstone scan -- the safety check is a single equality on a
tag. So an entity is a key, and the rest of the design is the structure it keys into.

---

## 2. Components, and the two ways to store them

A component is any Rust type you attach to an entity. The first decision the engine makes
about a component type is *where its values live*, and that decision -- a per-type
property fixed at registration -- is the one that later selects which query iteration
kernel runs. So it's worth seeing the choice as a choice before seeing either option.

At registration each component type gets a dense integer `ComponentId`; from then on the
engine talks about components purely in terms of those IDs. The values behind those IDs
sit in one of two layouts.

### Tables (the default, SoA)

A `Table` is a struct-of-arrays ([`storage/table/mod.rs:202`](https://github.com/bevyengine/bevy/blob/434f3e9430757f72a22d5f8b7e6673816e9d8aaf/crates/bevy_ecs/src/storage/table/mod.rs#L202)):

```rust
pub struct Table {
    columns: ImmutableSparseSet<ComponentId, Column>,
    entities: Vec<Entity>,
}
```

Each `Column` is a tightly packed array of one component type, one row per entity. Row
`N` across every column belongs to the entity at `entities[N]`. This is the same layout
a relational database uses, and for the same reason: a system that sweeps one component
across many entities touches values that are contiguous in memory, which is exactly the
access pattern the CPU prefetcher is built for.

### Sparse sets (the opt-in, for churn)

Some components are added and removed constantly -- a transient "is currently being
hovered" marker, say. Under table storage, every toggle relocates the entity's whole row
(Section 3 makes "relocate" precise); paying that on a high-frequency marker is wasteful.
For those you opt into `SparseSet` storage
([`storage/sparse_set.rs:157`](https://github.com/bevyengine/bevy/blob/434f3e9430757f72a22d5f8b7e6673816e9d8aaf/crates/bevy_ecs/src/storage/sparse_set.rs#L157)), trading a little iteration
locality for O(1) insert/remove that disturbs no one else's layout.

---

## 3. Archetypes: the world's natural fault lines

Here is the load-bearing idea of the whole design, so it's worth stating structurally
before any code.

Take the relation on entities "has exactly the same set of components." It's an
equivalence relation, and an **archetype** is one of its equivalence classes. The class
is named by a component signature -- a set of `ComponentId`s -- and changing an entity's
component set is therefore not an in-place edit but a move between classes. Spawn with
`(Position, Velocity)` and the entity lands in the class `{Position, Velocity}`; add a
`Health` and it doesn't gain a field where it sits -- it *moves* to the class
`{Position, Velocity, Health}`, which is backed by a different table.

This partition is the entire reason queries are cheap, because a query is a predicate on
signatures, and a predicate on signatures is constant on each class. Match the class once
and every entity in it inherits the verdict for free. The engine groups entities by their
signature precisely so the cost of deciding "does this match?" can be quotiented down to
one decision per class instead of one per entity.

The `Archetype` struct ([`archetype.rs:383`](https://github.com/bevyengine/bevy/blob/434f3e9430757f72a22d5f8b7e6673816e9d8aaf/crates/bevy_ecs/src/archetype.rs#L383)):

```rust
pub struct Archetype {
    id: ArchetypeId,
    table_id: TableId,
    edges: Edges,
    entities: Vec<ArchetypeEntity>,
    components: ImmutableSparseSet<ComponentId, ArchetypeComponentInfo>,
    pub(crate) flags: ArchetypeFlags,
}
```

`table_id` is the link from a class to the table physically holding its table-stored
columns. `edges` is the other half of the structure: the classes form a graph whose
edges are single-component additions and removals, so the move triggered by "add
`Health`" is a labeled edge from one class to an adjacent one. Adding a component follows
(or lazily builds) that edge and moves one row -- a graph hop, not a search. The
archetype is where the engine's partition of the world and the query's predicate meet,
and the next two sections are about exploiting that meeting point.

---

## 4. The World ties it together

The `World` owns the archetypes, the tables, the sparse sets, the entity metadata, and
the resources. Two invariants on that ownership are the load-bearing ones, and the entire
query cache is built to exploit them:

1. **The set of archetypes is append-only.** Once a class comes into existence it is
   never destroyed for the life of the world -- it may only become empty. So the set of
   archetypes only ever grows; nothing a cache records about it can later be invalidated.

2. **A monotone counter stamps each birth.** Every time a genuinely new archetype is
   created, `Archetypes::generation()` advances. Monotonicity plus append-only is the key
   combination: "the archetypes that exist now but didn't at generation `g`" is always a
   contiguous suffix of the list, identified by a single integer.

Those two facts are the precondition for everything in the next section.

---

## 5. The query -- where the frame budget is spent

A query is the read/write request a system makes: `Query<(&Position, &mut Velocity),
With<Player>>` means "give me read access to `Position` and write access to `Velocity`,
for every entity that also has `Player`." This is the single most executed operation in
a running Bevy app -- every system, every frame. So this is where the engineering went.

### 5.1 What the query actually caches

The structural claim first: a query never materializes a set of entities. It maintains a
set of *storages* -- archetypes and tables -- because matching is constant on classes
(Section 3), so the smallest object worth recording a verdict against is the class, never
its members. The cached state is `QueryState`
([`query/state.rs:79`](https://github.com/bevyengine/bevy/blob/434f3e9430757f72a22d5f8b7e6673816e9d8aaf/crates/bevy_ecs/src/query/state.rs#L79)):

```rust
pub struct QueryState<D: QueryData, F: QueryFilter = ()> {
    world_id: WorldId,
    pub(crate) archetype_generation: ArchetypeGeneration,   // high-water mark
    pub(crate) matched_tables: FixedBitSet,                  // which tables match
    pub(crate) matched_archetypes: FixedBitSet,             // which archetypes match
    pub(crate) component_access: FilteredAccess,
    pub(super) matched_storage_ids: Vec<StorageId>,          // the iteration list
    pub(super) is_dense: bool,                               // table vs archetype path
    pub(crate) fetch_state: D::State,
    pub(crate) filter_state: F::State,
    // ...
}
```

The match set is stored twice on purpose, because membership-testing and iteration are
different access patterns and each wants its own representation:

- `matched_archetypes` / `matched_tables` are **`FixedBitSet`s** -- the characteristic
  function of the match set, answering "is class N matched?" in O(1) and serving as
  dedup guards.
- `matched_storage_ids` is a **`Vec`** -- the same set enumerated, because once you're
  iterating, walking a contiguous list of IDs beats scanning set bits.

A few bytes of redundancy buys O(1) membership *and* linear iteration. That's the whole
bargain.

### 5.2 The incremental update: paying only for what's new

This is where the two invariants from Section 4 cash out. Because the archetype set is
append-only and stamped by a monotone counter, keeping the cache current never means
recomputing it -- it means processing the suffix of classes born since last time. The
refresh is `update_archetypes_unsafe_world_cell`
([`query/state.rs:559`](https://github.com/bevyengine/bevy/blob/434f3e9430757f72a22d5f8b7e6673816e9d8aaf/crates/bevy_ecs/src/query/state.rs#L559)):

```rust
pub fn update_archetypes_unsafe_world_cell(&mut self, world: UnsafeWorldCell) {
    self.validate_world(world.id());
    D::update_archetypes(&mut self.fetch_state, world);
    F::update_archetypes(&mut self.filter_state, world);
    if self.component_access.required.is_clear() {
        let archetypes = world.archetypes();
        let old_generation =
            core::mem::replace(&mut self.archetype_generation, archetypes.generation());

        for archetype in &archetypes[old_generation..] {   // only the NEW archetypes
            unsafe { self.new_archetype(archetype); }
        }
    } else {
        // skip if we are already up to date
        if self.archetype_generation == world.archetypes().generation() {
            return;
        }
        // ...required-component fast path, below...
    }
}
```

The whole argument is in the slice bound: `&archetypes[old_generation..]`. The query
holds the generation it last processed; the suffix above that high-water mark is exactly
the classes it hasn't seen. In steady state -- no new component combination spawned that
frame -- the suffix is empty, and the entire update collapses to a generation compare and
a return. The cost of *keeping a query cache correct* in the common case is one integer
comparison, and that's a direct consequence of append-only-plus-monotone: "what's new"
is a suffix, and a suffix is a single index.

#### The required-component optimization

The `else` branch handles queries with *required* components (the typical case for
`&T` / `&mut T`), and it sharpens the bound from "the new classes" to "the new classes
that could possibly contain a given component." It consults the world's
`component_index` for the set of archetypes containing each required component, takes the
required component with the **fewest** such archetypes (`min_by_key`) -- the smallest set
in the intersection -- and checks only those, skipping any already below the high-water
mark. Require a rare component and you never even look at the thousands of classes that
provably can't contain it.

### 5.3 The per-archetype match test

When the update reaches a genuinely new class, `new_archetype`
([`query/state.rs:640`](https://github.com/bevyengine/bevy/blob/434f3e9430757f72a22d5f8b7e6673816e9d8aaf/crates/bevy_ecs/src/query/state.rs#L640)) evaluates the predicate on its
signature and, if it holds, records the class:

```rust
pub unsafe fn new_archetype(&mut self, archetype: &Archetype) {
    if D::matches_component_set(&self.fetch_state, &|id| archetype.contains(id))
        && F::matches_component_set(&self.filter_state, &|id| archetype.contains(id))
        && self.matches_component_set(&|id| archetype.contains(id))
    {
        let archetype_index = archetype.id().index();
        if !self.matched_archetypes.contains(archetype_index) {
            self.matched_archetypes.grow_and_insert(archetype_index);
            if !self.is_dense {
                self.matched_storage_ids.push(StorageId {
                    archetype_id: archetype.id(),
                });
            }
        }
        let table_index = archetype.table_id().as_usize();
        if !self.matched_tables.contains(table_index) {
            self.matched_tables.grow_and_insert(table_index);
            if self.is_dense {
                self.matched_storage_ids.push(StorageId {
                    table_id: archetype.table_id(),
                });
            }
        }
    }
}
```

The predicate is a conjunction of three set-membership tests -- the data query `D`, the
filter `F`, and the state's own `With`/`Without` sets -- each asking only "does this
signature contain these IDs?" against a set the class already carries. No entity is
touched; the verdict is computed once for the class.

The `is_dense` split at the bottom is where the storage choice from Section 2 re-enters,
and it determines the granularity at which matches are recorded:

- A **dense** query (everything it touches is table-stored) records one `StorageId` per
  *table*. Several classes can share a table, and `matched_tables` dedups them so the
  table is iterated once.
- A **sparse** query records one `StorageId` per *archetype*.

That one boolean, fixed when the query is built, selects the iteration kernel below.

### 5.4 The hot loop: why iteration is nearly free

Now the actual sweep. `fold_over_storage_range`
([`query/iter.rs:178`](https://github.com/bevyengine/bevy/blob/434f3e9430757f72a22d5f8b7e6673816e9d8aaf/crates/bevy_ecs/src/query/iter.rs#L178)) dispatches on `is_dense`:

```rust
if self.cursor.is_dense {
    let table_id = unsafe { storage.table_id };
    let table = unsafe { self.tables.get(table_id).debug_checked_unwrap() };
    let range = range.unwrap_or(0..table.entity_count());
    accum = unsafe { self.fold_over_table_range(accum, func, table, range) };
} else {
    let archetype_id = unsafe { storage.archetype_id };
    let archetype = unsafe { self.archetypes.get(archetype_id).debug_checked_unwrap() };
    let table = unsafe { self.tables.get(archetype.table_id()).debug_checked_unwrap() };
    let range = range.unwrap_or(0..archetype.len());

    // When an archetype and its table have equal entity counts, dense iteration can be
    // safely used. this leverages cache locality to optimize performance.
    if table.entity_count() == archetype.len() {
        accum = unsafe { self.fold_over_dense_archetype_range(accum, func, archetype, range) };
    } else {
        accum = unsafe { self.fold_over_archetype_range(accum, func, archetype, range) };
    }
}
```

Even the sparse path opportunistically upgrades to the dense kernel when a class happens
to occupy its whole table (equal entity counts), recovering contiguous iteration wherever
the structure permits it.

The dense kernel itself, `fold_over_table_range`
([`query/iter.rs:241`](https://github.com/bevyengine/bevy/blob/434f3e9430757f72a22d5f8b7e6673816e9d8aaf/crates/bevy_ecs/src/query/iter.rs#L241)), is the punchline:

```rust
D::set_table(&mut self.cursor.fetch, &self.query_state.fetch_state, table);
F::set_table(&mut self.cursor.filter, &self.query_state.filter_state, table);

let entities = table.entities();
for row in rows {
    let entity = unsafe { entities.get_unchecked(row as usize) };
    let row = unsafe { TableRow::new(NonMaxU32::new_unchecked(row)) };
    // ...filter check, then fetch...
    if let Some(item) = D::fetch(/* ... */) {
        accum = func(accum, item);
    }
}
```

`set_table` runs **once per table**, binding the column base pointers; then the body is a
straight `for row in rows` reading down packed columns by index. No per-entity hashing,
no pointer chasing, no map lookup. To a first approximation it is the loop you would have
hand-written over parallel `Vec`s -- which is the point: by the time control reaches the
inner loop, every layer of ECS abstraction has been quotiented away.

That's the answer to the question in the intro. Iterating a query is fast because:

1. **Matching is constant on classes** and cached, so iteration does zero matching.
2. **The cache update is incremental** -- a suffix, not a recomputation -- so per-frame
   overhead is a generation compare.
3. **The data is struct-of-arrays in tables**, so the inner loop is linear and
   cache-friendly.
4. **`set_table` hoists the binding out of the loop**, so the inner body is bare reads.

---

## 6. Change detection: queries that skip unchanged data

Bevy layers one more efficiency win on top: `Query<&T, Changed<T>>` returns only the
entities whose data changed. The mechanism is a logical clock -- a Lamport-style
timestamp per component -- not a diff against a previous state, so "did this change?"
reduces to comparing two integers.

The world maintains a monotone tick. Every component carries two of these timestamps
([`change_detection/tick.rs:137`](https://github.com/bevyengine/bevy/blob/434f3e9430757f72a22d5f8b7e6673816e9d8aaf/crates/bevy_ecs/src/change_detection/tick.rs#L137)):

```rust
pub struct ComponentTicks {
    /// Tick recording the time this component or resource was added.
    pub added: Tick,
    /// Tick recording the time this component or resource was most recently changed.
    pub changed: Tick,
}
```

Mutably dereferencing a component (through `Mut<T>`'s `DerefMut`) stamps its `changed`
tick with the current world tick -- a write *is* an event on the clock. A system records
the tick at which it last ran, and `Changed`/`Added` become an ordering test between two
timestamps, `is_newer_than`
([`change_detection/tick.rs:52`](https://github.com/bevyengine/bevy/blob/434f3e9430757f72a22d5f8b7e6673816e9d8aaf/crates/bevy_ecs/src/change_detection/tick.rs#L52)):

```rust
pub fn is_newer_than(self, last_run: Tick, this_run: Tick) -> bool {
    let ticks_since_insert = this_run.relative_to(self).tick.min(MAX_CHANGE_AGE);
    let ticks_since_system = this_run.relative_to(last_run).tick.min(MAX_CHANGE_AGE);
    ticks_since_system > ticks_since_insert
}
```

The `relative_to` / `MAX_CHANGE_AGE` dance is there to keep the order well-defined on a
`u32` clock that wraps: comparisons are done on differences relative to the current tick
rather than on absolute values, and the world periodically clamps stale ticks so the
subtraction can't overflow. Strip that away and the predicate is just "is this
component's `changed` event after the system's last-run event?" -- a couple of integer
ops per component, no allocation, no dirty-set to maintain. Change detection rides inside
the same column sweep the query was already doing.

---

## 7. Systems and scheduling: efficiency in the large

Everything above makes a *single* query fast. The scheduler makes *many systems* fast
together. Because each query declares its exact access -- which components it reads,
which it writes, encoded in `component_access` -- the scheduler can compute, ahead of
time, which systems conflict. Two systems that only read `Position`, or whose accessed
component sets are disjoint, can run on different threads with no locks, because the type
system has already proved they can't alias.

So the access metadata the query uses to *match* archetypes is the same metadata the
scheduler uses to *parallelize* systems: one declaration, two payoffs. The
data-oriented layout that gives cache-friendly iteration *within* a system is what gives
lock-free parallelism *across* systems.

---

## 8. The shape of the whole thing

Step back and the design is remarkably coherent -- each decision feeds the next:

| Decision | What it buys |
|---|---|
| Entity = `index + generation` packed into a `u64` | Free-to-copy handles; safe reuse of slots |
| Entities partitioned into archetypes by signature | Matching is constant on classes, not entities |
| Table storage (struct-of-arrays) | Contiguous, prefetch-friendly iteration |
| Archetype set append-only + monotone generation | Caches only grow; "what's new" is a contiguous suffix |
| `QueryState` caches *storages*, double-encoded (bitset + vec) | O(1) membership **and** fast iteration |
| Incremental `update_archetypes` keyed on generation | Steady-state cache upkeep is one integer compare |
| `is_dense` chosen once | Branchless selection of the optimal iteration kernel |
| `set_table` hoisted out of the inner loop | Inner loop is bare column reads |
| Logical-clock change detection | "Only the changed ones" with no dirty-tracking overhead |
| Access declared per query | Lock-free multi-threaded scheduling for free |

None of these is exotic on its own. Generation indices, archetypal storage, SoA columns,
logical clocks -- they're all known techniques. What makes `bevy_ecs` fast is the way
the pieces compose, and the composition isn't a coincidence: it's forced by one
structural decision and its algebraic consequences. Partitioning entities by their
component signature gives an equivalence relation whose classes are the archetypes;
making that partition append-only and monotone makes "the new classes" a suffix, which
makes cache maintenance an integer compare; backing each class with an SoA table makes
the matched-and-cached iteration a linear scan; and the access sets that define the
matching predicate are the same sets whose disjointness defines safe parallelism. The
quotient does the work, and everything else is reading it off.

The result is the property we set out to explain. Write a Bevy system that sweeps a
million entities and the engine spends a couple of integer comparisons confirming its
cache is current, then hands your closure a tight loop over packed arrays. The ECS,
having done its thinking ahead of time, gets out of the way.

---

*Want to read along in the source? The whole story is in
[`crates/bevy_ecs/src/`](https://github.com/bevyengine/bevy/tree/434f3e9430757f72a22d5f8b7e6673816e9d8aaf/crates/bevy_ecs/src):
[`entity/mod.rs`](https://github.com/bevyengine/bevy/blob/434f3e9430757f72a22d5f8b7e6673816e9d8aaf/crates/bevy_ecs/src/entity/mod.rs),
[`archetype.rs`](https://github.com/bevyengine/bevy/blob/434f3e9430757f72a22d5f8b7e6673816e9d8aaf/crates/bevy_ecs/src/archetype.rs),
[`storage/table/`](https://github.com/bevyengine/bevy/tree/434f3e9430757f72a22d5f8b7e6673816e9d8aaf/crates/bevy_ecs/src/storage/table),
[`query/state.rs`](https://github.com/bevyengine/bevy/blob/434f3e9430757f72a22d5f8b7e6673816e9d8aaf/crates/bevy_ecs/src/query/state.rs),
[`query/iter.rs`](https://github.com/bevyengine/bevy/blob/434f3e9430757f72a22d5f8b7e6673816e9d8aaf/crates/bevy_ecs/src/query/iter.rs),
and [`change_detection/tick.rs`](https://github.com/bevyengine/bevy/blob/434f3e9430757f72a22d5f8b7e6673816e9d8aaf/crates/bevy_ecs/src/change_detection/tick.rs).*

*All source references in this post are pinned to commit
[`434f3e9`](https://github.com/bevyengine/bevy/tree/434f3e9430757f72a22d5f8b7e6673816e9d8aaf)
so the line numbers stay accurate.*
