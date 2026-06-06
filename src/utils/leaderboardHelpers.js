/**
 * Sort an array of objects by a numeric field, descending.
 * Returns a new sorted array (does not mutate the input).
 */
export function sortByFieldDesc(list, field) {
  return [...list].sort((a, b) => b[field] - a[field]);
}

/**
 * Aggregate star counts across all assignments and return a sorted
 * leaderboard: [{ name, count }, …] ordered by count descending.
 */
export function buildStarLeaderboard(assignments) {
  const counts = {};

  for (const a of assignments) {
    for (const name of a.first5Stars || []) {
      counts[name] = (counts[name] || 0) + 1;
    }
  }

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
