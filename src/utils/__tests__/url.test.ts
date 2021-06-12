import {
  isAbsoluteUrl,
  isUrlSafe,
  makeUrlSafe,
} from '@/utils/url';

describe('URL utils', () => {

  it('Should recognize absolute URLs', () => {
    expect(isAbsoluteUrl('http://test')).toBe(true);
    expect(isAbsoluteUrl('localhost')).toBe(false);
    expect(isAbsoluteUrl('www.google.com')).toBe(false);
    expect(isAbsoluteUrl('magic://real')).toBe(true);
  });

  it('Should detect URL safe strings', () => {
    expect(isUrlSafe('yes')).toBe(true);
    expect(isUrlSafe('')).toBe(true);
    expect(isUrlSafe('343234df__sdf_---DFSD~~')).toBe(true);
    expect(isUrlSafe('post-title-with-%C3%A7-and-%C3%B5')).toBe(false);
    expect(isUrlSafe('http://www.google.com')).toBe(false);
  });

  it('Should sanitize URL strings', () => {
    expect(makeUrlSafe('hello world!')).toBe('hello-world-');
    expect(makeUrlSafe('hello        world!')).toBe('hello-world-');
    expect(makeUrlSafe('hello world!', '_')).toBe('hello_world_');
    expect(() => makeUrlSafe('hello world!', '+')).toThrow();
  });
});
