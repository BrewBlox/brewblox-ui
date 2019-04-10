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
    const squareAnchor = this;
    const shapeAnchor = new Coordinates(shapeCoordinates);
    const [newSizeX, newSizeY] = (totalRotation % 180 > 0) ? shapeSize.reverse() : shapeSize;

    const rotatedSquareCenter = squareAnchor
      // Step 2 - shift from square anchor to center
      .translate([0.5, 0.5, 0])
      // Step 3 - rotate around shape origin
      .rotate(rotation, shapeAnchor);

    const rotatedSquareAnchor = rotatedSquareCenter
      // Step 4 - shift until shape anchor will be the same again
      .translate([
        rotatedSquareCenter.x < shapeAnchor.x ? newSizeX : 0,
        rotatedSquareCenter.y < shapeAnchor.y ? newSizeY : 0,
        0,
      ])
      // Step 5 - shift back from center to anchor
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

    // Step 1 - start
    const edge = this;

    // Step 2 - Shift left/up to square anchor
    const squareAnchor = new Coordinates([Math.floor(edge.x), Math.floor(edge.y), 0]);
    const shiftX = squareAnchor.x - edge.x;
    const shiftY = squareAnchor.y - edge.y;

    // Step 3 - Rotate square
    const rotatedSquareAnchor = squareAnchor
      .rotateShapeSquare(rotation, shapeRotation, shapeSize, shapeCoordinates);

    // Step 4 - Unshift from square anchor
    const rotatedEdge = rotatedSquareAnchor
      .translate([-shiftX, -shiftY, 0])
      // Step 5 - Rotate around square center
      .rotate(rotation, rotatedSquareAnchor.translate([0.5, 0.5, 0]));

    return rotatedEdge;
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
