import { describe, expect, it } from 'vitest';
import { formatDateTime, formatMoney, formatNumber, formatPercent } from '../src/lib/formatters';

describe('formatters', () => {
  it('formats money in USD', () => {
    expect(formatMoney(1234.5)).toContain('$1,234.50');
  });

  it('formats number in en-US', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('formats percent from ratio', () => {
    expect(formatPercent(0.125)).toBe('12.5%');
  });

  it('returns dash for invalid money input', () => {
    expect(formatMoney('invalid')).toBe('—');
  });

  it('returns dash for invalid date', () => {
    expect(formatDateTime('invalid-date')).toBe('—');
  });
});
