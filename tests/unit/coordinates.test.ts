import { Coordinates } from '@/helpers/coordinates';

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
    expect(new Coordinates({ x: -1, y: -2, z: 0 }).values()).toEqual([-1, -2, 0]);
    expect(new Coordinates({ x: -1, y: -2, z: 1 }).values()).toEqual([-1, -2, 1]);
    expect(new Coordinates({ x: -1, y: -2, z: -1 }).values()).toEqual([-1, -2, -1]);
  });

  it('Should convert to strings', () => {
    [
      '1,20,1',
      '0.5,2,-1',
      '-1,100.2,0',
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
    expect(new Coordinates('1,1,0').rotate(90).values()).toEqual([0, 1, 0]);
    expect(new Coordinates('0.5,0,0').rotate(-90).values()).toEqual([0, 0.5, 0]);
  });

  it('Should rotate bigger fields', () => {
    expect(new Coordinates('1,0,0').rotate(90, [1, 1, 0]).values()).toEqual([2, 1, 0]);
    expect(new Coordinates('1,0,0').rotate(270, [1, 1, 0]).values()).toEqual([0, 1, 0]);
  });

  it('Should rotate squares', () => {
    // from 0
    expect(
      new Coordinates([2, 2, 0])
        .rotateSquare(90, 0, [4, 2])
        .values()
    )
      .toEqual([4, 1, 0]);

    // CCW
    expect(
      new Coordinates([2, 2, 0])
        .rotateSquare(-90, 0, [4, 2])
        .values()
    )
      .toEqual([3, 4, 0]);

    // intermediate value
    expect(
      new Coordinates([4, 1, 0])
        .rotateSquare(90, 90, [4, 2])
        .values()
    )
      .toEqual([5, 3, 0]);

    // full rotation
    expect(
      new Coordinates([2, 2, 0])
        .rotateSquare(90, 0, [4, 2])
        .rotateSquare(90, 90, [4, 2])
        .rotateSquare(90, 180, [4, 2])
        .rotateSquare(90, 270, [4, 2])
        .values()
    )
      .toEqual([2, 2, 0]);
  });

  it('Should rotate squares with odd length', () => {
    // from 0
    expect(
      new Coordinates([2, 2, 0])
        .rotateSquare(90, 0, [3, 2])
        .values()
    )
      .toEqual([4, 2, 0]);

    // full rotation
    expect(
      new Coordinates([2, 2, 0])
        .rotateSquare(90, 0, [3, 2])
        .rotateSquare(90, 90, [3, 2])
        .rotateSquare(90, 180, [3, 2])
        .rotateSquare(90, 270, [3, 2])
        .values()
    )
      .toEqual([2, 2, 0]);
  });

  it('Should rotate offset squares', () => {
    // from 0
    expect(
      new Coordinates([3, 3, 0])
        .rotateSquare(90, 0, [4, 2], [1, 1, 0])
        .values()
    )
      .toEqual([3, 2, 0]);

    // CCW
    expect(
      new Coordinates([3, 3, 0])
        .rotateSquare(-90, 0, [4, 2], [1, 1, 0])
        .values()
    )
      .toEqual([4, 3, 0]);

    // intermediate value
    expect(
      new Coordinates([3, 2, 0])
        .rotateSquare(90, 90, [4, 2], [1, 1, 0])
        .values()
    )
      .toEqual([4, 2, 0]);

    // full rotation
    expect(
      new Coordinates([3, 3, 0])
        .rotateSquare(90, 0, [4, 2], [1, 1, 0])
        .rotateSquare(90, 90, [4, 2], [1, 1, 0])
        .rotateSquare(90, 180, [4, 2], [1, 1, 0])
        .rotateSquare(90, 270, [4, 2], [1, 1, 0])
        .values()
    )
      .toEqual([3, 3, 0]);
  });

  it('Should not rotate exceptions', () => {
    expect(
      new Coordinates([3, 3, -1])
        .rotateSquare(90, 0, [2, 2])
        .values()
    )
      .toEqual([3, 3, -1]);
  });

  it('Should rotate square edges CW', () => {

    expect(
      new Coordinates([0, 0.5, 0])
        .rotateSquareEdge(90, [0, 0, 0], 0, [3, 2])
        .values()
    )
      .toEqual([2.5, 0, 0]);
  });

  it('Should rotate square edges CCW', () => {
    expect(
      new Coordinates([0, 0.5, 0])
        .rotateSquareEdge(-90, [0, 0, 0], 0, [3, 2])
        .values()
    )
      .toEqual([1.5, 3, 0]);
  });

  it('Should rotate square edges CW from an intermediate rotation', () => {
    expect(
      new Coordinates([2.5, 0, 0])
        .rotateSquareEdge(90, [2, 0, 0], 90, [3, 2])
        .values()
    )
      .toEqual([3, 1.5, 0]);
  });

  it('should rotate square edges through a full rotation', () => {
    expect(
      new Coordinates([0, 0.5, 0])
        .rotateSquareEdge(90, [0, 0, 0], 0, [3, 2])
        .rotateSquareEdge(90, [2, 0, 0], 90, [3, 2])
        .rotateSquareEdge(90, [2, 1, 0], 180, [3, 2])
        .rotateSquareEdge(90, [2, 2, 0], 270, [3, 2])
    );
  });
});
