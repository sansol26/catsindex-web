/**
 * unit_size, unit_type, unit_price → 화면 표시용 문자열
 * 예: unit_price=12000, unit_type='kg' → "12,000원/kg"
 *     unit_price=150,  unit_type='g'  → "150원/100g"
 *     unit_price=800,  unit_type='L'  → "800원/L"
 *     unit_price=90,   unit_type='ml' → "90원/100ml"
 */
export function formatUnitPrice(
  unit_price: number | null,
  unit_type: string | null
): string | null {
  if (!unit_price || !unit_type) return null;

  const per100 = unit_type === 'g' || unit_type === 'ml';
  const unit = per100 ? `100${unit_type}` : unit_type;
  return `${unit_price.toLocaleString()}원/${unit}`;
}
