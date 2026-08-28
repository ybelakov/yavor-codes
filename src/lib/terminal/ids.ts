let counter = 0;
export function nextEntryId(): string {
  counter += 1;
  return `e${counter}`;
}
