import { clampRotation } from './functional';
import isEqual from 'lodash/isEqual';

export type CoordinatesParam = string | { x: number; y: number } | [number, number] | Coordinates;

export class Coordinates {
  public x: number;
  public y: number;

  public constructor(param: CoordinatesParam) {
    if (typeof param === 'string') {
      [this.x, this.y] = param.split(',').map(Number);
    }

    else if (Array.isArray(param)) {
      [this.x, this.y] = param;
    }

    else if (typeof param === 'object') {
      this.x = param.x;
      this.y = param.y;
    }

    else {
      throw new Error(`${param} is not a valid argument`);
    }

    if (typeof this.x !== 'number' || Number.isNaN(this.x)
      || typeof this.y !== 'number' || Number.isNaN(this.y)) {
      throw new Error(`${param} could not be parsed as a coordinate`);
    }
  }

  private isException(): boolean {
    return this.x < 0 || this.y < 0; // exclude negative coordinates which are used for exceptions
  }

  public rotate(rotation: number, pivot: CoordinatesParam = [0.5, 0.5]): Coordinates {
    rotation = clampRotation(rotation);

    if (this.isException() || rotation === 0) {
      return this;
    }

    const pivotCoord = new Coordinates(pivot);

    const s = Math.sin(rotation * Math.PI / 180);
    const c = Math.cos(rotation * Math.PI / 180);

    this.x -= pivotCoord.x;
    this.y -= pivotCoord.y;

    const x = (this.x * c - this.y * s) + pivotCoord.x;
    const y = (this.x * s + this.y * c) + pivotCoord.y;

    this.x = +x.toFixed(1);
    this.y = +y.toFixed(1);

    return this;
  }

  public translate(offset: CoordinatesParam): Coordinates {
    if (this.isException()) {
      return this;
    }

    const offsetCoord = new Coordinates(offset);
    this.x += offsetCoord.x;
    this.y += offsetCoord.y;

    return this;
  }

  public rotateSquare(
    rotation: number,
    currentRotation: number,
    size: [number, number],
    coordinatesWithinShape: CoordinatesParam = [0, 0]
  ): Coordinates {
    rotation = clampRotation(rotation);

    if (this.isException() || rotation === 0 || isEqual(size, [1, 1])) {
      return this;
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

    const squareCenter = new Coordinates(this)
      .translate([0.5, 0.5]);

    const shapeEdge = new Coordinates(this)
      .rotate(currentRotation, squareCenter);

    const [sizeX, sizeY] = size;
    const offset = new Coordinates(coordinatesWithinShape);

    const shapeCenter = new Coordinates(shapeEdge)
      .translate([(0.5 * sizeX) - offset.x, (0.5 * sizeY) - offset.y])
      .rotate(currentRotation, shapeEdge);

    const newSquareCenter = new Coordinates(squareCenter)
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

    this.x = roundFunc(newSquareCenter.x - 0.5);
    this.y = roundFunc(newSquareCenter.y - 0.5);

    return this;
  }

  public toString(): string {
    return `${this.x},${this.y}`;
  }

  public values(): [number, number] {
    return [this.x, this.y];
  }

  public raw(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  public equals(other: Coordinates): boolean {
    return this.x === other.x && this.y === other.y;
  }
}

