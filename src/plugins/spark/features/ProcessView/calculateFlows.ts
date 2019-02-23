import { PersistentPart, Transitions, FlowPart, CalculatedFlows, FlowRoute, ComponentSettings } from './state';
import { CENTER, DEFAULT_FRICTION, DEFAULT_DELTA_PRESSURE, COLD_WATER, MIXED_LIQUIDS } from './getters';
import { Coordinates } from '@/helpers/coordinates';
import settings from './settings';
import has from 'lodash/has';
import get from 'lodash/get';
import omit from 'lodash/omit';

export const isSamePart =
  (left: PersistentPart, right: PersistentPart): boolean =>
    ['x', 'y', 'type', 'rotate'].every(k => left[k] === right[k]);

export const partSettings =
  (part: PersistentPart): ComponentSettings => settings[part.type];

export const partTransitions =
  (part: PersistentPart): Transitions => partSettings(part).transitions(part);

const adjacentPart = (
  allParts: FlowPart[],
  outCoords: string,
  currentPart: FlowPart | null = null,
): FlowPart | undefined =>
  allParts
    .find((part: FlowPart) =>
      !(currentPart && isSamePart(part, currentPart))
      && has(part, ['transitions', outCoords]));

const combineFlows =
  (left: CalculatedFlows = {}, right: CalculatedFlows = {}): CalculatedFlows =>
    Object.entries(right)
      .reduce((into: CalculatedFlows, [coord, val]) => ({ ...into, [coord]: (into[coord] || 0) + val }), left);

