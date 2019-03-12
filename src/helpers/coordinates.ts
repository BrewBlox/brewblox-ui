import { clampRotation } from './functional';
import isEqual from 'lodash/isEqual';

type CoordinatesParam = string | { x: number; y: number } | [number, number] | Coordinates;

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

  public rotate(rotation: number, pivot: CoordinatesParam = [0.5, 0.5]): Coordinates {
    if (!rotation) {
      return this;
    }
    if (this.x < 0 || this.y < 0) {
      return this; // exclude negative coordinates which are used for exceptions
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
    if (this.x < 0 || this.y < 0) {
      return this; // exclude negative coordinates which are used for exceptions
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
    const [sizeX, sizeY] = size;
    const offset = new Coordinates(coordinatesWithinShape);

    if (this.x < 0 || this.y < 0) {
      return this; // exclude negative coordinates which are used for exceptions
    }

    if (rotation === 0 || (sizeX === 1 && sizeY === 1)) {
      return this;
    }

    const anchorCenter = new Coordinates(this)
      .translate([0.5, 0.5]);

    const shapeEdge = new Coordinates(this)
      .rotate(currentRotation, anchorCenter);

    const shapeCenter = new Coordinates(shapeEdge)
      .translate([(0.5 * sizeX) - offset.x, (0.5 * sizeY) - offset.y])
      .rotate(currentRotation, shapeEdge);

    const newAnchorCenter = new Coordinates(anchorCenter)
      .rotate(rotation, shapeCenter);

    // We want two things:
    // - The shape must snap to grid
    //    => integer coordinates
    // - After a 360 rotation, the shape must return to starting coordinates
    //    => alternate round and floor
    const roundFunc =
      (clampRotation(currentRotation + rotation) / 90) % 2
        ? Math.round
        : Math.floor;

    this.x = roundFunc(newAnchorCenter.x - 0.5);
    this.y = roundFunc(newAnchorCenter.y - 0.5);

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

