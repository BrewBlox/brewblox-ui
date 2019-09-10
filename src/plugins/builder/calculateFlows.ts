import get from 'lodash/get';
import has from 'lodash/has';
import mapKeys from 'lodash/mapKeys';
import mapValues from 'lodash/mapValues';
import pickBy from 'lodash/pickBy';
import set from 'lodash/set';

import { Coordinates } from '@/helpers/coordinates';

import { FlowSegment, mergeOverlappingSplits } from './FlowSegment';
import {
  CalculatedFlows,
  FlowPart,
  FlowRoute,
  LiquidFlow,
  StatePart,
  Transitions,
} from './types';

const adjacentPart = (
  allParts: FlowPart[],
  outCoords: string,
  currentPart: FlowPart | null = null,
): FlowPart | null =>
  allParts
    .find((part: FlowPart) =>
      !(currentPart && part.id === currentPart.id)
      && has(part, ['transitions', outCoords])) || null;

const normalizeFlows = (part: FlowPart): FlowPart => {
  if (!part.flows) {
    return { ...part, flows: {} };
  }

  const newFlows = mapKeys(part.flows,
    (flow, inCoord) =>
      new Coordinates(inCoord)
        .translate([-part.x, -part.y, 0])
        .toString()
  );

  return { ...part, flows: newFlows };
};

const translations = (part: StatePart): Transitions => {
  const result: Transitions = {};
  Object.entries(part.transitions).forEach(
    ([inCoordStr, transition]: [string, any]) => {
      // inCoords are relative from part anchor === [0, 0, 0]

      const updatedKey = new Coordinates(inCoordStr)
        .flipShapeEdge(!!part.flipped, 0, part.size)
        .translate([part.x, part.y, 0])
        .rotateShapeEdge(part.rotate, 0, part.size, [part.x, part.y, 0])
        .toString();

      const updatedTransition = transition
        .map((route: FlowRoute) => ({
          ...route,
          outCoords: new Coordinates(route.outCoords)
            .flipShapeEdge(!!part.flipped, 0, part.size)
            .translate([part.x, part.y, 0])
            .rotateShapeEdge(part.rotate, 0, part.size, [part.x, part.y, 0])
            .toString(),
        }));

      result[updatedKey] = updatedTransition;
    });
  return result;
};

export const asFlowParts = (parts: StatePart[]): FlowPart[] =>
  parts.map(part => ({ ...part, transitions: translations(part), flows: {} }));

const combineFlows =
  (left: CalculatedFlows = {}, right: CalculatedFlows = {}): CalculatedFlows => {
    const combined: CalculatedFlows = left;
    for (const coord in right) {
      for (const liquid in right[coord]) {
        set(combined, [coord, liquid], get(combined, [coord, liquid], 0) + right[coord][liquid]);
      }
    }
    return combined;
  };

const mergeFlows = (flows: CalculatedFlows): CalculatedFlows => {
  const mergedFlows: CalculatedFlows = {};
  Object.entries(flows)
    .forEach(([coord, coordFlows]: [string, LiquidFlow]) => {
      const splitPosNeg = (toSplit: LiquidFlow): [LiquidFlow, LiquidFlow, number, number] => {
        const positive = pickBy(toSplit, flow => flow >= 0);
        const negative = pickBy(toSplit, flow => flow < 0);
        const posTotal = Object.values(positive).reduce((sum, v) => sum + v, 0);
        const negTotal = Object.values(negative).reduce((sum, v) => sum + v, 0);
        return [positive, negative, posTotal, negTotal];
      };

      const scale = (unscaledFlows: LiquidFlow, factor: number): LiquidFlow => {
        const entries = Object.entries(unscaledFlows);
        const qty = entries.length;
        if (qty && entries.every(([, v]) => v === 0)) {
          return mapValues(unscaledFlows, () => factor / qty);
        }
        return mapValues(unscaledFlows, v => v * factor);
      };

      let toMerge = coordFlows;

      const [positive, negative, posTotal, negTotal] = splitPosNeg(toMerge);

      const total = posTotal + negTotal;
      // if flow exists in both directions, only keep the biggest and scale it down to the net flow
      if (posTotal !== 0 && negTotal !== 0) {
        toMerge = (posTotal >= -negTotal)
          ? scale(positive, total / posTotal)
          : scale(negative, total / negTotal);
      }

      // remove flows of zero if there is net flow
      if (total !== 0) {
        Object.entries(toMerge).forEach(([k, v]) => {
          if (v === 0) {
            delete toMerge[k];
          }
        });
      }

      if (toMerge) {
        mergedFlows[coord] = toMerge;
      }
    });
  return mergedFlows;
};
/*
  Find the part in allParts, and then merge the new flow into allParts.
*/
const additionalFlow = (
  part: FlowPart,
  allParts: FlowPart[],
  flowToAdd: CalculatedFlows,
): FlowPart[] =>
  allParts
    .map((item) =>
      part.id === item.id
        ? { ...item, flows: combineFlows(item.flows, flowToAdd) }
        : item);

