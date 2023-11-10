import { describe, expect, it } from 'vitest';
import { Coordinates } from '@/utils/coordinates';

describe('coordinates', () => {
  it('Should parse strings', () => {
    expect(new Coordinates('1,20,0').values()).toEqual([1, 20, 0]);
    expect(new Coordinates('0.5,2,0').values()).toEqual([0.5, 2, 0]);
    expect(new Coordinates('-1,-2,0').values()).toEqual([-1, -2, 0]);
    expect(new Coordinates('1,-10.2,0').values()).toEqual([1, -10.2, 0]);
    expect(new Coordinates('1,2,3,4').values()).toEqual([1, 2, 3]);
  });

  it('Should parse arrays', () => {
    expect(new Coordinates([1, 2, 0]).values()).toEqual([1, 2, 0]);
    expect(new Coordinates([-1, -2, 0]).values()).toEqual([-1, -2, 0]);
    expect(new Coordinates([-1, -2, -1]).values()).toEqual([-1, -2, -1]);
    expect(new Coordinates([-1, -2, 1]).values()).toEqual([-1, -2, 1]);
  });

  it('Should parse objects', () => {
    expect(new Coordinates({ x: 1, y: 2, z: 0 }).values()).toEqual([1, 2, 0]);
    expect(new Coordinates({ x: -1, y: -2, z: 0 }).values()).toEqual([
      -1, -2, 0,
    ]);
    expect(new Coordinates({ x: -1, y: -2, z: 1 }).values()).toEqual([
      -1, -2, 1,
    ]);
    expect(new Coordinates({ x: -1, y: -2, z: -1 }).values()).toEqual([
      -1, -2, -1,
    ]);
  });

  it('Should convert to strings', () => {
    ['1,20,1', '0.5,2,-1', '-1,100.2,0'].forEach((s) =>
      expect(new Coordinates(s).toString()).toEqual(s),
    );
  });

  it('Should throw on invalid input', () => {
    expect(() => new Coordinates('string')).toThrow();
    expect(() => new Coordinates({} as any)).toThrow();
    expect(() => new Coordinates({ x: 'string', y: 1 } as any)).toThrow();
    expect(() => new Coordinates(['str', 1] as any)).toThrow();
  });

  it('Should rotate', () => {
    expect(new Coordinates('1,1,0').rotate(90).values()).toEqual([0, 1, 0]);
    expect(new Coordinates('0.5,0,0').rotate(-90).values()).toEqual([
      0, 0.5, 0,
    ]);
  });

  it('Should rotate bigger fields', () => {
    expect(new Coordinates('1,0,0').rotate(90, [1, 1, 0]).values()).toEqual([
      2, 1, 0,
    ]);
    expect(new Coordinates('1,0,0').rotate(270, [1, 1, 0]).values()).toEqual([
      0, 1, 0,
    ]);
  });

  it('Should rotate squares in a shape CW', () => {
    expect(
      new Coordinates([2, 0, 0])
        .rotateShapeSquare(90, 0, { width: 3, height: 2 })
        .values(),
    ).toEqual([1, 2, 0]);
  });

  it('Should rotate squares in a shape CCW', () => {
    expect(
      new Coordinates([2, 0, 0])
        .rotateShapeSquare(-90, 0, { width: 3, height: 2 })
        .values(),
    ).toEqual([0, 0, 0]);
  });

  it('Should rotate squares in a shape CW from intermediate rotations', () => {
    expect(
      new Coordinates([1, 2, 0])
        .rotateShapeSquare(90, 90, { width: 3, height: 2 })
        .values(),
    ).toEqual([0, 1, 0]);

    expect(
      new Coordinates([1, 2, 0])
        .rotateShapeSquare(180, 90, { width: 3, height: 2 })
        .values(),
    ).toEqual([0, 0, 0]);
  });

  it('Should end up at the original coordinates after a full rotation', () => {
    expect(
      new Coordinates([1, 1, 0])
        .rotateShapeSquare(90, 0, { width: 3, height: 2 })
        .rotateShapeSquare(90, 90, { width: 3, height: 2 })
        .rotateShapeSquare(90, 180, { width: 3, height: 2 })
        .rotateShapeSquare(90, 270, { width: 3, height: 2 })
        .values(),
    ).toEqual([1, 1, 0]);

    expect(
      new Coordinates([1, 1, 0])
        .rotateShapeSquare(-90, 0, { width: 3, height: 2 })
        .rotateShapeSquare(-90, -90, { width: 3, height: 2 })
        .rotateShapeSquare(-90, -180, { width: 3, height: 2 })
        .rotateShapeSquare(-90, -270, { width: 3, height: 2 })
        .values(),
    ).toEqual([1, 1, 0]);
  });

  it('Should correctly rotate non-origin shapes', () => {
    expect(
      new Coordinates([12, 15, 0])
        .rotateShapeSquare(90, 0, { width: 3, height: 2 }, [10, 15, 0])
        .values(),
    ).toEqual([11, 17, 0]);
  });

  it('Should not rotate exceptions', () => {
    expect(
      new Coordinates([1, 1, -1])
        .rotateShapeSquare(90, 0, { width: 3, height: 2 })
        .values(),
    ).toEqual([1, 1, -1]);
  });

  it('Should ignore shape anchor exceptions', () => {
    expect(
      new Coordinates([12, 15, 0])
        .rotateShapeSquare(90, 0, { width: 3, height: 2 }, [10, 15, -1])
        .values(),
    ).toEqual([11, 17, 0]);
  });

  it('Should rotate square edges CW', () => {
    expect(
      new Coordinates([1.5, 0, 0])
        .rotateShapeEdge(90, 0, { width: 3, height: 2 })
        .values(),
    ).toEqual([2, 1.5, 0]);
  });

  it('Should rotate square edges CCW', () => {
    expect(
      new Coordinates([1.5, 0, 0])
        .rotateShapeEdge(-90, 0, { width: 3, height: 2 })
        .values(),
    ).toEqual([0, 1.5, 0]);
  });

  it('Should rotate square edges from an intermediate rotation', () => {
    expect(
      new Coordinates([2, 1.5, 0])
        .rotateShapeEdge(90, 90, { width: 3, height: 2 })
        .values(),
    ).toEqual([1.5, 2, 0]);
  });

  it('Should end up at original edge coordinates after a full rotation', () => {
    expect(
      new Coordinates([1.5, 0, 0])
        .rotateShapeEdge(90, 0, { width: 3, height: 2 })
        .rotateShapeEdge(90, 90, { width: 3, height: 2 })
        .rotateShapeEdge(90, 180, { width: 3, height: 2 })
        .rotateShapeEdge(90, 270, { width: 3, height: 2 })
        .values(),
    ).toEqual([1.5, 0, 0]);

    expect(
      new Coordinates([1.5, 0, 0])
        .rotateShapeEdge(-90, 0, { width: 3, height: 2 })
        .rotateShapeEdge(-90, -90, { width: 3, height: 2 })
        .rotateShapeEdge(-90, -180, { width: 3, height: 2 })
        .rotateShapeEdge(-90, -270, { width: 3, height: 2 })
        .values(),
    ).toEqual([1.5, 0, 0]);
  });

  it('Should not rotate edge exceptions', () => {
    expect(
      new Coordinates([1.5, 0, -1])
        .rotateShapeEdge(90, 0, { width: 3, height: 2 })
        .values(),
    ).toEqual([1.5, 0, -1]);
  });
});
