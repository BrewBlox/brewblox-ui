import { flatten } from 'lodash';

function rotated(original: number, rotation: number) {
  return (original + rotation) % 360;
}

export function rotatedFlows(
  flows: ProcessViewPartFlows,
  rotation: number = 0,
): ProcessViewPartFlows {
  return Object.keys(flows)
    .reduce((acc, angle) => ({
      ...acc,
      [rotated(parseInt(angle, 10), rotation)]:
        flows[parseInt(angle, 10)].map(flowAngle => rotated(flowAngle, rotation)),
    }), {});
}

function getSources(parts: ProcessViewPartWithComponent[]) {
  return parts.filter(part => part.component.isSource);
}

function liquidIn(part: ProcessViewPartWithComponent, provided: number): number {
  if (part.component.isSource) {
    return parseInt(Object.keys(part.component.flows())[0], 0);
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
  return partsOnPosition.find((part) => {
    const flows = rotatedFlows(part.component.flows(), part.rotate);
    return !!flows[rotated(angle, 180)];
  });
}

function isPart(original: ProcessViewPartWithComponent, compare: ProcessViewPartWithComponent) {
  return original.x === compare.x &&
    original.y === compare.y &&
    original.type === compare.type &&
    original.rotate === compare.rotate;
}

/* eslint-disable */
type partWithFlow = ProcessViewPartWithComponent & {
  to: { [angle: number]: partWithFlow },
};
/* eslint-enable */

function flow(
  part: ProcessViewPartWithComponent,
  allParts: ProcessViewPartWithComponent[],
  inflow: number = 0,
  pressure: number = 0,
): partWithFlow {
  const { rotate, component } = part;

  // rotate flows
  const flowFrom = liquidIn(part, inflow);
  const flows = rotatedFlows(component.flows(), rotate);

  const enhancedParts = allParts.map((item) => {
    if (isPart(part, item)) {
      return { ...part, pressure };
    }

    return item;
  });
  const possibleOutputs = flows[flowFrom] || [];

  const to = possibleOutputs
    .reduce((acc, angle) => {
      const nextPart = partAtAngle(part, enhancedParts, angle);

      if (!nextPart || typeof nextPart.pressure === 'number') {
        return acc;
      }

      return {
        ...acc,
        [angle]: flow(
          nextPart,
          enhancedParts,
          rotated(angle, 180),
          pressure - 1,
        ),
      };
    }, {});

  return {
    ...part,
    pressure,
    to,
  };
}

export function pathsFromSources(parts: ProcessViewPartWithComponent[]): partWithFlow[] {
  const sources = getSources(parts);

  return sources.map(source => flow(source, parts));
}

function determineFlows(paths: partWithFlow[], fromAngle: number = 90): any {
  return paths.reduce((acc: any, item) => {
    const rotate = item.rotate || 0;

    const flowingTo = Object.keys(item.to)
      .map((angle) => {
        const angleTo = parseInt(angle, 10);
        if (item.to[angleTo]) {
          return rotated(angleTo, 360 - rotate);
        }

        return null;
      })
      .filter(angle => angle !== null);

    const part = {
      ...item,
      flowingTo,
      flowingFrom: flowingTo.length > 0 || item.component.isSink ?
        rotated(fromAngle, (180 - rotate)) : undefined,
    };
    delete part.to;
    delete part.component;

    return [
      ...acc,
      part,
      ...flatten(Object.keys(item.to)
        .map(angle => determineFlows([item.to[parseInt(angle, 10)]], parseInt(angle, 10)))),
    ];
  }, []);
}

export function calculateFlows(paths: partWithFlow[]): any {
  return determineFlows(paths);
}
