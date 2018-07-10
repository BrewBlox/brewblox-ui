function rotated(original: number, rotation: number) {
  return (original + rotation) % 360;
}

export function rotatedFlows(flows: ProcessViewPartFlows, rotation: number) {
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

function flow(part: ProcessViewPartWithComponent, inflow: number = 0) {
  const flows = part.component.flows();

  if (part.component.isSource) {
    // TODO change input
  }
}

export function calculateFlows(parts: ProcessViewPartWithComponent[]): any {
  const sources = getSources(parts);

  return sources.map(source => flow(source));
}
