export function formatSigned(value: string | number) {
  const number = Number(value);
  if (number > 0) return `+${number}`;
  return String(number);
}
