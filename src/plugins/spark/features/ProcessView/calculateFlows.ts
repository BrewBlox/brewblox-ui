import Vue from 'vue';
import { Part, AngledFlows, FlowPart, FlowPressure, Flow, ComponentConstructor } from './state';
import { UP, RIGHT, DOWN, LEFT, DEFAULT_FRICTION, DEFAULT_DELTA_PRESSURE, COLD_WATER, MIXED_LIQUIDS } from './getters';
import { clampRotation } from '@/helpers/functional';

export const isSamePart = (left: Part, right: Part) =>
  ['x', 'y', 'type', 'rotate'].every(k => left[k] === right[k]);

export const component = (part: Part) => Vue.component(part.type) as ComponentConstructor;

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

const adjacentXY = (origin: FlowPart, angleOut: number): { x: number, y: number } => {
  if (angleOut === UP) {
    return {
      x: origin.x,
      y: origin.y - 1,
    };
  }

  if (angleOut === RIGHT) {
    return {
      x: origin.x + 1,
      y: origin.y,
    };
  }

  if (angleOut === DOWN) {
    return {
      x: origin.x,
      y: origin.y + 1,
    };
  }

  if (angleOut === LEFT) {
    return {
      x: origin.x - 1,
      y: origin.y,
    };
  }

  throw new Error(`Invalid angle: ${angleOut}`);
};

const adjacentPart = (
  origin: FlowPart,
  allParts: FlowPart[],
  angleOut: number,
): FlowPart | undefined => {
  const { x, y } = adjacentXY(origin, angleOut);
  return allParts
    .find((part: FlowPart) => {
      if (part.x !== x || part.y !== y) {
        return false;
      }
      const flows = rotatedFlows(component(part).flows(part), part.rotate);
      const relevantAngle = clampRotation(angleOut + (component(part).isSource ? 0 : 180));
      return Boolean(flows[relevantAngle]);
    });
};

const combineFlows = (left: FlowPressure = {}, right: FlowPressure = {}) =>
  Object.entries(right)
    .reduce((into: FlowPressure, [angle, val]) => ({ ...into, [angle]: (into[angle] || 0) + val }), left);

const combineLiquids = (left: string | undefined, right: string | undefined): string | undefined => {
  if (left && right && left !== right) {
    return MIXED_LIQUIDS;
  }
  return left || right || undefined;
};

/*
  Find the part in allParts, and then merge the new flow into allParts.
*/
const additionalFlow = (
  part: FlowPart,
  allParts: FlowPart[],
  flowToAdd: FlowPressure,
  liquid: string,
): FlowPart[] =>
  allParts
    .map((item) => {
      if (isSamePart(part, item)) {
        return { ...item, liquid, flow: combineFlows(item.flow, flowToAdd) };
      }
      return item;
    });

const partOutFlows = (part: FlowPart, angleIn: number): Flow[] => {
  const flowFrom = liquidIn(part, angleIn);
  const flows = rotatedFlows(component(part).flows(part), part.rotate);
  return flows[flowFrom] || [];
};