const combineLiquids =
  (left: string | undefined, right: string | undefined): string | undefined => {
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
    .filter(candidate => !isSamePart(sourcePart, candidate) || partSettings(candidate).isBridge);

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
  Object.entries(partTransitions(part))
    .reduce((acc, [inCoords, flows]: [string, any]) => {
      const updatedKey = new Coordinates(inCoords)
        .rotate(part.rotate)
        .translate([part.x, part.y])
        .toString();
      const updatedFlows = flows
        .map((flow: FlowRoute) => ({
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

export const asFlowParts = (parts: PersistentPart[]): FlowPart[] =>
  parts.map(part => ({ ...part, transitions: translations(part) }));

export class FlowSegment {
  public constructor(part: FlowPart, transitions: Transitions) {
    this.root = part;
    this.transitions = transitions;
  }

  public transitions: Transitions;
  public root: FlowPart;
  public splits: FlowSegment[] = [];
  public next: FlowSegment | null = null;

  public addChild(segment: FlowSegment): void {
    if (this.splits.length == 0) {
      if (this.next !== null) {
        this.splits.push(this.next); // move next to splits
        this.splits.push(segment); // add other segment to splits
        this.next = null; // set next to null for no shared next
      }
      else {
        this.next = segment;
      }
    }
    else {
      this.splits.push(segment);
    }
  }

  public friction(): number {
    let series = 1;
    let parallel = 0;
    this.splits.forEach(splitPath => {
      const splitFriction = splitPath.friction();
      if (parallel === 0) {
        parallel = splitFriction;
      }
      else {
        parallel = parallel * splitFriction / (parallel + splitFriction);
      }
    });
    if (this.next !== null) {
      series += this.next.friction();
    }
    return parallel + series;
  }

  public reduceSegments(func: (acc: any, segment: FlowSegment) => any, acc: any): any {
    acc = func(acc, this);
    this.splits.forEach((child) => {
      acc = child.reduceSegments(func, acc);
    });
    if (this.next !== null) {
      acc = func(acc, this.next);
    }
  };

  public isSameSegment(other: FlowSegment): boolean {
    return JSON.stringify(omit(this, 'transitions')) === JSON.stringify(omit(other, 'transitions'));
  }

  public leafSegments(): FlowSegment[] {
    if (this.splits.length !== 0) {
      return this.splits.reduce((acc, child) => [...acc, ...child.leafSegments()], new Array<FlowSegment>());
    }
    if (this.next !== null) {
      return this.next.leafSegments();
    }
    return [this];
  }

  public removeLeafSegment(segment: FlowSegment): void {
    this.splits.forEach((child) => child.removeLeafSegment(segment));
    if (this.next !== null) {
      if (this.next.isSameSegment(segment)) {
        this.next = null;
        return;
      }
      else {
        this.next.removeLeafSegment(segment);
      }
    }
  }

  public popDuplicatedLeaves(): FlowSegment | null {
    const leaves = this.leafSegments();
    if (leaves.length !== 0 && leaves.every(v => v.isSameSegment(leaves[0]))) {
      const combinedTransitions = leaves.reduce((acc: Transitions, leaf) => ({ ...acc, ...leaf.transitions }), {});
      leaves[0].transitions = combinedTransitions;
      this.removeLeafSegment(leaves[0]);
      return leaves[0];
    }
    return null;
  }
}

export const flowPath = (parts: FlowPart[], start: FlowPart, inCoord: string): FlowSegment | null => {
  const outFlows = get(start, ['transitions', inCoord], []);
  const path = new FlowSegment(start, {});
  const candidateParts = parts
    .filter(candidate => !isSamePart(start, candidate) || partSettings(candidate).isBridge);

  if (outFlows !== null) {
    outFlows.forEach(outFlow => {
      const nextPart = adjacentPart(candidateParts, outFlow.outCoords, start);
      let nextPath: FlowSegment | null = null;
      if (nextPart !== undefined) {
        nextPath = flowPath(candidateParts, nextPart, outFlow.outCoords);
        if (nextPath !== null) {
          path.addChild(nextPath);
        }
      }
      if (nextPath !== null || partSettings(start).isSink) {
        if (path.transitions[inCoord] === undefined) {
          path.transitions[inCoord] = [outFlow];
        }
        else {
          path.transitions[inCoord].push(outFlow);
        }
      }
    });
  }
  if (path.splits.length === 0 && path.next === null && !partSettings(start).isSink) {
    return null;
  }

  while (true) {
    if (path.splits.length !== 0) {
      const duplicated = path.popDuplicatedLeaves();
      if (duplicated !== null) {
        if (path.next === null) {
          path.next = duplicated;
        }
        else {
          duplicated.addChild(path.next);
          path.next = duplicated;
        }
      }
      else {
        return path;
      }
    }
    else {
      break;
    }
  }
  return path;
};

/*
export const addFlowForSegment(parts: FlowPart[], segment: FlowSegment, flow: number, liquid: string){

  // add flow for root part
  segment
  parts = additionalFlow(
    segment.root,
    parts,
    {
      [segment.inCoords]: addedFlow,
    },
    liquid,
  );

  // divide flow for split
  const frictionInvTotal = segment.splits.reduce((acc, split) => acc + 1 / split.friction(), 0);

  segment.splits.forEach((child) => {
    const invFriction = 1 / child.friction();
    const splitFlow = flow * invFriction / frictionInvTotal;
    parts = addFlowForSegment(parts, child, splitFlow, liquid);
  });

  // add flow to next
  parts = addFlowForSegment(parts, segment.next, flow, liquid);

  return parts;
}

export const pathsFromSources = (parts: PersistentPart[]): FlowSegment[] => {
  const flowParts = asFlowParts(parts);
  return flowParts
    .filter(part => partSettings(part).isSource) // -> FlowPart[]
    .map(part => ({ liquidSource: COLD_WATER, ...part })) // -> FlowPart[]
    .map(part => flowPath(
      flowParts,
      part,
      new Coordinates(CENTER) // Source starts from CENTER
        .rotate(part.rotate)
        .translate(part)
        .toString(),
        )) // -> FlowSegment[][]
        .reduce(mergeSourceFlows, flowParts) // -> FlowPart[]
        .map(normalizeFlows);
      };

*/
