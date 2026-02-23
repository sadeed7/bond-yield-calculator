import type { CalculateBondRequest, BondCalculationResult } from './types';

const API_BASE = '/api';

export async function calculateBond(
  body: CalculateBondRequest
): Promise<BondCalculationResult> {
  const res = await fetch(`${API_BASE}/bonds/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string | string[] };
    const msg = Array.isArray(err.message) ? err.message.join(' ') : err.message;
    throw new Error(msg ?? res.statusText);
  }
  return res.json();
}
