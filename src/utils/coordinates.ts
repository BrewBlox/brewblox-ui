import isFinite from 'lodash/isFinite';
import round from 'lodash/round';
import { clampRotation } from './quantity';

export type CoordinatesParam =
  | string
  | { x: number; y: number; z: number }
  | [number, number, number] // [x, y, z]
  | Coordinates;

export const rotatedSize = (
  rotation: number,
  size: [number, number],
): [number, number] =>
  clampRotation(rotation) % 180 > 0 ? [size[1], size[0]] : [size[0], size[1]];

export class Coordinates {
  public readonly x: number;
  public readonly y: number;
  public readonly z: number;

  /*
   * A general introduction to how shape coordinates are handled:
   *
   * Shapes are placed on a grid. A shape is always rectangular, but does not have to be square.
   * A shape consists of one or more squares.
   * A square is always 1x1, and all four corners of a square have integer coordinates.
   *
   * The top left corner (lowest value x / y) of a shape or square is the anchor.
   * As the anchor is a square corner, its coordinates are always integer values.
   * We can infer that the center of a square always is [anchor.x + 0.5, anchor.y + 0.5].
   *
   * Edge points are indeterminate positions on the grid.
   * Their coordinates values can be decimal in both X and Y.
   *
   * When rotating shapes, the shape anchor always retains the same global coordinates.
   * Because all corners of squares must have integer coordinates,
   * the smallest possible rotation is 90 degrees.
   *
   * To rotate a shape, we first rotate the shape around its anchor coordinate,
   * and then shift it until the new anchor is at the same place as the old anchor.
   *
   * This shift will only ever be in the positive direction, on either or both X and Y axes.
   * A small example of rotating a 3x2 shape 90 degrees:
   *
   * X marks the anchor position.
   *
   *  Start:
   *              X
   *               1 2 3
   *               4 5 6
   *
   *  Rotate:
   *              X
   *           4 1
   *           5 2
   *           6 3
   *
   *  Shift:
   *              X
   *               4 1
   *               5 2
   *               6 3
   */

  public constructor(param: CoordinatesParam) {
    if (typeof param === 'string') {
      [this.x, this.y, this.z] = param.split(',').map(Number);
    } else if (Array.isArray(param)) {
      [this.x, this.y, this.z] = param;
    } else if (typeof param === 'object') {
      this.x = param.x;
      this.y = param.y;
      this.z = param.z;
    } else {
      throw new Error(`${param} is not a valid argument`);
    }

    if ([this.x, this.y, this.z].some((v) => !isFinite(v))) {
      throw new Error(`${param} could not be parsed as a coordinate`);
    }

    this.x = round(this.x, 3);
    this.y = round(this.y, 3);
    this.z = round(this.z, 3);
  }

  private isException(): boolean {
    return this.z < 0; // negative Z values are used for static objects that should not move
  }

  public rotate(
    rotate: number,
    pivot: CoordinatesParam = [0.5, 0.5, 0],
  ): Coordinates {
    const rotation = clampRotation(rotate);

    if (this.isException() || rotation === 0) {
      return new Coordinates(this);
    }

    const pivotCoord = new Coordinates(pivot);

    const s = Math.sin((rotation * Math.PI) / 180);
    const c = Math.cos((rotation * Math.PI) / 180);

    const shiftX = this.x - pivotCoord.x;
    const shiftY = this.y - pivotCoord.y;

    const x = shiftX * c - shiftY * s + pivotCoord.x;
    const y = shiftX * s + shiftY * c + pivotCoord.y;

    return new Coordinates([+x.toFixed(1), +y.toFixed(1), this.z]);
  }

  public translate(offset: CoordinatesParam): Coordinates {
    if (this.isException()) {
      return new Coordinates(this);
    }

    const offsetCoord = new Coordinates(offset);

    return new Coordinates([
      this.x + offsetCoord.x,
      this.y + offsetCoord.y,
      this.z,
    ]);
  }

