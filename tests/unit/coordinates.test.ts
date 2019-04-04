import { Coordinates } from '@/helpers/coordinates';

describe('coordinates', () => {
  it('Should parse strings', () => {
    expect(new Coordinates('1,20').values()).toEqual([1, 20]);
    expect(new Coordinates('0.5,2').values()).toEqual([0.5, 2]);
    expect(new Coordinates('-1,-2').values()).toEqual([-1, -2]);
    expect(new Coordinates('1,-10.2').values()).toEqual([1, -10.2]);
    expect(new Coordinates('1,2,3,4').values()).toEqual([1, 2]);
  });

  it('Should parse arrays', () => {
    expect(new Coordinates([1, 2]).values()).toEqual([1, 2]);
    expect(new Coordinates([-1, -2]).values()).toEqual([-1, -2]);
  });

  it('Should parse objects', () => {
    expect(new Coordinates({ x: 1, y: 2 }).values()).toEqual([1, 2]);
    expect(new Coordinates({ x: -1, y: -2 }).values()).toEqual([-1, -2]);
  });

  it('Should convert to strings', () => {
    [
      '1,20',
      '0.5,2',
      '-1,100.2',
    ]
      .forEach(s => expect(new Coordinates(s).toString()).toEqual(s));
  });

  it('Should throw on invalid input', () => {
    expect(() => new Coordinates('string')).toThrow();
    expect(() => new Coordinates({} as any)).toThrow();
    expect(() => new Coordinates({ x: 'string', y: 1 } as any)).toThrow();
    expect(() => new Coordinates(['str', 1] as any)).toThrow();
  });

  it('Should rotate', () => {
    expect(new Coordinates('1,1').rotate(90).values()).toEqual([0, 1]);
    expect(new Coordinates('0.5,0').rotate(-90).values()).toEqual([0, 0.5]);
  });

  it('Should rotate bigger fields', () => {
    expect(new Coordinates('1,0').rotate(90, [1, 1]).values()).toEqual([2, 1]);
    expect(new Coordinates('1,0').rotate(270, [1, 1]).values()).toEqual([0, 1]);
  });

  it('Should rotate squares', () => {
    // from 0
    expect(
      new Coordinates([2, 2])
        .rotateSquare(90, 0, [4, 2])
        .values()
    )
      .toEqual([4, 1]);

    // CCW
    expect(
      new Coordinates([2, 2])
        .rotateSquare(-90, 0, [4, 2])
        .values()
    )
      .toEqual([3, 4]);

    // intermediate value
    expect(
      new Coordinates([4, 1])
        .rotateSquare(90, 90, [4, 2])
        .values()
    )
      .toEqual([5, 3]);

    // full rotation
    expect(
      new Coordinates([2, 2])
        .rotateSquare(90, 0, [4, 2])
        .rotateSquare(90, 90, [4, 2])
        .rotateSquare(90, 180, [4, 2])
        .rotateSquare(90, 270, [4, 2])
        .values()
    )
      .toEqual([2, 2]);
  });

  it('Should rotate squares with odd length', () => {
    // from 0
    expect(
      new Coordinates([2, 2])
        .rotateSquare(90, 0, [3, 2])
        .values()
    )
      .toEqual([4, 2]);


    // full rotation
    expect(
      new Coordinates([2, 2])
        .rotateSquare(90, 0, [3, 2])
        .rotateSquare(90, 90, [3, 2])
        .rotateSquare(90, 180, [3, 2])
        .rotateSquare(90, 270, [3, 2])
        .values()
    )
      .toEqual([2, 2]);
  });

  it('Should rotate offset squares', () => {
    // from 0
    expect(
      new Coordinates([3, 3])
        .rotateSquare(90, 0, [4, 2], [1, 1])
        .values()
    )
      .toEqual([3, 2]);

    // CCW
    expect(
      new Coordinates([3, 3])
        .rotateSquare(-90, 0, [4, 2], [1, 1])
        .values()
    )
      .toEqual([4, 3]);

    // intermediate value
    expect(
      new Coordinates([3, 2])
        .rotateSquare(90, 90, [4, 2], [1, 1])
        .values()
    )
      .toEqual([4, 2]);

    // full rotation
    expect(
      new Coordinates([3, 3])
        .rotateSquare(90, 0, [4, 2], [1, 1])
        .rotateSquare(90, 90, [4, 2], [1, 1])
        .rotateSquare(90, 180, [4, 2], [1, 1])
        .rotateSquare(90, 270, [4, 2], [1, 1])
        .values()
    )
      .toEqual([3, 3]);
  });

});
