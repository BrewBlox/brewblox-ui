import { Part, AngledFlows, DisplayPart, CalculatedFlow, Flow } from './state';

export const isSamePart = (left: Part, right: Part) =>
  ['x', 'y', 'type', 'rotate'].every(k => left[k] === right[k]);

export const rotated = (rotation: number) => (rotation + 360) % 360;

const rotatedFlows = (flows: AngledFlows, rotation: number = 0): AngledFlows =>
  Object.keys(flows)
    .map(Number)
    .reduce(
      (acc, angle) => ({
        ...acc,
        [rotated(angle + rotation)]:
          flows[angle]
            .map(flowAngle => ({ ...flowAngle, angleOut: rotated(flowAngle.angleOut + rotation) })),
      }),
      {},
    );

const liquidIn = (part: DisplayPart, provided: number): number => {
  if (part.component.isSource) {
    const [flow] = Object.keys(part.component.flows(part)).map(Number);
    return rotated(flow + provided);
  }
  return provided;
};

const xyAtAngle = (part: DisplayPart, angle: number): { x: number, y: number } => {
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
};

const partAtAngle = (
  origin: DisplayPart,
  allParts: DisplayPart[],
  angle: number,
): DisplayPart | undefined => {
  const { x, y } = xyAtAngle(origin, angle);
  return allParts
    .filter(part => part.x === x && part.y === y)
    .find((part: DisplayPart) => {
      const flows = rotatedFlows(part.component.flows(part), part.rotate);
      return !!flows[rotated(angle + (part.component.isSource ? 0 : 180))];
    });
};

const combineFlows = (left: CalculatedFlow = {}, right: CalculatedFlow = {}) =>
  Object.entries(right)
    .reduce((into: CalculatedFlow, [angle, val]) => ({ ...into, [angle]: (into[angle] || 0) + val }), left);

const mergePartFlow = (
  part: DisplayPart,
  allParts: DisplayPart[],
  flowToAdd: CalculatedFlow,
): DisplayPart[] =>
  allParts
    .map((item) => {
      if (!isSamePart(part, item)) {
        return item;
      }

      return {
        ...part,
        flow: {
          ...part.flow,
          ...combineFlows(item.flow, flowToAdd),
        },
      };
    });

const partOutFlows = (part: DisplayPart, angleIn: number): Flow[] => {
  const flowFrom = liquidIn(part, angleIn);
  const flows = rotatedFlows(part.component.flows(part), part.rotate);
  return flows[flowFrom] || [];
};


const calculateFlows = (
  part: DisplayPart,
  allParts: DisplayPart[],
  angleIn: number = 0,
  totalFriction: number = 0,
  startPressure: number = 10,
  totalDeltaPressure: number = 0,
  candidates: DisplayPart[] = allParts,
): DisplayPart[] => {
  const candidateParts = [...candidates.filter(candidate => !isSamePart(part, candidate))];

  const outFlowReducer = (parts: DisplayPart[], outFlow: Flow): DisplayPart[] => {
    const { angleOut, pressure, friction, deltaPressure } = outFlow;
    totalFriction += (friction || 0);
    totalDeltaPressure += (deltaPressure || 0);

    if (pressure !== undefined) {
      const totalPressure = startPressure + totalDeltaPressure;
      const pathFlow = (totalPressure - pressure) / totalFriction;
      return mergePartFlow(
        part,
        parts,
        {
          [angleOut]: pathFlow,
          [angleIn]: pathFlow * -1,
        },
      );
    }

    const nextPart = partAtAngle(part, candidateParts, angleOut);

    if (!nextPart) {
      // no flow possible
      return mergePartFlow(
        part,
        parts,
        {
          [angleOut]: 0,
          [angleIn]: 0,
        },
      );
    }

    const notUpdatedNextPart = partAtAngle(part, parts, angleOut);

    const nextFlows = calculateFlows(
      nextPart,
      parts,
      rotated(angleOut + 180),
      totalFriction,
      startPressure,
      totalDeltaPressure,
      candidateParts,
    );

    const updatedNextPart = partAtAngle(part, nextFlows, angleOut);

    let additionalAngleFlow = 0;
    if (updatedNextPart && updatedNextPart.flow) {
      additionalAngleFlow += updatedNextPart.flow[rotated(angleOut + 180)];
    }
    if (notUpdatedNextPart && notUpdatedNextPart.flow) {
      additionalAngleFlow -= notUpdatedNextPart.flow[rotated(angleOut + 180)];
    }

    return mergePartFlow(
      part,
      nextFlows,
      {
        [angleOut]: additionalAngleFlow * -1,
        [angleIn]: additionalAngleFlow,
      },
    );
  };

  return partOutFlows(part, angleIn)
    .reduce(outFlowReducer, allParts);
};

const mergeSourceFlows = (allParts: DisplayPart[], sourceFlow: DisplayPart[]): DisplayPart[] =>
  sourceFlow.reduce(
    (acc, part) => {
      const existing = allParts.find(p => isSamePart(p, part));
      if (existing) {
        existing.flow = combineFlows(existing.flow, part.flow);
        return acc;
      }
      return [...acc, part];
    },
    allParts,
  );

const angledFlow = (part: DisplayPart): CalculatedFlow =>
  Object.keys(part.flow || {})
    .map(Number)
    .reduce(
      (acc, angle) => (
        // rotate flow to match Vue component (anti-rotate)
        part.flow
          ? { ...acc, [rotated(angle + (360 - (part.rotate || 0)))]: part.flow[angle] }
          : acc
      ),
      {},
    );

export const pathsFromSources = (parts: DisplayPart[]): DisplayPart[] =>
  parts
    .filter(part => part.component.isSource) // -> Part[]
    .map(source => calculateFlows(source, parts, source.rotate)) // -> Part[][]
    .reduce(mergeSourceFlows, []) // -> Part[]
    .map(part => (part.flow ? { ...part, flow: angledFlow(part) } : part));
