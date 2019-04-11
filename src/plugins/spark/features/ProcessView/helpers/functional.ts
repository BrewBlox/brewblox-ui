import { Coordinates, CoordinatesParam } from '@/helpers/coordinates';

export const subSquares =
  (
    squares: CoordinatesParam[],
    position: CoordinatesParam,
    rotation: number,
    size: [number, number],
  ): Coordinates[] => {
    return squares
      .map((square) =>
        new Coordinates(square)
          .rotateShapeSquare(rotation, 0, size)
          .translate(position)
      );
  };
