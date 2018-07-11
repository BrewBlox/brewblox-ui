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

function partsAtAngle(
  origin: ProcessViewPartWithComponent,
  allParts: ProcessViewPartWithComponent[],
  angle: number,
): ProcessViewPartWithComponent[] {
  const { x, y } = xyAtAngle(origin, angle);
  return allParts.filter(part => part.x === x && part.y === y);
}

/* eslint-disable */
type partWithFlow = ProcessViewPartWithComponent & { to: { [angle: number]: partWithFlow[] } };
/* eslint-enable */

function flow(
  part: ProcessViewPartWithComponent,
  allParts: ProcessViewPartWithComponent[],
  inflow: number = 0,
): partWithFlow {
  const { rotate, component } = part;

  // rotate flows
  const flowFrom = liquidIn(part, inflow);
  const flows = rotatedFlows(component.flows(), rotate);

  const possibleOutputs = flows[flowFrom] || [];

  return {
    ...part,
    to: possibleOutputs
      .reduce((acc, angle) => {
        const nextParts = partsAtAngle(part, allParts, angle);
        return {
          ...acc,
          [angle]: nextParts.map(nextPart => flow(nextPart, allParts, rotated(angle, 180))),
        };
      }, {}),
  };
}

export function pathsFromSources(parts: ProcessViewPartWithComponent[]): partWithFlow[] {
  const sources = getSources(parts);

  return sources.map(source => flow(source, parts));
}

function determineFlows(paths: partWithFlow[], fromAngle: number = 90): any {
  return paths.reduce((acc: any, item) => {
    const part = {
      ...item,
      flowingFrom: rotated(fromAngle, 180),
      flowingTo: Object.keys(item.to)
        .map((angle) => {
          if (item.to[parseInt(angle, 10)].length > 0) {
            return parseInt(angle, 10);
          }

          return null;
        })
        .filter(angle => angle !== null),
    };
    delete part.to;
    delete part.component;

    return [
      ...acc,
      part,
      ...flatten(Object.keys(item.to)
        .map(angle => determineFlows(item.to[parseInt(angle, 10)], parseInt(angle, 10)))),
    ];
  }, []);
}

export function calculateFlows(paths: partWithFlow[]): any {
  return determineFlows(paths);
}
