/**
 * SuperMemo 2 (SM-2) Spaced Repetition Algorithm
 * 
 * Rules:
 * - User rates from 0 to 5 (q)
 * - If rating < 3: reset repetitions to 0, review again tomorrow (interval = 1 day)
 * - If rating >= 3:
 *     - repetition 0 (1st success): interval = 1 day
 *     - repetition 1 (2nd success): interval = 6 days
 *     - repetition >= 2: interval = Math.round(previousInterval * easeFactor)
 *     - repetitions += 1
 * - Update ease factor:
 *     EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
 *     EF' cannot fall below 1.3
 * - nextReviewDate = today + interval
 */

function calculateSM2({ easeFactor = 2.5, repetitions = 0, intervalDays = 0, rating }) {
  const q = Number(rating);
  if (isNaN(q) || q < 0 || q > 5) {
    throw new Error('Rating must be an integer between 0 and 5.');
  }

  let nextEF = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (nextEF < 1.3) {
    nextEF = 1.3;
  }
  // Keep 2 decimal places precision for cleanliness
  nextEF = Math.round(nextEF * 100) / 100;

  let nextRepetitions = repetitions;
  let nextInterval = intervalDays;

  if (q < 3) {
    // Failed recall: reset repetitions to 0 and review again tomorrow
    nextRepetitions = 0;
    nextInterval = 1;
  } else {
    // Successful recall
    if (repetitions === 0) {
      nextInterval = 1;
    } else if (repetitions === 1) {
      nextInterval = 6;
    } else {
      nextInterval = Math.round(intervalDays * nextEF);
      if (nextInterval <= intervalDays) {
        nextInterval = intervalDays + 1;
      }
    }
    nextRepetitions = repetitions + 1;
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);
  // Set to start of that day
  nextReviewDate.setHours(0, 0, 0, 0);

  return {
    easeFactor: nextEF,
    repetitions: nextRepetitions,
    intervalDays: nextInterval,
    nextReviewDate,
  };
}

module.exports = {
  calculateSM2,
};
