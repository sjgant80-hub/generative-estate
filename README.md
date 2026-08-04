# the generative estate — everything's there till it's built

**▶ Live: https://sjgant80-hub.github.io/generative-estate/**  (collapse a spec on demand; flip **flaky wisp** to watch a bad build get rejected)

The estate stops being a warehouse of built code and becomes a **field of potential that renders on demand**. You
**define possibility** (a spec — cheap, near-infinite) and **collapse to actual** (the wisp generates the code, then
verifies it) only when a real demand arrives. **99% stays un-collapsed possibility, 1% collapses to actual** — the
atom's ratio, as a build system. It dissolves the "I built too much" problem: you stop building speculatively.

## The mechanic

```
possibility (a spec — un-collapsed, cheap)
  → HOLD       stored as content-address + spec. NOT code. pure potential.
  → COLLAPSE   on real demand, the wisp GENERATES actual code from the spec, then and there
  → VERIFY     the κ-gate (proof-of-play): the collapsed code only STANDS if it holds
  → CACHE      content-addressed by SHA(spec) — same spec = same address = build ONCE
```

It's **lazy evaluation at estate scale** — but deferring **creation**, not just execution. Normal lazy-eval holds
pre-written computations (thunks); this holds *AI-generatable possibilities*. The spec is looser than code; the wisp
**generates** the collapse. So the possibility space is enormous and cheap — a million possible tools cost almost
nothing, and only the handful you need collapse to actual.

## The load-bearing honesty (§5)

The collapse must be **verified or the field renders garbage** — the wisp is only as good as the model behind it. So
the κ-gate is **not optional**: a collapse that fails proof-of-play is **discarded**, the spec stays un-collapsed,
and the caller gets a failure — **never** unverified code. Verify-on-collapse is the whole difference between a
generative estate and a garbage generator. *(The generator is **injected** — a deterministic template wisp ships so
it runs standalone; the real wisp is a model, BYOK. The kernel stays pure and gated either way.)*

## Third of the set — the three tenses of building

- **[the oracle](https://sjgant80-hub.github.io/the-oracle/)** holds the **future** open — forks divergent futures,
  collapses what resolves.
- **[re-collapse](https://sjgant80-hub.github.io/recollapse/)** holds the **past** open — re-collapses stored meaning.
- **the generative estate** holds the whole **build-space** open — every possible build, collapsed on demand.

All three are the same move — *hold possibility open → collapse what holds* — pointed at a different target, and they
share the **κ-gate** and **content-addressing** core.

## Proven — `node test.mjs`, zero tokens, 26/26

`§1` possibility is cheap + un-collapsed (a spec is tiny; defining the same contract never duplicates) · `§2`
collapse-on-demand (the wisp generates, the κ-gate verifies, it stands and runs) · `§3` **the honest wire** — a
collapse that doesn't verify is discarded, the spec stays possibility, the caller never gets garbage · `§4` build
once — identical demand returns the cache (run(S)==S), the wisp isn't called again · `§5` the atom ratio (mostly
potential; never-needed cost nothing; beyond-repertoire stays possibility) · `§6` content-address (real SHA-256; a
changed verify-condition rebuilds) · `§7` guardrail (no verify-condition ⇒ can't stand) + backup + determinism + fuzz.

## Files

`estate.mjs` (the kernel — SHA-256 content-addressing, the possibility store, collapse/verify/cache, the guardrail;
the generator is injected) · `wisp.mjs` (a deterministic demo wisp + a flaky one + a preloaded field of
possibilities) · `test.mjs` (the 26/26 gate) · `index.html` (the live field — collapse on demand, watch it verify or
get discarded, see the ratio). Zero-dep, offline PWA.

```bash
node test.mjs                 # the proof
python -m http.server 8080    # then open http://localhost:8080
```
