import { FlowPart, FlowSegment, mergeOverlappingSplits } from './FlowSegment';
import {
  BuilderPart,
  FlowRoute,
  LiquidFlow,
  PartFlows,
  PartTransitions,
} from './types';
import { Coordinates } from '@/utils/coordinates';
import get from 'lodash/get';
import has from 'lodash/has';
import mapKeys from 'lodash/mapKeys';
import mapValues from 'lodash/mapValues';
import pickBy from 'lodash/pickBy';
import set from 'lodash/set';

const adjacentPart = (
  allParts: FlowPart[],
  outCoords: string,
  currentPart: FlowPart | null = null,
): FlowPart | null =>
  allParts.find(
    (part: FlowPart) =>
      !(currentPart && part.id === currentPart.id) &&
      has(part, ['transitions', outCoords]),
  ) || null;

const normalizeFlows = (
  acc: Mapped<PartFlows>,
  part: FlowPart,
): Mapped<PartFlows> => {
  if (part.flows) {
    acc[part.id] = mapKeys(part.flows, (flow, inCoord) =>
      new Coordinates(inCoord).translate([-part.x, -part.y, 0]).toString(),
    );
  }
  return acc;
};

const translatedTransitions = (
  part: BuilderPart,
  transitions: Maybe<PartTransitions>,
): PartTransitions => {
  if (!transitions) {
    return {};
  }

  const result: PartTransitions = {};
  for (const inCoordStr in transitions) {
    const routes = transitions[inCoordStr];
    // inCoords are relative from part anchor === [0, 0, 0]

    const updatedInCoordStr = new Coordinates(inCoordStr)
      .flipShapeEdge(!!part.flipped, 0, part)
      .translate([part.x, part.y, 0])
      .rotateShapeEdge(part.rotate, 0, part, [part.x, part.y, 0])
      .toString();

    const updatedRoutes = routes.map((route: FlowRoute) => ({
      ...route,
      outCoords: new Coordinates(route.outCoords)
        .flipShapeEdge(!!part.flipped, 0, part)
        .translate([part.x, part.y, 0])
        .rotateShapeEdge(part.rotate, 0, part, [part.x, part.y, 0])
        .toString(),
    }));

    result[updatedInCoordStr] = updatedRoutes;
  }
  return result;
};

export const asFlowParts = (
  parts: BuilderPart[],
  allTransitions: Mapped<PartTransitions>,
): FlowPart[] =>
  parts.map((part) => ({
    ...part,
    transitions: translatedTransitions(part, allTransitions[part.id]),
    flows: {},
  }));

const combineFlows = (
  left: PartFlows = {},
  right: PartFlows = {},
): PartFlows => {
  const combined: PartFlows = left;
  for (const coord in right) {
    for (const liquid in right[coord]) {
      set(
        combined,
        [coord, liquid],
        get(combined, [coord, liquid], 0) + right[coord][liquid],
      );
    }
  }
  return combined;
};

