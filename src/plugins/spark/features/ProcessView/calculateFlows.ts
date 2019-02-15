import Vue from 'vue';
import { PersistentPart, Transitions, FlowPart, CalculatedFlows, FlowRoute, ComponentConstructor } from './state';
import { CENTER, DEFAULT_FRICTION, DEFAULT_DELTA_PRESSURE, COLD_WATER, MIXED_LIQUIDS } from './getters';
import { Coordinates } from '@/helpers/coordinates';
import has from 'lodash/has';
import get from 'lodash/get';

export const isSamePart = (left: PersistentPart, right: PersistentPart) =>
  ['x', 'y', 'type', 'rotate'].every(k => left[k] === right[k]);

export const component = (part: PersistentPart) => Vue.component(part.type) as ComponentConstructor;

const adjacentPart = (
  allParts: FlowPart[],
  outCoords: string,
  currentPart: FlowPart | null = null,
): FlowPart | undefined =>
  allParts
    .find((part: FlowPart) =>
      !(currentPart && isSamePart(part, currentPart))
      && has(part, ['transitions', outCoords]));

const combineFlows = (left: CalculatedFlows = {}, right: CalculatedFlows = {}) =>
  Object.entries(right)
    .reduce((into: CalculatedFlows, [coord, val]) => ({ ...into, [coord]: (into[coord] || 0) + val }), left);

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
  flowToAdd: CalculatedFlows,
  liquid: string,
): FlowPart[] =>
  allParts
    .map((item) => {
      if (isSamePart(part, item)) {
        return { ...item, liquid, calculated: combineFlows(item.calculated, flowToAdd) };
      }
      return item;
    });

/*
  Starting with a source part, we recursively find all connected parts.
  Flow pressure is undefined until both the source, and the sink (or another source!) are known.

  Relevant part properties:

  - pressure:
    Only sources and sinks have defined pressure.
    The algorithm considers a route complete when it has found a part with defined pressure.

  - inCoords / outCoords:
    The entrypoint / exit point of the flow in the tube.
    A left-to-right straight tube will have two flows, with swapped inCoords and outCoords.
    The inCoords where liquid enters the part will have positive pressure.
    The inCoords where liquid leaves the part will have negative pressure.

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
  inCoords: string,
  liquidSource: string,
  totalFriction: number = 0,
  startPressure: number = 10,
  totalDeltaPressure: number = 0,
  candidates: FlowPart[] = allParts,
): FlowPart[] => {
  const candidateParts = candidates
    .filter(candidate => !isSamePart(sourcePart, candidate) || component(candidate).isBridge);

  const outFlowReducer = (parts: FlowPart[], outFlow: FlowRoute): FlowPart[] => {
    const { outCoords, pressure, friction, deltaPressure } = outFlow;
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
          [outCoords]: pathFlow,
          [inCoords]: -pathFlow,
        },
        liquidSource,
      );
    }

    const nextPart = adjacentPart(candidateParts, outCoords, sourcePart);

    if (!nextPart) {
      // no flow possible -> route is done
      return additionalFlow(
        sourcePart,
        parts,
        {
          [outCoords]: 0,
          [inCoords]: 0,
        },
        liquidSource,
      );
    }

    const existingFlow = get(nextPart, ['calculated', outCoords], 0);

    // recursively call calculateFromSource(), with the next part being the "source"
    const nextFlows = calculateFromSource(
      nextPart,
      parts,
      outCoords,
      liquidSource,
      totalFriction,
      startPressure,
      totalDeltaPressure,
      candidateParts,
    );

    const updatedNextPart = nextFlows.find((part: FlowPart) => isSamePart(part, nextPart)) || {};
    const newFlow = get(updatedNextPart, ['calculated', outCoords], 0);
    const addedFlow = newFlow - existingFlow;

    // The recursion tree has returned, merge the flow for this part into the result set
    return additionalFlow(
      sourcePart,
      nextFlows,
      {
        [outCoords]: -addedFlow,
        [inCoords]: addedFlow,
      },
      liquidSource,
    );
  };

  // Calculate the route for each outflow the source part has
  // return partOutFlows(sourcePart, inCoords)
  return (sourcePart.transitions || {})[inCoords]
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
        existing.calculated = combineFlows(existing.calculated, part.calculated);
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
    [LEFT]: [{ outCoords: RIGHT, friction: 1 }],
    [RIGHT]: [{ outCoords: LEFT, friction: 1 }],
  }

  If we connect it, and rotate it by 90 degrees, calculateFromSource may yield:
  {
    [UP]: 5,
    [DOWN]: -5
  }

  The parts will be rendered at rotation=0, and then rotated in their entirety.
  To enable this, we must match translate inCoords of calculated pressure to what it would be at rotation=0.

  Desired output:
  {
    [LEFT]: 5,
    [RIGHT]: -5,
  }
*/
const normalizeFlows = (part: FlowPart): FlowPart => {
  if (!part.calculated) {
    return { ...part, calculated: {} };
  }
  const newFlows = Object.entries(part.calculated)
    .reduce((acc, [inCoord, pressure]: [string, number]) => {
      const nullCoord = new Coordinates(inCoord)
        .translate([-part.x, -part.y])
        .rotate(-part.rotate)
        .toString();
      return { ...acc, [nullCoord]: pressure };
    },
      {},
    );
  return { ...part, calculated: newFlows };
};


const translations = (part: PersistentPart): Transitions =>
  Object.entries(component(part).transitions(part))
    .reduce((acc, [inCoords, flows]) => {
      const updatedKey = new Coordinates(inCoords)
        .rotate(part.rotate)
        .translate([part.x, part.y])
        .toString();
      const updatedFlows = flows
        .map(flow => ({
          ...flow,
          outCoords: new Coordinates(flow.outCoords)
            .rotate(part.rotate)
            .translate([part.x, part.y])
            .toString(),
        }));
      return { ...acc, [updatedKey]: updatedFlows };
    },
      {},
    );


const asFlowParts = (parts: PersistentPart[]) =>
  parts
    .map(part => ({ ...part, transitions: translations(part) }));

export const pathsFromSources = (parts: PersistentPart[]): FlowPart[] => {
  const flowParts = asFlowParts(parts);
  return flowParts
    .filter(part => component(part).isSource) // -> FlowPart[]
    .map(part => ({ liquidSource: COLD_WATER, ...part })) // -> FlowPart[]
    .map(part => calculateFromSource(
      part,
      flowParts,
      new Coordinates(CENTER) // Source starts from CENTER
        .rotate(part.rotate)
        .translate(part)
        .toString(),
      part.liquidSource,
    )) // -> FlowPart[][]
    .reduce(mergeSourceFlows, flowParts) // -> FlowPart[]
    .map(normalizeFlows);
};
