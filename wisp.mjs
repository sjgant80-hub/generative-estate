// wisp.mjs — the demo COLLAPSE-OPERATOR (the "wisp") + a field of possibilities. This is a DETERMINISTIC generator
// so the estate runs standalone and the gate can prove the machinery; the real wisp is an LLM (BYOK) with an open
// repertoire. The generator READS a spec and SYNTHESISES code for it — the code is NOT stored in the spec (that
// would be pre-built, not deferred creation). The spec says WHAT (name, shape, verify); the wisp makes the HOW.

// the demo wisp's repertoire — what it currently knows how to build. An LLM's repertoire is open-ended.
export const TEMPLATES = {
  dedupe: s => `function ${s.name}(a){const seen=new Set(),o=[];for(const x of a){if(!seen.has(x)){seen.add(x);o.push(x);}}return o;}`,
  sum: s => `function ${s.name}(a){return a.reduce((x,y)=>x+y,0);}`,
  reverse: s => `function ${s.name}(a){return a.slice().reverse();}`,
  fib: s => `function ${s.name}(n){let x=0,y=1;for(let i=0;i<n;i++){[x,y]=[y,x+y];}return x;}`,
  fizzbuzz: s => `function ${s.name}(n){let r="";if(n%3===0)r+="Fizz";if(n%5===0)r+="Buzz";return r||String(n);}`,
  palindrome: s => `function ${s.name}(str){const c=String(str).toLowerCase().replace(/[^a-z0-9]/g,'');return c===c.split('').reverse().join('');}`,
  chunk: s => `function ${s.name}(a,n){const o=[];for(let i=0;i<a.length;i+=n)o.push(a.slice(i,i+n));return o;}`,
  flatten: s => `function ${s.name}(a){return a.reduce((f,x)=>f.concat(Array.isArray(x)?${s.name}(x):x),[]);}`,
  gcd: s => `function ${s.name}(a,b){a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a;}`,
  titlecase: s => `function ${s.name}(str){return String(str).replace(/\\b\\w/g,c=>c.toUpperCase());}`,
  clampn: s => `function ${s.name}(x,lo,hi){return x<lo?lo:x>hi?hi:x;}`,
  countvowels: s => `function ${s.name}(str){return (String(str).match(/[aeiou]/gi)||[]).length;}`,
};
// the DETERMINISTIC demo wisp: synthesise code from the spec's template. Unknown template → the wisp can't build it
// yet (throws) → the collapse fails cleanly and the spec stays possibility (a real LLM wisp would attempt it).
export function templateWisp(spec) { const t = TEMPLATES[spec.template]; if (!t) throw new Error(`no repertoire for "${spec.template}" (a real model would generate it)`); return t(spec); }
// a FLAKY wisp — returns plausible-but-WRONG code, to prove the κ-gate discards a bad collapse (the honest wire).
export function flakyWisp(spec) { return `function ${spec.name}(){return null;}`; }

// ── the preloaded FIELD OF POSSIBILITIES — specs, un-collapsed. Cheap to hold; collapse only what's demanded. ──
export const FIELD_SPECS = [
  { name: 'dedupe', template: 'dedupe', description: 'Remove duplicates from a list, keeping first order.', inputs: ['arr'], verify: [{ in: [[1, 2, 2, 3, 1]], out: [1, 2, 3] }, { in: [[]], out: [] }, { in: [['a', 'a', 'b']], out: ['a', 'b'] }] },
  { name: 'sum', template: 'sum', description: 'Sum a list of numbers.', inputs: ['arr'], verify: [{ in: [[1, 2, 3]], out: 6 }, { in: [[]], out: 0 }, { in: [[-1, 1]], out: 0 }] },
  { name: 'reverse', template: 'reverse', description: 'Reverse a list.', inputs: ['arr'], verify: [{ in: [[1, 2, 3]], out: [3, 2, 1] }, { in: [[]], out: [] }] },
  { name: 'fib', template: 'fib', description: 'The n-th Fibonacci number.', inputs: ['n'], verify: [{ in: [0], out: 0 }, { in: [1], out: 1 }, { in: [10], out: 55 }] },
  { name: 'fizzbuzz', template: 'fizzbuzz', description: 'Classic FizzBuzz for one number.', inputs: ['n'], verify: [{ in: [3], out: 'Fizz' }, { in: [5], out: 'Buzz' }, { in: [15], out: 'FizzBuzz' }, { in: [7], out: '7' }] },
  { name: 'palindrome', template: 'palindrome', description: 'Is a string a palindrome (ignoring case/punctuation)?', inputs: ['str'], verify: [{ in: ['racecar'], out: true }, { in: ['A man a plan a canal Panama'], out: true }, { in: ['nope'], out: false }] },
  { name: 'chunk', template: 'chunk', description: 'Split a list into chunks of size n.', inputs: ['arr', 'n'], verify: [{ in: [[1, 2, 3, 4, 5], 2], out: [[1, 2], [3, 4], [5]] }] },
  { name: 'flatten', template: 'flatten', description: 'Deep-flatten a nested list.', inputs: ['arr'], verify: [{ in: [[1, [2, [3, 4]], 5]], out: [1, 2, 3, 4, 5] }] },
  { name: 'gcd', template: 'gcd', description: 'Greatest common divisor.', inputs: ['a', 'b'], verify: [{ in: [12, 8], out: 4 }, { in: [17, 5], out: 1 }] },
  { name: 'titlecase', template: 'titlecase', description: 'Title-case a string.', inputs: ['str'], verify: [{ in: ['hello world'], out: 'Hello World' }] },
  { name: 'clampn', template: 'clampn', description: 'Clamp a number to a range.', inputs: ['x', 'lo', 'hi'], verify: [{ in: [5, 0, 3], out: 3 }, { in: [-1, 0, 3], out: 0 }, { in: [2, 0, 3], out: 2 }] },
  { name: 'countvowels', template: 'countvowels', description: 'Count the vowels in a string.', inputs: ['str'], verify: [{ in: ['hello'], out: 2 }, { in: ['xyz'], out: 0 }] },
  // possibilities the demo wisp can't build yet — they stay potential until a real model collapses them:
  { name: 'quicksort', template: 'quicksort', description: 'Sort a list (a real model would generate this).', inputs: ['arr'], verify: [{ in: [[3, 1, 2]], out: [1, 2, 3] }] },
  { name: 'levenshtein', template: 'levenshtein', description: 'Edit distance between two strings (awaiting a real model).', inputs: ['a', 'b'], verify: [{ in: ['kitten', 'sitting'], out: 3 }] },
];

export default { TEMPLATES, templateWisp, flakyWisp, FIELD_SPECS };
