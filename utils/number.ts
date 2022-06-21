export function isValidAmount(amt: string, positive = true) {
  const n = Number(amt)
  return (n && n > 0) || (!positive && n === 0)
}
