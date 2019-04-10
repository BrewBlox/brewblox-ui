import { clampRotation } from './functional';
import isEqual from 'lodash/isEqual';

export type CoordinatesParam =
  string | { x: number; y: number; z: number } | [number, number, number] | Coordinates;

export class Coordinates {
  public readonly x: number;
  public readonly y: number;
  public readonly z: number;

  public constructor(param: CoordinatesParam) {
    if (typeof param === 'string') {
      [this.x, this.y, this.z] = param.split(',').map(Number);
    }

    else if (Array.isArray(param)) {
      [this.x, this.y, this.z] = param;
    }

    else if (typeof param === 'object') {
      this.x = param.x;
      this.y = param.y;
      this.z = param.z;
    }

    else {
      throw new Error(`${param} is not a valid argument`);
    }

    const rules = [
      (v: number) => typeof v === 'number',
      (v: number) => !Number.isNaN(v),
    ];

    if (!rules.every(rule => [this.x, this.y, this.z].every(v => rule(v)))) {
      throw new Error(`${param} could not be parsed as a coordinate`);
    }
  }

  private isException(): boolean {
    return this.z < 0; // negative Z values are used for static objects that should not move
  }

  public rotate(rotation: number, pivot: CoordinatesParam = [0.5, 0.5, 0]): Coordinates {
    rotation = clampRotation(rotation);

    if (this.isException() || rotation === 0) {
      return new Coordinates(this);
    }

    const pivotCoord = new Coordinates(pivot);

    const s = Math.sin(rotation * Math.PI / 180);
    const c = Math.cos(rotation * Math.PI / 180);

    const shiftX = this.x - pivotCoord.x;
    const shiftY = this.y - pivotCoord.y;

    const x = (shiftX * c - shiftY * s) + pivotCoord.x;
    const y = (shiftX * s + shiftY * c) + pivotCoord.y;

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

  public rotateSquare(
    rotation: number,
    currentRotation: number,
    size: [number, number],
    coordinatesWithinShape: CoordinatesParam = [0, 0, 0]
  ): Coordinates {
    rotation = clampRotation(rotation);

    if (this.isException() || rotation === 0 || isEqual(size, [1, 1])) {
      return new Coordinates(this);
    }

    // An example:
    //
    // rotation = 180
    // currentRotation = 0
    //
    // XXX is a square with offset [0, 0]
    // YYY is a square with offset [2, 1]
    //  @  is the anchor of the XXX square - its coordinates in the global grid
    //  O  is the shape center
    //
    // Before:
    //
    //     @---------------+
    //     |XXX|   |   |   |
    //     |XXX|   |   |   |
    //     +-------O-------+
    //     |   |   |YYY|   |
    //     |   |   |YYY|   |
    //     +---------------+
    //
    // After:
    //
    //     +---------------+
    //     |   |YYY|   |   |
    //     |   |YYY|   |   |
    //     +-------O---@---+
    //     |   |   |   |XXX|
    //     |   |   |   |XXX|
    //     +---------------+

    const squareCenter = this
      .translate([0.5, 0.5, 0]);

    const shapeEdge = this
      .rotate(currentRotation, squareCenter);

    const [sizeX, sizeY] = size;
    const offset = new Coordinates(coordinatesWithinShape);

    const shapeCenter = shapeEdge
      .translate([(sizeX / 2 - offset.x), (sizeY / 2 - offset.y), 0])
      .rotate(currentRotation, shapeEdge);

    const newSquareCenter = squareCenter
      .rotate(rotation, shapeCenter);

    // We want two things:
    // - The shape must snap to grid
    //    => integer coordinates
    // - After a 360 rotation, the shape must return to starting coordinates
    //    => alternate ceil and floor
    const roundFunc =
      (clampRotation(currentRotation + rotation) / 90) % 2
        ? Math.ceil
        : Math.floor;

    return new Coordinates([
      roundFunc(newSquareCenter.x - 0.5),
      roundFunc(newSquareCenter.y - 0.5),
      this.z,
    ]);
  }

  public rotateSquareEdge(
    rotation: number,
    shapeAnchor: CoordinatesParam,
    shapeRotation: number,
    shapeSize: [number, number],
  ): Coordinates {
    rotation = clampRotation(rotation);

    if (this.isException() || rotation === 0) {
      return new Coordinates(this);
    }

    // An example:
    //
    // rotation = 180
    // this.values() = 0.5,0,0
    // shapeAnchor = 0,0,0
    // shapeRotation = 0
    // shapeSize = [4, 2]
    //
    //  @  is the rotated edge
    //  O  is the shape center
    //
    // Note that we're taking rotateSquare behavior into account
    // Relevant is how shapes with an odd length are treated:
    // the value is alternatively rounded up and down
    //
    // Before:
    //
    //     +-@-------------+
    //     |   |   |   |   |
    //     |   |   |   |   |
    //     +-------O-------+
    //     |   |   |   |   |
    //     |   |   |   |   |
    //     +---------------+
    //
    // After:
    //
    //     +---------------+
    //     |   |   |   |   |
    //     |   |   |   |   |
    //     +-------O-------+
    //     |   |   |   |   |
    //     |   |   |   |   |
    //     +-------------@-+
    //
    // Steps:
    // 1 - Start position
    // 2 - Shift left/up to the anchor position of the current square
    // 3 - Rotate the full shape, treating the current square as a shape subsquare
    // 4 - Unshift from the anchor position
    // 5 - Rotate the unshifted position around the center of the subsquare
    //
    //     2-1-------------+
    //     |   |   |   |   |
    //     |   |   |   |   |
    //     +-------O---3-4-+
    //     |   |   |   |   |
    //     |   |   |   |   |
    //     +-------------5-+

    // Step 1 - start position
    const edge = this;
    const shape = new Coordinates(shapeAnchor);

    // Step 2 - Shift left/up to the anchor position of the current square
    const anchor = new Coordinates([Math.floor(edge.x), Math.floor(edge.y), 0]);
    const shiftX = anchor.x - edge.x;
    const shiftY = anchor.y - edge.y;

    // Step 3 - Rotate the full shape, treating current square as shape subsquare
    const coordinatesWithinShape = anchor
      .translate([-shape.x, -shape.y, 0]);
    const rotatedSquareAnchor = anchor
      .rotateSquare(rotation, shapeRotation, shapeSize, coordinatesWithinShape);

    // Step 4 - Unshift coordinates
    const unshiftedAnchor = rotatedSquareAnchor
      .translate([-shiftX, -shiftY, 0]);

    // Step 5 - Rotate around center of subsquare
    const squareCenter = rotatedSquareAnchor
      .translate([0.5, 0.5, 0]);
    const rotatedEdge = unshiftedAnchor
      .rotate(rotation, squareCenter);

    // Step 6 - Profit
    return new Coordinates([
      rotatedEdge.x,
      rotatedEdge.y,
      this.z,
    ]);
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
    return ['x', 'y', 'z'].every(k => this[k] === other[k]);
  }
}
