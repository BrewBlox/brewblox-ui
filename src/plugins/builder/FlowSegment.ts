import { Notify } from 'quasar';

import { DEFAULT_FRICTION } from './getters';
import { FlowPart, FlowRoute, PathFriction } from './types';

export class FlowSegment {
  public constructor(part: FlowPart, route: FlowRoute) {
    this.root = part;
    this.inRoute = route;
  }

  public root: FlowPart;
  public inRoute: FlowRoute;
  public splits: FlowSegment[] = [];
  public sinksTo: Set<string> = new Set<string>();

  public splitDivide: number[] = [];
  public next: FlowSegment | null = null;

  public friction(input: PathFriction): PathFriction {
    const equivalentFriction =
      (toTransform: PathFriction[], splitInput: PathFriction): { total: PathFriction; split: number[] } => {

        const basePressure = splitInput.pressureDiff ? 0 : 0.01;
        splitInput.pressureDiff += basePressure; // zero input pressure throws off calculation.

        // Apply Millman’s Theorem Equation to calculate node pressure on the split
        const allPaths = [splitInput, ...toTransform.map(entry => ({
          pressureDiff: -entry.pressureDiff,
          friction: entry.friction,
        }))];
        const num = allPaths.reduce((acc, p) => p.friction ? acc + p.pressureDiff / p.friction : acc, 0);
        const denum = allPaths.reduce((acc, p) => p.friction ? acc + 1 / p.friction : acc, 0);
        const nodePressure = num / denum;

        let equivalentSplitFrictions = toTransform.map(v => v.friction);
        let totalPressureDiff = input.pressureDiff;

        if (input.pressureDiff !== 0 || allPaths.some(v => v.pressureDiff !== 0)) {
          // convert pressure difference + friction on each split to only an equivalent (possibly negative) friction
          equivalentSplitFrictions = toTransform.map((entry): number =>
            nodePressure * entry.friction / (nodePressure + entry.pressureDiff));
        }
        else {
          totalPressureDiff = nodePressure;
        }
        const eqInv = equivalentSplitFrictions.map(v => 1 / v);
        const eqFriction = 1 / eqInv.reduce((acc, entry) => acc + entry, 0);
        return {
          total: { pressureDiff: totalPressureDiff, friction: input.friction + eqFriction },
          split: eqInv.map(v => v * eqFriction),
        };
      };

    let series = input;

    if (this.next) {
      // add next before processing split (can be moved to front because all parts are in series)
      series.friction += this.next.inRoute.friction ?? DEFAULT_FRICTION;
      series.pressureDiff += this.next.inRoute.pressure ?? 0;
      series = this.next.friction(series);
    }


    if (this.splits.length > 1) {
      // splitting. Convert the combined paths into an equivalent series friction
      const splitPF = this.splits.map(split => split.friction({
        pressureDiff: split.inRoute.pressure ?? 0,
        friction: split.inRoute.friction ?? DEFAULT_FRICTION,
      }));

      const splitFriction = equivalentFriction(splitPF, series);
      series = splitFriction.total;
      this.splitDivide = splitFriction.split;
    }

    return series;
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

  public trimAtRoute(route: FlowRoute): FlowSegment | null {
    if (this.next) {
      if (this.next.inRoute.outCoords === route.outCoords) {
        const end = this.next;
        this.next = null;
        return end;
      }
      return this.next.trimAtRoute(route);
    }
    for (const [i, v] of this.splits.entries()) {
      if (v.inRoute === route) {
        const end = this.splits.splice(i, 1)[0];
        return end;
      }
      const end = v.trimAtRoute(route);
      if (end !== null) {
        return end;
      }
    }
    return null;
  }

  public lastRoutes(): FlowRoute[] {
    const routes: FlowRoute[] = [];
    if (this.next) {
      const last = this.next.lastRoutes();
      if (last.length === 0) {
        return [this.next.inRoute];
      }
      return last;
    }
    this.splits.forEach(split => {
      const r = split.lastRoutes();
      if (r.length === 0) {
        routes.push(split.inRoute);
      }
      else {
        r.forEach(v => { routes.push(v); });
      }
    });
    return routes;
  };
}

const mergeEnds = (splits: FlowSegment[]): { splits: FlowSegment[]; end: FlowSegment | null } => {
  if (splits.length < 2) {
    return { splits, end: null };
  }
  // walk over first path to find overlap with second
  let walker: FlowSegment = splits[0];
  let end: FlowSegment | null = null;
  const sharedEndIdx: number[] = [0];
  while (true) {
    splits.forEach((other, idx) => {
      if (idx != 0) {
        end = other.trimAtRoute(walker.inRoute);
        if (end) {
          sharedEndIdx.push(idx);
        }
      }
    });
    if (end) {
      // all splits have this particular end removed if they have it
      splits[0].trimAtRoute(walker.inRoute); // also remove from first
      // combine splits with shared end in a new path
      const unTouchedSplits: FlowSegment[] = [];
      const combinedSplits: FlowSegment[] = [];
      for (const [idx, split] of splits.entries()) {
        if (sharedEndIdx.indexOf(idx) !== -1) {
          combinedSplits.push(split);
        }
        else {
          unTouchedSplits.push(split);
        }
      }
      if (unTouchedSplits.length !== 0) {
        Notify.create({
          icon: 'warning',
          color: 'warning',
          message: 'The flows split and rejoin in too many places. Some flows might be incorrect.',
        });
      }
      return { splits: combinedSplits, end: end };
    }
    if (walker.next) {
      walker = walker.next;
    }
    else {
      return { splits, end: null };
    }
  }
};

export const mergeOverlappingSplits = (path: FlowSegment): FlowSegment => {
  const sortedBySink: { [coords: string]: { splits: FlowSegment[]; end: FlowSegment | null } } = {};
  for (const split of path.splits) {
    if (split.sinksTo.size) {
      const sortName = JSON.stringify(split.sinksTo);
      if (sortedBySink[sortName] !== undefined) {
        sortedBySink[sortName].splits.push(split);
      }
      else {
        sortedBySink[sortName] = { splits: [split], end: null };
      }
    }
  };


  for (const sink in sortedBySink) {
    while (sortedBySink[sink].splits.length > 1) {
      // found an overlapping path
      // merge until number of splits stays the same
      const oldLength = sortedBySink[sink].splits.length;
      sortedBySink[sink] = mergeEnds(sortedBySink[sink].splits);
      const newLength = sortedBySink[sink].splits.length;
      if (newLength === oldLength) {
        break;
      }
    }
  }

  const mergedSplits = Object.values(sortedBySink);
  if (mergedSplits.length === 1) {
    path.splits = mergedSplits[0].splits;
    path.next = mergedSplits[0].end;
    return path;
  }
  path.splits = mergedSplits[0].splits;
  path.next = mergedSplits[0].end;
  return path;
};
