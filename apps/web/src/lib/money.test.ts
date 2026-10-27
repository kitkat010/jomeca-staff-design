import { describe, expect, it } from 'vitest';
import { centavosFromInput } from './money';

describe('staff currency entry', () => {
  it('converts decimal pesos to integer centavos without floating-point multiplication', () => {
    expect(centavosFromInput('12.34')).toBe(1234);
    expect(centavosFromInput('0.01')).toBe(1);
    expect(centavosFromInput('500')).toBe(50000);
  });
  it('rejects negative, scientific, and sub-centavo input', () => {
    for (const value of ['-1', '1e3', '12.345', ''])
      expect(() => centavosFromInput(value)).toThrow();
  });
});
