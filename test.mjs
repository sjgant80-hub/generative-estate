// test.mjs — PROOF-OF-PLAY for THE GENERATIVE ESTATE. Zero tokens. Proves possibilities are held cheap and
// un-collapsed, that a real demand COLLAPSES a spec (the wisp generates + the κ-gate verifies) and only a VERIFIED
// collapse stands, that a bad collapse is DISCARDED (the caller never gets garbage — the load-bearing safety), that
// identical demand returns the CACHE (build once, run(S)==S), and that never-needed specs cost nothing. Deterministic.
import E from './estate.mjs';
import W from './wisp.mjs';
const { newField, define, collapse, verify, ratio, isBuilt, specId, sha256, canonical, exportField, importField, GUARDRAIL, KAPPA } = E;
const { templateWisp, flakyWisp, FIELD_SPECS } = W;

let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  ✓ ' : '  ✗ FAIL ') + m); };
const load = () => { const f = newField(); for (const s of FIELD_SPECS) define(f, s); return f; };
const idOf = (f, name) => Object.values(f.specs).find(s => s.name === name).id;

console.log('\n=== §1 · POSSIBILITY IS CHEAP — specs held un-collapsed, nothing built ===');
{
  const f = load();
  ok(Object.keys(f.specs).length === FIELD_SPECS.length, `all ${FIELD_SPECS.length} possibilities are DEFINED`);
  ok(Object.keys(f.cache).length === 0, 'and NOTHING is built — the field is pure potential until a demand arrives');
  ok(JSON.stringify(f.specs[idOf(f, 'dedupe')]).length < 400, 'a spec is tiny (a contract, not code) — a million would cost almost nothing');
  const before = idOf(f, 'sum'); define(f, FIELD_SPECS.find(s => s.name === 'sum')); ok(idOf(f, 'sum') === before && Object.keys(f.specs).length === FIELD_SPECS.length, 'defining the same contract again does not duplicate it (content-addressed)');
}

console.log('\n=== §2 · COLLAPSE ON DEMAND — the wisp GENERATES the code, the κ-gate verifies it, it stands ===');
{
  const f = load();
  const r = collapse(f, idOf(f, 'dedupe'), templateWisp, { ts: 1 });
  ok(r.ok && !r.cached && r.verify.holds, 'a demand collapses the spec: the wisp generated code and it VERIFIED (proof-of-play)');
  ok(isBuilt(f, idOf(f, 'dedupe')) && Object.keys(f.cache).length === 1, 'the verified build now STANDS in the cache — one thing built, the rest still potential');
  // the collapsed artifact actually works
  const fn = new Function(`${r.artifact}; return dedupe;`)();
  ok(JSON.stringify(fn([1, 2, 2, 3, 1])) === '[1,2,3]', 'and the generated code actually runs correctly');
}

console.log('\n=== §3 · THE HONEST WIRE — a collapse that does NOT verify is DISCARDED (never ship garbage) ===');
{
  const f = load();
  const r = collapse(f, idOf(f, 'sum'), flakyWisp, { ts: 1 });   // the flaky wisp returns wrong code
  ok(!r.ok && /did not verify|discarded/.test(r.why), 'the flaky collapse is REJECTED — the κ-gate caught it');
  ok(!isBuilt(f, idOf(f, 'sum')), 'the bad build is NOT cached — the spec stays possibility (try again / refine)');
  ok(r.verify && r.verify.holds === false, 'the caller gets a failure + the proof, NEVER the unverified code');
  // a real wisp then succeeds where the flaky one failed — the spec was never poisoned
  const r2 = collapse(f, idOf(f, 'sum'), templateWisp, { ts: 2 });
  ok(r2.ok && isBuilt(f, idOf(f, 'sum')), 'and a good wisp can still collapse it later — the discard did not damage the possibility');
}

