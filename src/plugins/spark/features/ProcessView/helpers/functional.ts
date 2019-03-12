import { Coordinates, CoordinatesParam } from '@/helpers/coordinates';

export const slotLocations =
  (
    slots: CoordinatesParam[],
    position: CoordinatesParam,
    rotation: number,
    size: [number, number],
  ): Coordinates[] => {
    // anchor coordinates @ 0 rotation
    const origin =
      new Coordinates(position)
        .rotateSquare(-rotation, rotation, size);
    return slots
      .map((slot) =>
        new Coordinates(origin)
          .translate(slot)
          .rotateSquare(rotation, 0, size, slot)
      );
  };
