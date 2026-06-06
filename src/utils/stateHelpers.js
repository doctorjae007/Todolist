/**
 * Return a new array where the first item matching `predicate`
 * is shallow-merged with `changes`.
 *
 *   updateItemInList(users, u => u.id === 3, { name: "new" })
 */
export function updateItemInList(list, predicate, changes) {
  return list.map((item) => (predicate(item) ? { ...item, ...changes } : item));
}

/**
 * Toggle membership of `value` in an array.
 * Returns the new array and a boolean indicating whether the value was added.
 */
export function toggleInArray(arr, value) {
  const exists = arr.includes(value);
  return [exists ? arr.filter((v) => v !== value) : [...arr, value], !exists];
}