/*
  Starting with a source part, we recursively find all connected parts.
  Flow pressure is undefined until both the source, and the sink (or another source!) are known.

  Relevant part properties:

  - pressure:
    Only sources and sinks have defined pressure.
    The algorithm considers a route complete when it has found a part with defined pressure.

  - angleIn / angleOut:
    The entrypoint / exit point of the flow in the tube.
    A left-to-right straight tube will have two flows, with swapped angleIn and angleOut.
    The angleIn where liquid enters the part will have positive pressure.
    The angleIn where liquid leaves the part will have negative pressure.

  - friction:
    The longer the route between source and sink, the less flow.
    This is modelled by giving each part a friction value.
    The cumulative friction is used to calculate the actual flow between source and sink.

  - deltaPressure
    Pumps increase flow throughout the route without contributing additional liquid.
    This is modelled by giving each part a deltaPressure value,.
    The cumulative deltaPressure is used to calculate the actual flow between source and sink.

  Route pressure is calculated using:
    startPressure: the pressure defined by the source
    endPressure: the pressure defined by the end part (sink or source)
    totalDeltaPressure: the cumulative deltaPressure value for each part in the route from source to sink.
    totalFriction: the cumulative friction value for each part in the route from source to sink.

  routePressure = (startPressure + totalDeltaPressure - endPressure) / totalFriction.

  If all connected parts are explored, and no sink is found, pressure is considered 0.
*/
const calculateFromSource = (
  sourcePart: FlowPart,
  allParts: FlowPart[],
  angleIn: number,
  liquidSource: string,
  totalFriction: number = 0,
  startPressure: number = 10,
  totalDeltaPressure: number = 0,
  candidates: FlowPart[] = allParts,
): FlowPart[] => {
  const candidateParts = candidates
    .filter(candidate => !isSamePart(sourcePart, candidate) || component(candidate).isBridge);

  const outFlowReducer = (parts: FlowPart[], outFlow: Flow): FlowPart[] => {
    const { angleOut, pressure, friction, deltaPressure } = outFlow;
    totalFriction += (friction || DEFAULT_FRICTION);
    totalDeltaPressure += (deltaPressure || DEFAULT_DELTA_PRESSURE);

    if (pressure !== undefined) {
      // Found an end part -> route is done
      // An end part can be a source, a sink, or a part for which a route was already calculated
      // The last scenario happens if the route forks, and then re-joins
      const totalPressure = startPressure + totalDeltaPressure;
      const pathFlow = (totalPressure - pressure) / totalFriction;
      return additionalFlow(
        sourcePart,
        parts,
        {
          [angleOut]: pathFlow,
          [angleIn]: -pathFlow,
        },
        liquidSource,
      );
    }

    const nextPart = adjacentPart(sourcePart, candidateParts, angleOut);

    if (!nextPart) {
      // no flow possible -> route is done
      return additionalFlow(
        sourcePart,
        parts,
        {
          [angleOut]: 0,
          [angleIn]: 0,
        },
        liquidSource,
      );
    }

    const notUpdatedNextPart = adjacentPart(sourcePart, parts, angleOut);

    // recursively call calculateFromSource(), with the next part being the "source"
    const nextFlows = calculateFromSource(
      nextPart,
      parts,
      clampRotation(angleOut + 180),
      liquidSource,
      totalFriction,
      startPressure,
      totalDeltaPressure,
      candidateParts,
    );

    const updatedNextPart = adjacentPart(sourcePart, nextFlows, angleOut);

    // I have no clue what this does
    // Something with circular flows
    let additionalAngleFlow = 0;
    if (updatedNextPart && updatedNextPart.flow) {
      additionalAngleFlow += (updatedNextPart.flow[clampRotation(angleOut + 180)] || 0);
    }
    if (notUpdatedNextPart && notUpdatedNextPart.flow) {
      additionalAngleFlow -= (notUpdatedNextPart.flow[clampRotation(angleOut + 180)] || 0);
    }

    // The recursion tree has returned, merge the flow for this part into the result set
    return additionalFlow(
      sourcePart,
      nextFlows,
      {
        [angleOut]: -additionalAngleFlow,
        [angleIn]: additionalAngleFlow,
      },
      liquidSource,
    );
  };

  // Calculate the route for each outflow the source part has
  return partOutFlows(sourcePart, angleIn)
    .reduce(outFlowReducer, allParts);
};

/*
  calculateFromSource() calculates the flow created by a single source.
  Parts can be connected to multiple sources, and thus used by multiple flows.

  We must merge the result of various calculations into a single Part.
*/
const mergeSourceFlows = (allParts: FlowPart[], sourceFlow: FlowPart[]): FlowPart[] =>
  sourceFlow.reduce(
    (acc, part) => {
      const existing = allParts.find(p => isSamePart(p, part));
      if (existing) {
        existing.flow = combineFlows(existing.flow, part.flow);
        existing.liquid = combineLiquids(existing.liquid, part.liquid);
        return acc;
      }
      return [...acc, part];
    },
    allParts,
  );

/*
  Correct calculated pressure for display in the part component.

  Example:

  A straight tube component defines flows as:
  {
    [LEFT]: [{ angleOut: RIGHT, friction: 1 }],
    [RIGHT]: [{ angleOut: LEFT, friction: 1 }],
  }

  If we connect it, and rotate it by 90 degrees, calculateFromSource may yield:
  {
    [UP]: 5,
    [DOWN]: -5
  }

  The parts will be rendered at rotation=0, and then rotated in their entirety.
  To enable this, we must match translate angleIn of calculated pressure to what it would be at rotation=0.

  Desired output:
  {
    [LEFT]: 5,
    [RIGHT]: -5,
  }
*/
const unRotateFlows = (part: FlowPart): FlowPart =>
  ({
    ...part,
    flow: Object.entries(part.flow || {})
      .map(([angle, pressure]) => [clampRotation(Number(angle) - (part.rotate || 0)), pressure])
      .reduce((acc, [angle, pressure]) => ({ ...acc, [angle]: pressure }), {}),
  });

export const pathsFromSources = (parts: Part[]): FlowPart[] =>
  parts
    .filter(part => component(part).isSource) // -> Part[]
    .map(part => ({ liquidSource: COLD_WATER, ...part })) // -> Part[]
    .map(part => calculateFromSource(
      part as FlowPart,
      parts as FlowPart[],
      part.rotate,
      part.liquidSource,
    )) // -> FlowPart[][]
    .reduce(mergeSourceFlows, []) // -> FlowPart[]
    .map(unRotateFlows);