console.log('\n=== §4 · BUILD ONCE — identical demand returns the CACHE (run(S)==S), the wisp is not called again ===');
{
  const f = load(); let calls = 0;
  const counting = s => { calls++; return templateWisp(s); };
  collapse(f, idOf(f, 'fib'), counting, { ts: 1 });
  const again = collapse(f, idOf(f, 'fib'), counting, { ts: 2 });
  ok(again.ok && again.cached === true, 'the second demand for the same spec returns the cached build');
  ok(calls === 1, 'the wisp generated ONCE — the identical demand did not rebuild (content-addressed by SHA of the spec)');
  ok(collapse(f, idOf(f, 'fib'), counting).artifact === again.artifact, 'same spec → same address → same build, every time');
}

console.log('\n=== §5 · THE ATOM RATIO — mostly un-collapsed potential, a thin actual core ===');
{
  const f = load();
  for (const n of ['dedupe', 'sum', 'fib']) collapse(f, idOf(f, n), templateWisp, { ts: 1 });
  const r = ratio(f);
  ok(r.built === 3 && r.potential === FIELD_SPECS.length - 3, `${r.built} collapsed to actual, ${r.potential} stay possibility — the never-needed cost nothing`);
  ok(r.actualFraction < 0.3, `most of the estate is un-collapsed potential (${(r.actualFraction * 100).toFixed(0)}% actual) — the atom's shape as a build system`);
  // a possibility the demo wisp can't build yet stays potential, cleanly (a real model would collapse it)
  const q = collapse(f, idOf(f, 'quicksort'), templateWisp, { ts: 2 });
  ok(!q.ok && !isBuilt(f, idOf(f, 'quicksort')), 'a spec beyond the wisp\'s current repertoire stays possibility — defined, un-built, free');
}

console.log('\n=== §6 · CONTENT-ADDRESS — same contract = same address; a changed verify-condition = a rebuild ===');
{
  ok(sha256('') === 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'the address is a real SHA-256');
  const a = specId({ name: 'x', inputs: ['a'], template: 't', verify: [{ in: [1], out: 1 }] });
  const b = specId({ name: 'x', inputs: ['a'], template: 't', verify: [{ in: [1], out: 1 }] });
  const c = specId({ name: 'x', inputs: ['a'], template: 't', verify: [{ in: [1], out: 2 }] });
  ok(a === b, 'the same spec-contract addresses to the same build');
  ok(a !== c, 'a changed verify-condition is a different spec → a different address → it rebuilds (no stale cache)');
}

console.log('\n=== §7 · GUARDRAIL + BACKUP + DETERMINISM + FUZZ ===');
{
  ok(/verified|κ-gate|garbage/i.test(GUARDRAIL), 'the guardrail is present and honest — verify-on-collapse is the whole safety');
  ok(!collapse(newField(), 'nope', templateWisp).ok, 'you cannot collapse a possibility that was never defined');
  ok(!verify({ name: 'f', verify: [] }, 'function f(){}').holds, 'a spec with NO verify-condition cannot let a collapse stand (no blind trust)');
  const f = load(); collapse(f, idOf(f, 'reverse'), templateWisp, { ts: 1 });
  const back = importField(exportField(f));
  ok(back && isBuilt(back, idOf(back, 'reverse')) && Object.keys(back.specs).length === FIELD_SPECS.length, 'export → import restores the field + its builds');
  ok(exportField(load()) === exportField(load()), 'defining the field is deterministic');
  let threw = false;
  try { collapse(newField(), 'x', () => 'bad'); verify({ name: 'f' }, null); define(newField(), {}); ratio(newField()); importField('garbage{'); collapse(load(), idOf(load(), 'sum'), () => { throw new Error('boom'); }); }
  catch { threw = true; }
  ok(!threw, 'malformed specs / throwing wisps / empty fields never crash the estate');
}

