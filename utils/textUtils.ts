export function toUpperCase(value: string | null | undefined): string {
  return (value ?? "").toString().toUpperCase()
}
