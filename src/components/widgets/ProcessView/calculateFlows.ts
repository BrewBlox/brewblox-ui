import { flatten } from 'lodash';

export function rotated(original: number = 0, rotation: number = 0) {
  return (original + rotation) % 360;
}

export function rotatedFlows(
  flows: ProcessViewPartFlows,
  rotation: number = 0,
): ProcessViewPartFlows {
  return Object.keys(flows)
    .reduce(
      (acc, angle) => ({
        ...acc,
        [rotated(parseInt(angle, 10), rotation)]:
          flows[parseInt(angle, 10)].map(flowAngle =>
            ({ ...flowAngle, out: rotated(flowAngle.out, rotation) })),
      }),
      {},
    );
}

function getSources(parts: ProcessViewPartWithComponent[]) {
  return parts.filter(part => part.component.isSource);
}

function liquidIn(part: ProcessViewPartWithComponent, provided: number): number {
  if (part.component.isSource) {
    return parseInt(Object.keys(part.component.flows(part))[0], 10);
  }

  return provided;
}

function xyAtAngle(part: ProcessViewPartWithComponent, angle: number): { x: number, y: number } {
  if (angle === 90) {
    return {
      x: part.x + 1,
      y: part.y,
    };
  }

  if (angle === 180) {
    return {
      x: part.x,
      y: part.y + 1,
    };
  }

  if (angle === 270) {
    return {
      x: part.x - 1,
      y: part.y,
    };
  }

  return {
    x: part.x,
    y: part.y - 1,
  };
}

function partAtAngle(
  origin: ProcessViewPartWithComponent,
  allParts: ProcessViewPartWithComponent[],
  angle: number,
): ProcessViewPartWithComponent | undefined {
  const { x, y } = xyAtAngle(origin, angle);
  const partsOnPosition = allParts.filter(part => part.x === x && part.y === y);
  return partsOnPosition.find((part: ProcessViewPartWithComponent) => {
    const flows = rotatedFlows(part.component.flows(part), part.rotate);
    return !!flows[rotated(angle, part.component.isSource ? 0 : 180)];
  });
}

export function isSamePart(
  original: ProcessViewPartWithComponent | ProcessViewPart,
  compare: ProcessViewPartWithComponent | ProcessViewPart,
) {
  return original.x === compare.x &&
    original.y === compare.y &&
    original.type === compare.type &&
    original.rotate === compare.rotate;
}

function addFlowToPart(
  part: ProcessViewPartWithComponent,
  flowToAdd: ProcessViewPartCalculatedFlow,
  allParts: ProcessViewPartWithComponent[],
): ProcessViewPartWithComponent[] {
  return allParts.map((item) => {
    if (isSamePart(part, item)) {
      return {
        ...part,
        flow: {
          ...part.flow,
          ...item.flow,
          ...Object.keys(flowToAdd).reduce(
            (acc, key) => {
              const angle = parseInt(key, 10);

              return {
                ...acc,
                [angle]: flowToAdd[angle] + (item.flow && item.flow[angle] ? item.flow[angle] : 0),
              };
            },
            {},
          ),
        },
      };
    }

    return item;
  });
}

function possibleOutputs(
  part: ProcessViewPartWithComponent,
  angleIn: number,
): ProcessViewPartFlow[] {
  const flowFrom = liquidIn(part, angleIn);
  const flows = rotatedFlows(part.component.flows(part), part.rotate);
  return flows[flowFrom] || [];
}

function flow(
  part: ProcessViewPartWithComponent,
  allParts: ProcessViewPartWithComponent[],
  angleIn: number = 0,
  accFriction: number = 0,
  startPressure: number = 10,
  candidates: ProcessViewPartWithComponent[] = allParts,
): ProcessViewPartWithComponent[] {
  const candidateParts = [...candidates.filter(candidate => !isSamePart(part, candidate))];

  return possibleOutputs(part, angleIn).reduce(
    (parts, output) => {
      const angle = output.out;

      const totalFriction = accFriction + (output.friction || 0);

      if (typeof output.pressure === 'number') {
        if (output.pressure < startPressure) {
          const pathFlow = (startPressure - output.pressure) / totalFriction;

          return addFlowToPart(
            part,
            {
              [angle]: pathFlow,
              [angleIn]: pathFlow * -1,
            },
            parts,
          );
        }

        return parts;
      }

      const nextPart = partAtAngle(part, candidateParts, angle);
      if (!nextPart) {
        // no flow possible
        return addFlowToPart(
          part,
          {
            [angle]: 0,
            [angleIn]: 0,
          },
          parts,
        );
      }

      const nextFlows = flow(
        nextPart,
        parts,
        rotated(angle, 180),
        totalFriction,
        startPressure,
        candidateParts,
      );

      const updatedNextPart = partAtAngle(part, nextFlows, angle);
      let angleFlow = 0;

      if (updatedNextPart && updatedNextPart.flow) {
        angleFlow = updatedNextPart.flow[rotated(angle, 180)];
      }

      return addFlowToPart(
        part,
        {
          [angle]: angleFlow * -1,
          [angleIn]: angleFlow,
        },
        nextFlows,
      );
    },
    allParts,
  );
}

export function pathsFromSources(parts: ProcessViewPartWithComponent[]):
  ProcessViewPartWithComponent[] {
  const sources = getSources(parts);
  const flowsFromSources = sources.map(source => flow(source, parts));
  return flatten(flowsFromSources).map((part) => {
    if (!part.flow) {
      return part;
    }

    // rotate flow to match Vue component (anti-rotate)
    return {
      ...part,
      flow: Object.keys(part.flow)
        .map(angle => parseInt(angle, 10))
        .reduce(
          (acc, angle) => {
            if (!part.flow) {
              return acc;
            }

            return {
              ...acc,
              [rotated(angle, 360 - (part.rotate || 0))]: part.flow[angle],
            };
          },
          {},
        ),
    };
  });
}
