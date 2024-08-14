export function startsWithCapital(str: string): boolean {
  return /^\p{Lu}/u.test(str);
}