console.log('\n=== §8 · BOUNDARY PINS — the exact edges the happy path flies past (mutation-gate kills) ===');
{
  // ── the κ-gate boundary (line 64): holds ⇔ score >= threshold. Pin a score that EXACTLY equals the
  //    threshold, so `>=` vs `>` diverge (a build sitting precisely on κ must STAND, not be discarded).
  const halfSpec = { name: 'half', threshold: 0.5, verify: [{ in: [1], out: 1 }, { in: [1], out: 999 }] };
  const vh = verify(halfSpec, 'function half(x){ return x; }');   // 1 of 2 checks pass → score exactly 0.5
  ok(Math.abs(vh.score - 0.5) < 1e-9 && vh.holds === true, 'a collapse whose score EQUALS the threshold HOLDS (κ-gate is >=, not >)');

  // ── canonical (line 38): it must SORT object keys (that is the whole content-address) and stringify
  //    primitives directly. The two guards decide null/object vs primitive routing.
  ok(canonical({ b: 2, a: 1 }) === '{"a":1,"b":2}', 'canonical SORTS object keys (a changed guard returns insertion order → wrong address)');
  ok(canonical(5) === '5', 'canonical stringifies a primitive directly (not as an empty object)');

  // ── clone (line 66, exercised through verify): object inputs are DEEP-COPIED so a tested fn cannot
  //    mutate the caller's fixture; and undefined inputs must NOT throw inside the clone.
  const fixture = [1, 2, 3];
  verify({ name: 'mut', threshold: 0, verify: [{ in: [fixture], out: 6 }] }, 'function mut(a){ const s=a.reduce((x,y)=>x+y,0); a.push(99); return s; }');
  ok(fixture.length === 3, 'verify DEEP-CLONES an object input — the tested fn cannot mutate the caller\'s fixture');
  const vu = verify({ name: 'idu', threshold: 0.5, verify: [{ in: [undefined], out: null }] }, 'function idu(x){ return x === undefined ? null : x; }');
  ok(vu.passed === 1 && vu.holds === true, 'clone tolerates an undefined input (it must not throw) — the check still passes');

  // ── specId (line 41): the content-address must depend on EACH contract field. Two specs differing only
  //    in `inputs` (or only in `template`) MUST address differently, or the cache collides silently.
  ok(specId({ name: 'x', inputs: ['a'], verify: [{ in: [1], out: 1 }] }) !== specId({ name: 'x', inputs: ['b'], verify: [{ in: [1], out: 1 }] }), 'specId depends on `inputs` — differing inputs give different addresses');
  ok(specId({ name: 'x', template: 't1', verify: [{ in: [1], out: 1 }] }) !== specId({ name: 'x', template: 't2', verify: [{ in: [1], out: 1 }] }), 'specId depends on `template` — differing templates give different addresses');

  // ── define (lines 46, 47): the stored spec must preserve the caller's inputs/description, and a spec
  //    with no name must be REJECTED (the guard is OR: falsy spec OR falsy name).
  const dI = define(newField(), { name: 'zz', template: 'sum', inputs: ['a'], verify: [{ in: [[1]], out: 1 }] });
  ok(JSON.stringify(dI.spec.inputs) === '["a"]', 'define STORES the caller\'s inputs verbatim (not blanked to [])');
  const dD = define(newField(), { name: 'zz2', description: 'hello', template: 'sum', verify: [{ in: [[1]], out: 1 }] });
  ok(dD.spec.description === 'hello', 'define STORES the caller\'s description verbatim (not blanked to "")');
  ok(define(newField(), { description: 'no name' }).ok === false, 'define REJECTS a spec with no name (the name guard is real)');

  // ── importField (line 87): reject an object with no specs (null guard is OR); and a non-object `cache`
  //    must be coerced to {} (the cache guard is AND: truthy AND typeof object).
  ok(importField('{"foo":1}') === null, 'importField REJECTS a well-formed object that has no specs (returns null)');
  ok(JSON.stringify(importField('{"specs":{},"cache":"x"}').cache) === '{}', 'importField coerces a non-object cache to {} (guard is truthy AND object)');
}

const done = fail === 0;
console.log('\n' + (done
  ? `=== ✅ THE GENERATIVE ESTATE — possibility held cheap + un-collapsed; a demand collapses a spec (wisp generates, κ-gate verifies); only verified builds stand; a bad collapse is discarded; identical demand returns the cache · ${pass}/${pass} · zero tokens ===`
  : `=== ❌ ${fail} FAILED / ${pass + fail} ===`));
process.exit(done ? 0 : 1);