const innerFlowPath = (
  parts: FlowPart[],
  start: FlowPart,
  inRoute: FlowRoute): FlowSegment | null => {

  const inCoord = inRoute.outCoords;
  const outFlows: FlowRoute[] = get(start, ['transitions', inCoord], []);
  const path = new FlowSegment(start, inRoute);

  if (outFlows.length === 0) {
    return null;
  }

  const filterTransitions = (partsToFilter: FlowPart[], inCoord: string, outCoord: string): void => {
    for (const part of partsToFilter) {
      // filter out transition with same source and destination
      if (part.transitions[inCoord]) {
        // Use filter, not splice, because the loop below is looping over the outFlows.
        // Mutating the original array will cause the iterator to shift
        part.transitions[inCoord] = part.transitions[inCoord].filter(outFlow => outFlow.outCoords !== outCoord);
        if (part.transitions[inCoord].length === 0) {
          delete part.transitions[inCoord];
        }
      }
    }
  };

  const candidateParts = parts.reduce((acc: FlowPart[], part: FlowPart): FlowPart[] => {
    // only include parts with transitions remaining
    // for a split, make a copy of transitions to process both ends independently
    if (Object.keys(part.transitions).length !== 0) {
      acc.push((outFlows.length > 1) ?
        { ...part, transitions: { ...part.transitions } }
        : part);
    }
    return acc;
  }, []);

  const nextPaths: FlowSegment[] = [];

  for (const outFlow of outFlows) {
    if (outFlow.sink) {
      path.next = new FlowSegment(start, outFlow);
      path.next.sinksTo.add(outFlow.outCoords);
      path.sinksTo.add(outFlow.outCoords);
      return path;
    }
    else {
      const nextPart = outFlow.internal ? start : adjacentPart(candidateParts, outFlow.outCoords, start);
      if (nextPart !== null) {
        // find a new path
        filterTransitions(candidateParts, inCoord, outFlow.outCoords); // filter out same transition
        filterTransitions(candidateParts, outFlow.outCoords, inCoord); // filter out reverse transition
        const next = innerFlowPath(candidateParts, nextPart, outFlow);
        if (next !== null && next.sinksTo.size) {
          nextPaths.push(next);
          next.sinksTo.forEach(sink => { path.sinksTo.add(sink); });
        }
      }
    };
  }

  if (nextPaths.length === 1) {
    path.next = nextPaths[0];
  }

  if (nextPaths.length > 1) {
    path.splits = nextPaths;
    return mergeOverlappingSplits(path);
  }

  if (path.sinksTo.size !== 0) {
    return path;
  }
  return null;
};

export const flowPath = (
  parts: FlowPart[],
  start: FlowPart,
  inRoute: FlowRoute): FlowSegment | null =>
  innerFlowPath(parts.map(part => ({ ...part, transitions: { ...part.transitions } })), start, inRoute);

export const addFlowForPath = (
  parts: FlowPart[],
  path: FlowSegment,
  flows: LiquidFlow,
): FlowPart[] => {

  const inFlow: CalculatedFlows = {};
  const outFlow: CalculatedFlows = {};
  const splitFlow: CalculatedFlows = {};

  // add flow for incoming transition
  inFlow[path.inRoute.outCoords] = mapValues(flows, v => -v);

  // add flow for outgoing flow
  if (path.next) {
    outFlow[path.next.inRoute.outCoords] = flows;
  }

  // divide flow for splits in between
  if (path.splits.length !== 0) {
    path.splits
      .forEach((child, idx) => {
        const scaledFlow = mapValues(flows, v => v * path.splitDivide[idx]);
        splitFlow[child.inRoute.outCoords] = scaledFlow;
        parts = addFlowForPath(parts, child, scaledFlow);
      });
  }

  parts = additionalFlow(
    path.root,
    parts,
    {
      ...inFlow,
      ...outFlow,
      ...splitFlow,
    }
  );

  // continue path
  if (path.next) {
    parts = addFlowForPath(parts, path.next, flows);
  }

  return parts;
};

export const findPathsFromSources = (parts: FlowPart[], part: FlowPart): FlowSegment[] => {
  const paths: FlowSegment[] = [];
  for (const [inCoord, outCoords] of Object.entries(part.transitions)) {
    const startFlow = outCoords.find(route => route.source && route.liquids);
    if (startFlow) {
      const path = flowPath(parts, part, { outCoords: inCoord, liquids: startFlow.liquids });
      if (path !== null) {
        paths.push(path);
      }
    }
  }
  return paths;
};

const addFlowFromPart = (parts: FlowPart[], part: FlowPart): FlowPart[] => {
  for (const path of findPathsFromSources(parts, part)) {
    const { friction, pressureDiff } = path.friction({ pressureDiff: 0, friction: 0 });

    if (path.inRoute.liquids) {
      const startFlow: LiquidFlow = {};
      for (const liquid of path.inRoute.liquids) {
        startFlow[liquid] = pressureDiff / friction;
      };
      parts = addFlowForPath(parts, path, startFlow);
    }

  }
  return parts;
};

// total flow is a superposition of all sources in the system
// for each part, add the flow it adds to the global list of parts
// merge the flows afterwards
export const calculateFlows = (parts: FlowPart[]): FlowPart[] =>
  parts
    .reduce(addFlowFromPart, parts)
    .map(part => ({ ...part, flows: mergeFlows(part.flows) }));

// can be used to check whether a part has equal in and out flow
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
const unbalancedFlow = (part: FlowPart): number =>
  Object.values(part.flows)
    .reduce((sum: number, v: LiquidFlow) =>
      Object.values(v)
        .reduce((sum2: number, w: number) => sum2 + w, sum),
      0);

export const calculateNormalizedFlows = (parts: StatePart[]): FlowPart[] =>
  calculateFlows(asFlowParts(parts)).map(normalizeFlows);
