const { calculateSM2 } = require('../services/sm2');
const assert = require('assert');

console.log('🧪 Running SM-2 Algorithm Tests...\n');

// Card initialized at defaults
let card = {
  easeFactor: 2.5,
  repetitions: 0,
  intervalDays: 0,
};

console.log('Initial Card:', card);

// Rating 1: User rates 4 (good recall)
const r1 = calculateSM2({ ...card, rating: 4 });
console.log('After Rating 4 (1st review):', {
  easeFactor: r1.easeFactor,
  repetitions: r1.repetitions,
  intervalDays: r1.intervalDays,
});
assert.strictEqual(r1.repetitions, 1);
assert.strictEqual(r1.intervalDays, 1);
assert(r1.easeFactor >= 2.5);

// Rating 2: User rates 5 (perfect recall)
const r2 = calculateSM2({ ...r1, rating: 5 });
console.log('After Rating 5 (2nd review):', {
  easeFactor: r2.easeFactor,
  repetitions: r2.repetitions,
  intervalDays: r2.intervalDays,
});
assert.strictEqual(r2.repetitions, 2);
assert.strictEqual(r2.intervalDays, 6);
assert(r2.easeFactor > r1.easeFactor);

// Rating 3: User rates 4 (good recall, interval should scale by EF)
const r3 = calculateSM2({ ...r2, rating: 4 });
console.log('After Rating 4 (3rd review):', {
  easeFactor: r3.easeFactor,
  repetitions: r3.repetitions,
  intervalDays: r3.intervalDays,
});
assert.strictEqual(r3.repetitions, 3);
assert(r3.intervalDays > 6);

// Rating 4: User forgets card (Rating 1)
const r4 = calculateSM2({ ...r3, rating: 1 });
console.log('After Rating 1 (Forgetting card):', {
  easeFactor: r4.easeFactor,
  repetitions: r4.repetitions,
  intervalDays: r4.intervalDays,
});
assert.strictEqual(r4.repetitions, 0, 'Repetitions should reset to 0 on rating < 3');
assert.strictEqual(r4.intervalDays, 1, 'Interval should be 1 day (tomorrow) on rating < 3');
assert(r4.easeFactor >= 1.3, 'Ease factor should not drop below 1.3');

console.log('\n✅ All SM-2 tests passed successfully!');
