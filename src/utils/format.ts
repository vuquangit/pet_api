export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE').format(value);
}
