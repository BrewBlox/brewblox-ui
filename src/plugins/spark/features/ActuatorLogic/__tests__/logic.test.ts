import { sanitize, syntaxCheck } from '../helpers';

describe('Sanitize expression strings', () => {
  it('should remove invalid characters', () => {
    expect(sanitize('123(67A|B)!z@#$%^&*-=_+?<>;\n  ')).toBe('(A|B)!z^&');
    expect(sanitize('          ')).toBe('');
  });
});

describe('Check symbol syntax', () => {
  it('should check bracket balance', () => {
    expect(syntaxCheck('(A)')).toBe(null);
    expect(syntaxCheck('(A&a)|A')).toBe(null);
    expect(syntaxCheck(')(')).toMatchObject({ index: 0 });
    expect(syntaxCheck('(A&a)|(A')).toMatchObject({ index: 7 });
    expect(syntaxCheck('(A&a))')).toMatchObject({ index: 5 });
  });

  it('should check empty brackets', () => {
    expect(syntaxCheck('()')).toMatchObject({ index: 1 });
    expect(syntaxCheck('(a)|()')).toMatchObject({ index: 5 });
  });

  it('should check nested comparisons', () => {
    expect(syntaxCheck('((a)|(A&B))')).toBe(null);
    expect(syntaxCheck('((a)|(A&B)')).toMatchObject({ index: 9 });
  });

  it('should check subsequent characters', () => {
    expect(syntaxCheck('AA')).toMatchObject({ index: 1 });
    expect(syntaxCheck('!!A')).toBe(null);
    expect(syntaxCheck('!!A!')).toMatchObject({ index: 3 });
    expect(syntaxCheck('a|!!&A')).toMatchObject({ index: 4 });
    expect(syntaxCheck('A&|A')).toMatchObject({ index: 2 });
    expect(syntaxCheck('(A&A)a')).toMatchObject({ index: 5 });
    expect(syntaxCheck('(A)!')).toMatchObject({ index: 3 });
    expect(syntaxCheck('a&')).toMatchObject({ index: 1 });
  });
});
