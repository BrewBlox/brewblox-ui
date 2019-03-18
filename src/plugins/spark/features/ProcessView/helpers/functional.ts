import { Coordinates, CoordinatesParam } from '@/helpers/coordinates';

export const subSquares =
  (
    squares: CoordinatesParam[],
    position: CoordinatesParam,
    rotation: number,
    size: [number, number],
  ): Coordinates[] => {
    // anchor coordinates @ 0 rotation
    const origin =
      new Coordinates(position)
        .rotateSquare(-rotation, rotation, size);
    return squares
      .map((square) =>
        new Coordinates(origin)
          .translate(square)
          .rotateSquare(rotation, 0, size, square)
      );
  };
