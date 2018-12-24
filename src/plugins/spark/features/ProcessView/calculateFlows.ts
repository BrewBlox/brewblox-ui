import { Part, AngledFlows, FlowPart, FlowPressure, Flow, ComponentConstructor } from './state';
import { UP, RIGHT, DOWN, LEFT, allParts as allPartComponents } from './parts';
import { clampRotation } from '@/helpers/functional';

export const isSamePart = (left: Part, right: Part) =>
  ['x', 'y', 'type', 'rotate'].every(k => left[k] === right[k]);

const component = (part: Part): ComponentConstructor => allPartComponents[part.type];

const rotatedFlows = (flows: AngledFlows, rotation: number = 0): AngledFlows =>
  Object.keys(flows)
    .map(Number)
    .reduce(
      (acc, angle) => ({
        ...acc,
        [clampRotation(angle + rotation)]:
          flows[angle]
            .map(flowAngle => ({ ...flowAngle, angleOut: clampRotation(flowAngle.angleOut + rotation) })),
      }),
      {},
    );

const liquidIn = (part: FlowPart, provided: number): number => {
  if (component(part).isSource) {
    const [flow] = Object.keys(component(part).flows(part)).map(Number);
    return clampRotation(flow + provided);
  }
  return provided;
};

const xyAtAngle = (part: FlowPart, angle: number): { x: number, y: number } => {
  if (angle === UP) {
    return {
      x: part.x,
      y: part.y - 1,
    };
  }

  if (angle === RIGHT) {
    return {
      x: part.x + 1,
      y: part.y,
    };
  }

  if (angle === DOWN) {
    return {
      x: part.x,
      y: part.y + 1,
    };
  }

  if (angle === LEFT) {
    return {
      x: part.x - 1,
      y: part.y,
    };
  }

  throw new Error(`Invalid angle: ${angle}`);
};

const partAtAngle = (
  origin: FlowPart,
  allParts: FlowPart[],
  angle: number,
): FlowPart | undefined => {
  const { x, y } = xyAtAngle(origin, angle);
  return allParts
    .filter(part => part.x === x && part.y === y)
    .find((part: FlowPart) => {
      const flows = rotatedFlows(component(part).flows(part), part.rotate);
      return !!flows[clampRotation(angle + (component(part).isSource ? 0 : 180))];
    });
};

const combineFlows = (left: FlowPressure = {}, right: FlowPressure = {}) =>
  Object.entries(right)
    .reduce((into: FlowPressure, [angle, val]) => ({ ...into, [angle]: (into[angle] || 0) + val }), left);

const mergePartFlow = (
  part: FlowPart,
  allParts: FlowPart[],
  flowToAdd: FlowPressure,
): FlowPart[] =>
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

const partOutFlows = (part: FlowPart, angleIn: number): Flow[] => {
  const flowFrom = liquidIn(part, angleIn);
  const flows = rotatedFlows(component(part).flows(part), part.rotate);
  return flows[flowFrom] || [];
};


const calculateFromSource = (
  part: FlowPart,
  allParts: FlowPart[],
  angleIn: number = UP,
  totalFriction: number = 0,
  startPressure: number = 10,
  totalDeltaPressure: number = 0,
  candidates: FlowPart[] = allParts,
): FlowPart[] => {
  const candidateParts = [...candidates.filter(candidate => !isSamePart(part, candidate))];

  const outFlowReducer = (parts: FlowPart[], outFlow: Flow): FlowPart[] => {
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

    const nextFlows = calculateFromSource(
      nextPart,
      parts,
      clampRotation(angleOut + 180),
      totalFriction,
      startPressure,
      totalDeltaPressure,
      candidateParts,
    );

    const updatedNextPart = partAtAngle(part, nextFlows, angleOut);

    let additionalAngleFlow = 0;
    if (updatedNextPart && updatedNextPart.flow) {
      additionalAngleFlow += updatedNextPart.flow[clampRotation(angleOut + 180)];
    }
    if (notUpdatedNextPart && notUpdatedNextPart.flow) {
      additionalAngleFlow -= notUpdatedNextPart.flow[clampRotation(angleOut + 180)];
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

const mergeSourceFlows = (allParts: FlowPart[], sourceFlow: FlowPart[]): FlowPart[] =>
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

const angledFlow = (part: FlowPart): FlowPressure =>
  Object.keys(part.flow || {})
    .map(Number)
    .reduce(
      (acc, angle) => (
        // rotate flow to match Vue component (anti-rotate)
        part.flow
          ? { ...acc, [clampRotation(angle + (part.rotate || 0))]: part.flow[angle] }
          : acc
      ),
      {},
    );

export const pathsFromSources = (parts: Part[]): FlowPart[] =>
  parts
    .filter(part => component(part).isSource) // -> Part[]
    .map(part => calculateFromSource(part as FlowPart, parts as FlowPart[], part.rotate)) // -> FlowPart[][]
    .reduce(mergeSourceFlows, []) // -> FlowPart[]
    .map(part => (part.flow ? { ...part, flow: angledFlow(part) } : part));
