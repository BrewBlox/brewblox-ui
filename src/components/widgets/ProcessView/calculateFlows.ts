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
    return parseInt(Object.keys(part.component.flows())[0], 10);
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
    const flows = rotatedFlows(part.component.flows(), part.rotate);
    return !!flows[rotated(angle, part.component.isSource ? 0 : 180)];
  });
}

function isSamePart(original: ProcessViewPartWithComponent, compare: ProcessViewPartWithComponent) {
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

function addProperyToPart(
  part: ProcessViewPartWithComponent,
  property: { [key: string]: any },
  allParts: ProcessViewPartWithComponent[],
): ProcessViewPartWithComponent[] {
  return allParts.map((item) => {
    if (isSamePart(part, item)) {
      return {
        ...part,
        ...property,
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
  const flows = rotatedFlows(part.component.flows(), part.rotate);
  return flows[flowFrom] || [];
}

function flowAtExitsOfNextPart(
  origin: ProcessViewPartWithComponent,
  allParts: ProcessViewPartWithComponent[],
  angle: number,
): number {
  const nextPart = partAtAngle(origin, allParts, angle);

  if (!nextPart) {
    return 0;
  }

  return possibleOutputs(nextPart, rotated(angle, 180))
    .reduce(
      (acc, output) =>
        acc + (nextPart.flow && nextPart.flow[output.out] ? nextPart.flow[output.out] : 0),
      0,
    );
}

function flow(
  part: ProcessViewPartWithComponent,
  allParts: ProcessViewPartWithComponent[],
  angleIn: number = 0,
  accFriction: number = 0,
  startPressure: number = 10,
): ProcessViewPartWithComponent[] {
  // mark part as visited to prevent loops
  const visitedParts = addProperyToPart(part, { visited: true }, allParts);

  return possibleOutputs(part, angleIn).reduce(
    (parts, output) => {
      const angle = output.out;
      const accFlow = ((part.flow && part.flow[angle]) || 0);

      const totalFriction = accFriction + (output.friction || 0);

      if (typeof output.pressure === 'number') {
        if (output.pressure < startPressure) {
          const pathFlow = (startPressure - output.pressure) / totalFriction;
          return addFlowToPart(part, { [angle]: accFlow + pathFlow }, parts);
        }

        return addFlowToPart(part, { [angle]: accFlow }, parts);
      }

      const nextPart = partAtAngle(part, parts, angle);
      if (!nextPart || nextPart.visited) {
        // no flow possible
        return addFlowToPart(part, { [angle]: accFlow }, parts);
      }

      const nextFlows = flow(
        nextPart,
        parts,
        rotated(angle, 180),
        totalFriction,
        startPressure,
      );

      const sumOfFlows = flowAtExitsOfNextPart(part, nextFlows, angle);

      return addFlowToPart(part, { [angle]: sumOfFlows }, nextFlows);
    },
    visitedParts,
  );
}

function calculateFlowValuesOnAngles(
  part: ProcessViewPartWithComponent,
  index: number,
  allParts: ProcessViewPartWithComponent[],
): ProcessViewPartWithComponent {
  if (!part.flow) {
    return part;
  }

  const rotate = part.rotate || 0;
  const flows = rotatedFlows(part.component.flows(), rotate);

  const flowing = Object.keys(flows)
    .map(angle => parseInt(angle, 10))
    .reduce(
      (acc: number[], angle) => {
        // make sure all _out_ angles are also calculated
        const outAngles = flows[angle].map(partFlow => partFlow.out);
        return [...(new Set([...acc, angle, ...outAngles]))];
      },
      [],
    )
    .map((angle: number) => {
      const inflowPart = partAtAngle(part, allParts, angle);

      // get flow on exit of part next to current part
      const inflowOnAngle =
        (inflowPart && inflowPart.flow && inflowPart.flow[rotated(angle, 180)]) || 0;
      const outflowOnAngle = part.flow && part.flow[angle] ? part.flow[angle] : 0;

      return {
        angle,
        flow: outflowOnAngle - inflowOnAngle,
      };
    })
    // rotate angle back to Vue component angles
    .reduce(
      (acc, calculatedFlow) => ({
        ...acc,
        [rotated(calculatedFlow.angle, 360 - rotate)]: calculatedFlow.flow,
      }),
      {},
    );

  return {
    ...part,
    flow: flowing,
  };
}

export function addFlowingToComponents(parts: ProcessViewPartWithComponent[]):
  ProcessViewPartWithComponent[] {
  return parts.map(calculateFlowValuesOnAngles);
}

export function pathsFromSources(parts: ProcessViewPartWithComponent[]):
  ProcessViewPartWithComponent[] {
  const sources = getSources(parts);
  const flowsFromSources = sources.map(source => flow(source, parts));
  return addFlowingToComponents(flatten(flowsFromSources));
}
