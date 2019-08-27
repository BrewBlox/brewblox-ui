/**
 * IMPORTANT: this file is used by a web worker.
 * It can't import any modules with a dependency on a VueX store.
 * You'll notice it went wrong if your Webpack build fails with 0 errors.
 */

import get from 'lodash/get';
import has from 'lodash/has';
import mapKeys from 'lodash/mapKeys';
import mapValues from 'lodash/mapValues';
import pickBy from 'lodash/pickBy';
import set from 'lodash/set';

import { Coordinates } from '@/helpers/coordinates';

import { FlowSegment } from './FlowSegment';
import { ACCELERATE_OTHERS } from './getters';
import {
  CalculatedFlows,
  FlowPart,
  FlowRoute,
  LiquidFlow,
  StatePart,
  Transitions,
} from './types';

export const partCenter =
  (part: StatePart): [number, number, number] => {
    const [sizeX, sizeY] = part.size;
    return [sizeX / 2, sizeY / 2, 0];
  };

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
        .flipShapeEdge(!!part.flipped, part.rotate, part.size)
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

      const scale = (unscaledFlows: LiquidFlow, factor: number): LiquidFlow =>
        mapValues(unscaledFlows, v => v * factor);

      let toMerge = coordFlows;
      let acceleration = coordFlows[ACCELERATE_OTHERS]; // special liquid type set by pumps


      let [positive, negative, posTotal, negTotal] = splitPosNeg(toMerge);
      const liquidsTotal = posTotal + negTotal - acceleration;

      // if acceleration is bigger than other flows combined and opposite sign, the flow is reversed
      if (liquidsTotal && acceleration / liquidsTotal < -1) {
        const newTotal = acceleration + liquidsTotal;
        toMerge = scale(toMerge, newTotal / liquidsTotal);
        delete toMerge[ACCELERATE_OTHERS];
        acceleration = 0;
        [positive, negative, posTotal, negTotal] = splitPosNeg(toMerge);
      }

      const total = posTotal + negTotal;
      // if flow exists in both directions, only keep the biggest and scale it down to the net flow
      if (posTotal !== 0 && negTotal !== 0) {
        toMerge = (posTotal >= -negTotal)
          ? scale(positive, total / posTotal)
          : scale(negative, total / negTotal);
      }

      // check again, could be discard as part of positive or negative
      acceleration = toMerge[ACCELERATE_OTHERS];
      if (acceleration) {
        if (total !== acceleration) {
          toMerge = scale(toMerge, total / (total - acceleration));
          delete toMerge[ACCELERATE_OTHERS];
        }
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

export const flowPath = (
  parts: FlowPart[],
  start: FlowPart,
  inCoord: string,
  startCoord: string = inCoord): FlowSegment | null => {
  const outFlows: FlowRoute[] = get(start, ['transitions', inCoord], []);
  const path = new FlowSegment(start, {});

  if (outFlows.length === 0) {
    return null;
  }

  let candidateParts: FlowPart[] = parts.reduce((acc: FlowPart[], part: FlowPart) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [inCoord]: _, ...filteredTransitions } = part.transitions; // make a copy of transitions excluding inCoord

    if (inCoord !== startCoord) {
      Object.keys(filteredTransitions).forEach(k => {
        // filter out any transitions that go back to the inCoord to remove loops
        filteredTransitions[k] = filteredTransitions[k].filter(
          route => (route.outCoords != inCoord)
        );
      });
    }

    if (Object.getOwnPropertyNames(filteredTransitions).length !== 0) { // exclude parts without transitions
      acc.push({ ...part, transitions: filteredTransitions });
    }
    return acc;
  }, []);

  for (const outFlow of outFlows) {
    while (true) {
      const nextPart =
        (candidateParts.length === 0) ? null :
          outFlow.internal ? start : adjacentPart(candidateParts, outFlow.outCoords, start);

      let nextPath: FlowSegment | null = null;
      if (nextPart !== null) {
        nextPath = flowPath(candidateParts, nextPart, outFlow.outCoords, startCoord);
        if (nextPath !== null) {
          path.addChild(nextPath);
        }
      }

      if (nextPath !== null || outFlow.outCoords === startCoord) {
        if (path.transitions[inCoord] === undefined) {
          path.transitions[inCoord] = [outFlow];
        }
        else {
          path.transitions[inCoord].push(outFlow);
        }
      }
      if (!nextPart || outFlow.internal) {
        break;
      }
      candidateParts = candidateParts
        .filter(part => nextPart && !(nextPart.id === part.id));
    }
  };

  if (path.transitions[inCoord] === undefined) {
    return null;
  }

  path.removeInternalFlows();

  path.transitions[inCoord] = [...new Set(path.transitions[inCoord])]; // remove duplicates

  let duplicated: FlowSegment | null = null;
  do {
    if (path.splits.length !== 0) {
      duplicated = path.popDuplicatedLeaves();
      if (duplicated !== null) {
        if (path.next !== null) {
          duplicated.addChild(path.next);
        }
        path.next = duplicated;
      }
    }
  } while (duplicated !== null);

  return path;
};

export const addFlowForSegment = (
  parts: FlowPart[],
  segment: FlowSegment,
  flows: LiquidFlow,
): FlowPart[] => {

  const inFlow: CalculatedFlows = {};
  const outFlow: CalculatedFlows = {};

  // add flow for root part
  Object.entries(segment.transitions)
    .forEach(([inCoords, outFlows]) => {
      inFlow[inCoords] = mapValues(flows, v => -v);
      if (segment.splits.length === 0) { // for split path, outflow is handled below to split it
        outFlows.forEach((route: FlowRoute) => {
          outFlow[route.outCoords] = outFlow[route.outCoords] ?
            { ...outFlow[route.outCoords], ...flows }
            : flows;
        });
      };
    });

  if (segment.splits.length !== 0) {
    // divide flow for split
    const frictionInvTotal = segment.splits.reduce((acc, split) => acc + 1 / split.friction(), 0);
    segment.splits
      .forEach((child) => {
        const invFriction = 1 / child.friction();
        const splitFlows: LiquidFlow = mapValues(flows,
          flowVal => flowVal * invFriction / frictionInvTotal);

        const childInCoords = Object.keys(child.transitions)[0];

        for (const liquid in splitFlows) {
          set(outFlow, [childInCoords, liquid], get(outFlow, [childInCoords, liquid], 0) + splitFlows[liquid]);
        };

        parts = addFlowForSegment(parts, child, splitFlows);
      });
  }

  parts = additionalFlow(
    segment.root,
    parts,
    {
      ...inFlow,
      ...outFlow,
    }
  );


  // add flow for next
  if (segment.next) {
    parts = addFlowForSegment(parts, segment.next, flows);
  }

  return parts;
};

const addFlowFromPart = (parts, part): FlowPart[] => {
  for (const inCoords in part.transitions) {
    const outFlows = part.transitions[inCoords] || [];
    for (const outFlow of outFlows) {
      const pressure: number = outFlow.pressure || 0;
      const liquids: string[] | undefined = outFlow.liquids;
      if (pressure && Array.isArray(liquids)) {
        const path = flowPath(parts, part, inCoords);
        if (path !== null) {
          const startFlow: LiquidFlow = {};
          liquids.forEach((liquid: string) => {
            startFlow[liquid] = pressure / path.friction();
          });
          parts = addFlowForSegment(parts, path, startFlow);
        }
      }
    }
  }
  return parts;
};

// total flow is a superposition of all pressure sources in the system
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
