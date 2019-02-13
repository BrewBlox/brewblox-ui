type CoordinatesParam = string | { x: number, y: number } | [number, number] | Coordinates;

export class Coordinates {
  x: number;
  y: number;

  constructor(param: CoordinatesParam, rotation: number = 0, pivot: CoordinatesParam = [0.5, 0.5]) {
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

    if (rotation) {
      this.rotate(rotation, pivot);
    }

    if (typeof this.x !== 'number' || Number.isNaN(this.x)
      || typeof this.y !== 'number' || Number.isNaN(this.y)) {
      throw new Error(`${param} could not be parsed as a coordinate`);
    }
  }

  rotate(rotation: number, pivot: CoordinatesParam) {
    const pivotCoord = new Coordinates(pivot);

    const s = Math.sin(rotation * Math.PI / 180);
    const c = Math.cos(rotation * Math.PI / 180);

    this.x -= pivotCoord.x;
    this.y -= pivotCoord.y;

    const x = (this.x * c - this.y * s) + pivotCoord.x;
    const y = (this.x * s + this.y * c) + pivotCoord.y;

    this.x = +x.toFixed(1);
    this.y = +y.toFixed(1);
  }

  toString(): string {
    return `${this.x},${this.y}`;
  }

  values(): [number, number] {
    return [this.x, this.y];
  }

  raw(): { x: number, y: number } {
    return { x: this.x, y: this.y };
  }
}
