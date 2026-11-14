/**
 * Deteksi pola input anomali / macro bot berdasarkan latensi input berturut-turut.
 * Jika delta waktu antar input < thresholdMs secara berulang (>= requiredConsecutive),
 * dianggap sebagai macro auto-clicker.
 */
export function isMacroAnomaly(
  deltaMs: number,
  consecutiveCount: number,
  thresholdMs = 130,
  requiredConsecutive = 3
): { isAnomaly: boolean; newCount: number } {
  if (deltaMs > 0 && deltaMs < thresholdMs) {
    const nextCount = consecutiveCount + 1;
    if (nextCount >= requiredConsecutive) {
      return { isAnomaly: true, newCount: 0 };
    }
    return { isAnomaly: false, newCount: nextCount };
  }
  return { isAnomaly: false, newCount: 0 };
}