  public rotateShapeSquare(
    rotate: number,
    shapeRotation: number,
    shapeSize: [number, number],
    shapeCoordinates: CoordinatesParam = [0, 0, 0],
  ): Coordinates {
    const rotation = clampRotation(rotate);
    const totalRotation = clampRotation(rotation + shapeRotation);

    if (this.isException() || rotation === 0) {
      return new Coordinates(this);
    }

    // Step 1 - start
    const shapeAnchor = new Coordinates(shapeCoordinates);
    const [newSizeX, newSizeY] = rotatedSize(totalRotation, shapeSize);

    // Step 2 - shift from square anchor (this) to center
    const rotatedSquareCenter = this.translate([0.5, 0.5, 0])
      // Step 3 - rotate around shape anchor
      .rotate(rotation, shapeAnchor);

    const rotatedSquareAnchor = rotatedSquareCenter
      // Step 4 - shift until new shape anchor has the same coordinates as the old anchor
      .translate([
        rotatedSquareCenter.x < shapeAnchor.x ? newSizeX : 0,
        rotatedSquareCenter.y < shapeAnchor.y ? newSizeY : 0,
        0,
      ])
      // Step 5 - shift back from square center to square anchor
      .translate([-0.5, -0.5, 0]);

    return rotatedSquareAnchor;
  }

  public rotateShapeEdge(
    rotate: number,
    shapeRotation: number,
    shapeSize: [number, number],
    shapeCoordinates: CoordinatesParam = [0, 0, 0],
  ): Coordinates {
    const rotation = clampRotation(rotate);

    if (this.isException() || rotation === 0) {
      return new Coordinates(this);
    }

    // Step 1 - Shift left/up to square anchor
    const squareAnchor = new Coordinates([
      Math.floor(this.x),
      Math.floor(this.y),
      0,
    ]);
    const shiftX = squareAnchor.x - this.x;
    const shiftY = squareAnchor.y - this.y;

    // Step 2 - Rotate square around shape anchor
    const rotatedSquareAnchor = squareAnchor.rotateShapeSquare(
      rotation,
      shapeRotation,
      shapeSize,
      shapeCoordinates,
    );

    // Step 3 - Unshift from square anchor
    const rotatedEdge = rotatedSquareAnchor
      .translate([-shiftX, -shiftY, 0])
      // Step 4 - Rotate around square center
      .rotate(rotation, rotatedSquareAnchor.translate([0.5, 0.5, 0]));

    return rotatedEdge;
  }

  public flipShapeEdge(
    flip: boolean, // allows chained syntax with optional flips
    shapeRotation: number,
    shapeSize: [number, number],
    shapeCoordinates: CoordinatesParam = [0, 0, 0],
  ): Coordinates {
    if (this.isException() || !flip) {
      return new Coordinates(this);
    }

    // Step 1 - start
    const shape = new Coordinates(shapeCoordinates);

    // Step 2 - shift in X past the midpoint
    const [sizeX] = rotatedSize(shapeRotation, shapeSize);
    const shiftX = (shape.x + sizeX / 2 - this.x) * 2;
    const flippedEdge = this.translate([shiftX, 0, 0]);

    return flippedEdge;
  }

  public subSquares(
    squares: CoordinatesParam[],
    shapeRotation: number,
    shapeSize: [number, number],
  ): Coordinates[] {
    return squares.map((square) =>
      new Coordinates(square)
        .rotateShapeSquare(shapeRotation, 0, shapeSize)
        .translate(this),
    );
  }

  public toString(): string {
    return `${this.x},${this.y},${this.z}`;
  }

  public values(): [number, number, number] {
    return [this.x, this.y, this.z];
  }

  public raw(): { x: number; y: number; z: number } {
    return { x: this.x, y: this.y, z: this.z };
  }

  public equals(other: Coordinates): boolean {
    return ['x', 'y', 'z'].every((k) => this[k] === other[k]);
  }
}