const mergeFlows = (flows: PartFlows): PartFlows => {
  const mergedFlows: PartFlows = {};
  Object.entries(flows).forEach(([coord, coordFlows]: [string, LiquidFlow]) => {
    const splitPosNeg = (
      toSplit: LiquidFlow,
    ): [LiquidFlow, LiquidFlow, number, number] => {
      const positive = pickBy(toSplit, (flow) => flow >= 0);
      const negative = pickBy(toSplit, (flow) => flow < 0);
      const posTotal = Object.values(positive).reduce((sum, v) => sum + v, 0);
      const negTotal = Object.values(negative).reduce((sum, v) => sum + v, 0);
      return [positive, negative, posTotal, negTotal];
    };

    const scale = (unscaledFlows: LiquidFlow, factor: number): LiquidFlow => {
      const entries = Object.entries(unscaledFlows);
      const len = entries.length;
      if (len && entries.every(([, v]) => v === 0)) {
        return mapValues(unscaledFlows, () => factor / len);
      }
      return mapValues(unscaledFlows, (v) => v * factor);
    };

    let toMerge = coordFlows;

    const [positive, negative, posTotal, negTotal] = splitPosNeg(toMerge);

    const total = posTotal + negTotal;
    // if flow exists in both directions, only keep the biggest and scale it down to the net flow
    if (posTotal !== 0 && negTotal !== 0) {
      toMerge =
        posTotal >= -negTotal
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
  flowToAdd: PartFlows,
): FlowPart[] =>
  allParts.map((item) =>
    part.id === item.id
      ? { ...item, flows: combineFlows(item.flows, flowToAdd) }
      : item,
  );

const innerFlowPath = (
  parts: FlowPart[],
  start: FlowPart,
  inRoute: FlowRoute,
): FlowSegment | null => {
  const inCoord = inRoute.outCoords;
  const outFlows: FlowRoute[] = get(start, ['transitions', inCoord], []);
  const path = new FlowSegment(start, inRoute);

  if (outFlows.length === 0) {
    return null;
  }

  const filterTransitions = (
    partsToFilter: FlowPart[],
    inCoord: string,
    outCoord: string,
  ): void => {
    for (const part of partsToFilter) {
      // filter out transition with same source and destination
      if (part.transitions[inCoord]) {
        // Use filter, not splice, because the loop below is looping over the outFlows.
        // Mutating the original array will cause the iterator to shift
        part.transitions[inCoord] = part.transitions[inCoord].filter(
          (outFlow) => outFlow.outCoords !== outCoord,
        );
        if (part.transitions[inCoord].length === 0) {
          delete part.transitions[inCoord];
        }
      }
    }
  };

  const candidateParts = parts.reduce(
    (acc: FlowPart[], part: FlowPart): FlowPart[] => {
      // only include parts with transitions remaining
      // for a split, make a copy of transitions to process both ends independently
      if (Object.keys(part.transitions).length !== 0) {
        acc.push(
          outFlows.length > 1
            ? { ...part, transitions: { ...part.transitions } }
            : part,
        );
      }
      return acc;
    },
    [],
  );

  const nextPaths: FlowSegment[] = [];

  for (const outFlow of outFlows) {
    if (outFlow.sink) {
      path.next = new FlowSegment(start, outFlow);
      path.next.sinksTo.add(outFlow.outCoords);
      path.sinksTo.add(outFlow.outCoords);
      return path;
    } else {
      const nextPart = outFlow.internal
        ? start
        : adjacentPart(candidateParts, outFlow.outCoords, start);
      if (nextPart !== null) {
        // find a new path

        // filter out same transition
        filterTransitions(candidateParts, inCoord, outFlow.outCoords);
        // filter out reverse transition
        filterTransitions(candidateParts, outFlow.outCoords, inCoord);
        const next = innerFlowPath(candidateParts, nextPart, outFlow);
        if (next !== null && next.sinksTo.size) {
          nextPaths.push(next);
          next.sinksTo.forEach((sink) => {
            path.sinksTo.add(sink);
          });
        }
      }
    }
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
  inRoute: FlowRoute,
): FlowSegment | null =>
  innerFlowPath(
    parts.map((part) => ({ ...part, transitions: { ...part.transitions } })),
    start,
    inRoute,
  );

export const addFlowForPath = (
  parts: FlowPart[],
  path: FlowSegment,
  flows: LiquidFlow,
): FlowPart[] => {
  const inFlow: PartFlows = {};
  const outFlow: PartFlows = {};
  const splitFlow: PartFlows = {};

  // add flow for incoming transition
  inFlow[path.inRoute.outCoords] = mapValues(flows, (v) => -v);

  // add flow for outgoing flow
  if (path.next && path.splits.length === 0) {
    outFlow[path.next.inRoute.outCoords] = flows;
  }

  // divide flow for splits in between
  if (path.splits.length !== 0) {
    path.splits.forEach((child, idx) => {
      const scaledFlow = mapValues(flows, (v) => v * path.splitDivide[idx]);
      splitFlow[child.inRoute.outCoords] = scaledFlow;
      parts = addFlowForPath(parts, child, scaledFlow);
    });
  }

  const newFlows = {
    ...inFlow,
    ...outFlow,
    ...splitFlow,
  };

  parts = additionalFlow(path.root, parts, newFlows);

  // continue path
  if (path.next) {
    parts = addFlowForPath(parts, path.next, flows);
  }

  return parts;
};

export const findPathsFromSources = (
  parts: FlowPart[],
  part: FlowPart,
): FlowSegment[] => {
  const paths: FlowSegment[] = [];
  for (const [inCoord, outCoords] of Object.entries(part.transitions)) {
    const startFlow = outCoords.find((route) => route.source && route.liquids);
    if (startFlow) {
      const path = flowPath(parts, part, {
        outCoords: inCoord,
        liquids: startFlow.liquids,
      });
      if (path !== null) {
        paths.push(path);
      }
    }
  }
  return paths;
};

const addFlowFromPart = (parts: FlowPart[], part: FlowPart): FlowPart[] => {
  for (const path of findPathsFromSources(parts, part)) {
    const { friction, pressureDiff } = path.friction({
      pressureDiff: 0,
      friction: 0,
    });

    if (path.inRoute.liquids) {
      const startFlow: LiquidFlow = {};
      for (const liquid of path.inRoute.liquids) {
        startFlow[liquid] = pressureDiff / friction;
      }
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
    .map((part) => ({ ...part, flows: mergeFlows(part.flows) }));

export const calculateNormalizedFlows = (
  parts: BuilderPart[],
  allTransitions: Mapped<PartTransitions>,
): Mapped<PartFlows> =>
  calculateFlows(asFlowParts(parts, allTransitions)).reduce(normalizeFlows, {});
