import get from 'lodash/get';
import has from 'lodash/has';
import mapKeys from 'lodash/mapKeys';
import mapValues from 'lodash/mapValues';
import omit from 'lodash/omit';
import pickBy from 'lodash/pickBy';
import set from 'lodash/set';

import { Coordinates } from '@/helpers/coordinates';

import { FlowSegment } from './FlowSegment';
import { ACCELERATE_OTHERS } from './getters';
import specs from './specs';
import {
  CalculatedFlows,
  ComponentSpec,
  FlowPart,
  FlowRoute,
  LiquidFlow,
  StatePart,
  Transitions,
} from './types';

export const removeTransitions =
  (parts: FlowPart[], inCoord: string): FlowPart[] => parts.map(
    part => ({ ...part, transitions: omit(part.transitions, inCoord) }));

export const partSpecs =
  (part: StatePart): ComponentSpec => specs[part.type];

export const partTransitions =
  (part: StatePart): Transitions => partSpecs(part).transitions(part);

export const partSize =
  (part: StatePart): [number, number] => partSpecs(part).size(part);

export const partCenter =
  (part: StatePart): [number, number, number] => {
    const [sizeX, sizeY] = partSize(part);
    return [sizeX / 2, sizeY / 2, 0];
  };

const adjacentPart = (
  allParts: FlowPart[],
  outCoords: string,
  currentPart: FlowPart | null = null,
): FlowPart | undefined =>
  allParts
    .find((part: FlowPart) =>
      !(currentPart && part.id === currentPart.id)
      && has(part, ['transitions', outCoords]));

const normalizeFlows = (part: FlowPart): FlowPart => {
  if (!part.flows) {
    return { ...part, flows: {} };
  }
  const size = partSize(part);

  const newFlows = mapKeys(part.flows,
    (flow, inCoord) =>
      new Coordinates(inCoord)
        .translate([-part.x, -part.y, 0])
        .flipShapeEdge(!!part.flipped, part.rotate, size)
        .toString()
  );

  return { ...part, flows: newFlows };
};

const translations = (part: StatePart): Transitions =>
  Object.entries(partTransitions(part))
    .reduce((acc, [inCoordStr, transition]: [string, any]) => {
      // inCoords are relative from part anchor === [0, 0, 0]

      const size = partSize(part);

      const updatedKey = new Coordinates(inCoordStr)
        .flipShapeEdge(!!part.flipped, 0, size)
        .translate([part.x, part.y, 0])
        .rotateShapeEdge(part.rotate, 0, size, [part.x, part.y, 0])
        .toString();

      const updatedTransition = transition
        .map((route: FlowRoute) => ({
          ...route,
          outCoords: new Coordinates(route.outCoords)
            .flipShapeEdge(!!part.flipped, 0, size)
            .translate([part.x, part.y, 0])
            .rotateShapeEdge(part.rotate, 0, size, [part.x, part.y, 0])
            .toString(),
        }));

      return { ...acc, [updatedKey]: updatedTransition };
    },
      {},
    );

export const asFlowParts = (parts: StatePart[]): FlowPart[] =>
  parts.map(part => ({ ...part, transitions: translations(part), flows: {} }));

const combineFlows =
  (left: CalculatedFlows = {}, right: CalculatedFlows = {}): CalculatedFlows => {
    const combined: CalculatedFlows = left;
    for (let coord in right) {
      for (let liquid in right[coord]) {
        set(combined, [coord, liquid], get(combined, [coord, liquid], 0) + right[coord][liquid]);
      }
    }
    return combined;
  };

const mergeFlows = (flows: CalculatedFlows): CalculatedFlows =>
  Object.entries(flows)
    .reduce((mergedFlows, [coord, coordFlows]: [string, LiquidFlow]): CalculatedFlows => {
      const splitPosNeg = (toSplit: LiquidFlow): [LiquidFlow, LiquidFlow, number, number] => {
        const positive = pickBy(toSplit, flow => flow >= 0);
        const negative = pickBy(toSplit, flow => flow < 0);
        let posTotal = Object.values(positive).reduce((sum, v) => sum + v, 0);
        let negTotal = Object.values(negative).reduce((sum, v) => sum + v, 0);
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

      let total = posTotal + negTotal;
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

      return (toMerge === {})
        ? mergedFlows
        : { ...mergedFlows, [coord]: toMerge };
    },
      {});

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

  let candidateParts = removeTransitions(parts, inCoord);

  for (let outFlow of outFlows) {
    let nextPart: FlowPart | undefined;
    while (true) {
      nextPart = adjacentPart(candidateParts, outFlow.outCoords, start);
      let nextPath: FlowSegment | null = null;
      if (nextPart !== undefined && outFlow.outCoords !== startCoord) {
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
      if (!nextPart) {
        break;
      }
      candidateParts = candidateParts
        .filter(part => nextPart && !(nextPart.id === part.id));
    }
  };
  if (path.transitions[inCoord] === undefined) {
    return null;
  }
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

  let inFlow: CalculatedFlows = {};
  let outFlow: CalculatedFlows = {};

  // add flow for root part
  Object.entries(segment.transitions)
    .forEach(([inCoords, outFlows]) => {
      inFlow[inCoords] = mapValues(flows, v => -v);
      if (segment.splits.length === 0) { // for split path, outflow is handled below to split it
        outFlow = outFlows
          .reduce((acc: CalculatedFlows, v: FlowRoute) => (
            {
              ...acc,
              [v.outCoords]: {
                ...flows,
              },
            }
          ), {});
      }
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

        for (let liquid in splitFlows) {
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
  for (let inCoords in part.transitions) {
    const outFlows = part.transitions[inCoords];
    for (let outFlow of outFlows) {
      const pressure: number = outFlow.pressure || 0;
      const liquids: string[] | undefined = outFlow.liquids;
      if (pressure && Array.isArray(liquids)) {
        const path = flowPath(parts, part, inCoords);
        if (path !== null) {
          const startFlow = liquids
            .reduce((acc: LiquidFlow, liquid: string) => ({
              ...acc,
              [liquid]: pressure / path.friction(),
            }), {});
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
