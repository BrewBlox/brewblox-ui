import { flatten } from 'lodash';

function rotated(original: number, rotation: number) {
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

function xyAtAngle(
  part: ProcessViewPartWithComponent | ProcessViewPartWithFlow,
  angle: number,
): { x: number, y: number } {
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
  return partsOnPosition.find((part: ProcessViewPartWithComponent | ProcessViewPartWithFlow) => {
    const flows = rotatedFlows(part.component.flows(), part.rotate);
    return !!flows[rotated(angle, 180)];
  });
}

function isSamePart(
  original: ProcessViewPartWithComponent | ProcessViewPartWithFlow,
  compare: ProcessViewPartWithComponent | ProcessViewPartWithFlow,
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
  const enhancedParts = addProperyToPart(part, { visited: true }, allParts);

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
    enhancedParts,
  );
}

export function pathsFromSources(parts: ProcessViewPartWithComponent[]):
  ProcessViewPartWithComponent[] {
  const sources = getSources(parts);
  const flowsFromSources = sources.map(source => flow(source, parts));

  debugger;

  return [];
}

// function determineFlows(paths: ProcessViewPartWithComponent[]): ProcessViewPartWithFlow[] {
//   return paths.reduce(
//     (acc: any, item) => {
//       const rotate = item.rotate || 0;
//
//       const flowingTo = Object.keys(item.to)
//         .map((angle) => {
//           const angleTo = parseInt(angle, 10);
//           if (item.to[angleTo]) {
//             return rotated(angleTo, 360 - rotate);
//           }
//
//           return null;
//         })
//         .filter(angle => angle !== null);
//
//       const part = {
//         ...item,
//         flowingTo,
//       };
//       delete part.to;
//
//       return [
//         ...acc,
//         part,
//         ...flatten(Object.keys(item.to)
//           .map(angle => determineFlows([item.to[parseInt(angle, 10)]]))),
//       ];
//     },
//     [],
//   );
// }
//
// function hasMorePower(a: ProcessViewPartWithFlow, b: ProcessViewPartWithFlow) {
//   return a.friction < b.friction;
// }
//
// function pickStrongestFlows(
//   acc: ProcessViewPartWithFlow[],
//   part: ProcessViewPartWithFlow,
// ): ProcessViewPartWithFlow[] {
//   const partIndex = acc.findIndex(item => isSamePart(part, item));
//   const prevPart = acc[partIndex] as ProcessViewPartWithFlow;
//
//   if (partIndex > -1 && prevPart) {
//     if (hasMorePower(part, prevPart)) {
//       const newAcc = [...acc];
//       newAcc.splice(partIndex, 1, part);
//
//       return newAcc;
//     }
//
//     return acc;
//   }
//
//   return [...acc, part];
// }
//
// function addFlowingFrom(
//   part: ProcessViewPartWithFlow,
//   index: number,
//   allParts: ProcessViewPartWithFlow[],
// ): ProcessViewPartWithFlow {
//   if (!part.component) {
//     return part;
//   }
//
//   if (part.component.isSource) {
//     return {
//       ...part,
//       flowingFrom: [rotated(part.flowingTo[0], 180)],
//     };
//   }
//
//   // remove flowing to where next flow is stronger
//   const recalculatedFlowingTo = part.flowingTo.filter((angle: number) => {
//     const nextPart = partAtAngle(part, allParts, rotated(angle, part.rotate));
//
//     if (!nextPart || !nextPart.friction) {
//       return true;
//     }
//
//     return hasMorePower(part, nextPart as ProcessViewPartWithFlow);
//   });
//
//   const flowingFrom = Object.keys(part.component.flows())
//     .map(key => parseInt(key, 10))
//     .filter(angle => recalculatedFlowingTo.indexOf(angle) === -1);
//
//   return {
//     ...part,
//     flowingFrom,
//     flowingTo: recalculatedFlowingTo,
//   };
// }

export function calculateFlows(paths: ProcessViewPartWithComponent[]): ProcessViewPartWithFlow[] {
  return [];

  // const allFlows = determineFlows(paths);
  // const strongestFlows = allFlows.reduce(pickStrongestFlows, []);
  // return strongestFlows.map(addFlowingFrom);
}
