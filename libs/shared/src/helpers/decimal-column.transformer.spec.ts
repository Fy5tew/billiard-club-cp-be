import { decimalColumnTransformer } from './decimal-column.transformer';

describe('decimalColumnTransformer', () => {
  it('converts decimal strings from the database into numbers', () => {
    expect(decimalColumnTransformer.from('60.00')).toBe(60);
    expect(decimalColumnTransformer.from('3.75')).toBe(3.75);
  });

  it('passes through numeric values and nullish values', () => {
    expect(decimalColumnTransformer.from(15)).toBe(15);
    expect(decimalColumnTransformer.from(null)).toBeNull();
    expect(decimalColumnTransformer.from(undefined)).toBeUndefined();
  });
});
