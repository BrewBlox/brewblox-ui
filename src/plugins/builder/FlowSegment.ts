import { entryReducer } from '@/helpers/functional';

import { DEFAULT_FRICTION } from './getters';
import { FlowPart, FlowRoute, PathFriction, Transitions } from './types';


export interface PathLink {
  path: FlowSegment;
  route: FlowRoute;
}

export class FlowSegment {
  public constructor(part: FlowPart) {
    this.root = part;
  }

  public root: FlowPart;
  public splits: PathLink[] = [];

  public splitDivide: number[] = [];
  public next: PathLink | null = null;

  public addChild(link: PathLink): void {
    if (this.splits.length == 0) {
      if (this.next !== null) {
        this.splits.push(this.next); // move next to splits
        this.splits.push(link); // add other segment to splits
        this.next = null; // set next to null for no shared next
      }
      else {
        this.next = link;
      }
    }
    else {
      this.splits.push(link);
    }
  }

  public friction(input: PathFriction): PathFriction {
    const equivalentFriction =
      (toTransform: PathFriction[], splitInput: PathFriction): { total: number; split: number[] } => {
        // Apply Millman’s Theorem Equation to calculate node pressure on the split
        const allPaths = [splitInput, ...toTransform.map(entry => ({
          pressureDiff: -entry.pressureDiff,
          friction: entry.friction,
        }))];
        const num = allPaths.reduce((acc, p) => p.friction ? acc + p.pressureDiff / p.friction : acc, 0);
        const denum = allPaths.reduce((acc, p) => p.friction ? acc + 1 / p.friction : acc, 0);
        const nodePressure = num / denum;

        // convert pressure difference + friction on each split to only an equivalent (possibly negative) friction
        const equivalentSplitFrictions = toTransform.map((entry): number =>
          nodePressure * entry.friction / (nodePressure + entry.pressureDiff));
        const eqInv = equivalentSplitFrictions.map(v => 1 / v);
        const eqFriction = 1 / eqInv.reduce((acc, entry) => acc + entry, 0);
        return { total: eqFriction, split: eqInv.map(v => v * eqFriction) };
      };

    let series = input;

    if (this.next) {
      // add next before processing split (can be moved to front because all parts are in series)
      series.friction += this.next.route.friction || DEFAULT_FRICTION;
      series.pressureDiff += this.next.route.pressure || 0;
      series = this.next.path.friction(series);
    }
    if (this.splits.length > 1) {
      // splitting path. Convert the combined paths into an equivalent series friction
      const splitPF = this.splits.map(split => split.path.friction({
        pressureDiff: split.route.pressure || 0,
        friction: split.route.friction || DEFAULT_FRICTION,
      }));
      const splitFriction = equivalentFriction(splitPF, series);
      series.friction = series.friction + splitFriction.total;
      this.splitDivide = splitFriction.split;
    }

    return series;
  }

  public reduceSegments(func: (acc: any, segment: FlowSegment) => any, acc: any): any {
    acc = func(acc, this);
    this.splits.forEach((child) => {
      acc = child.path.reduceSegments(func, acc);
    });
    if (this.next !== null) {
      acc = func(acc, this.next.path);
    }
  };

  public isSameSegment(other: FlowSegment): boolean {
    return JSON.stringify(this) === JSON.stringify(other);
  }

  public removeInternalFlows(): void {
    if (this.splits.length !== 0) {
      return;
    }

    if (this.next) {
      this.next.path.removeInternalFlows();
      if (this.next && this.next.path.root.id === this.root.id) {
        this.splits = this.next.path.splits;
        this.next = this.next.path.next;
      }
    }
  }

  public trimAtRoute(route: FlowRoute): PathLink | null {
    if (this.next) {
      if (this.next.route.outCoords === route.outCoords) {
        const end = this.next;
        this.next = null;
        return end;
      }
      return this.next.path.trimAtRoute(route);
    }
    for (const [i, v] of this.splits.entries()) {
      if (v.route === route) {
        const end = this.splits.splice(i, 1)[0];
        return end;
      }
      const end = v.path.trimAtRoute(route);
      if (end !== null) {
        return end;
      }
    }
    return null;
  }

  public lastRoutes(): FlowRoute[] {
    const routes: FlowRoute[] = [];
    if (this.next) {
      const last = this.next.path.lastRoutes();
      if (last.length === 0) {
        return [this.next.route];
      }
      return last;
    }
    this.splits.forEach(split => {
      const r = split.path.lastRoutes();
      if (r.length === 0) {
        routes.push(split.route);
      }
      else {
        r.forEach(v => { routes.push(v); });
      }
    });
    return routes;
  };

  public endsInSink(): boolean {
    if (this.next) {
      if (this.next.route.sink) {
        return true;
      }
      return this.next.path.endsInSink();
    }
    return false;
  }

  public joinDuplicateSplits(): void {
    if (this.next !== null) {
      this.next.path.joinDuplicateSplits();
    }
    if (this.splits.length !== 0) {
      while (true) {
        // get last route in each branch of splits their children
        const endRoutes = this.splits.reduce((acc: FlowRoute[], item) => {
          item.path.lastRoutes().forEach(v => { acc.push(v); });
          return acc;
        }, []);
        // check if a route has been visited twice
        const duplicateRoutes = endRoutes.filter(
          (item, idx) => endRoutes.findIndex(other => other.outCoords == item.outCoords) !== idx);
        // cut off for duplicated coordinates
        const trimmed: PathLink[] = [];
        if (duplicateRoutes.length !== 0) {
          duplicateRoutes.forEach(route => this.splits.forEach(split => {
            const end = split.path.trimAtRoute(route);
            if (end !== null) {
              trimmed.push(end);
            }
          }));
        }
        else {
          break;
        }
      }

      let duplicated: PathLink | null = null;
      this.splits.forEach((link, idx1) => {
        // find if any of the segments on a different split have the same next part
        let walker = link;
        while (walker.path.next !== null) {
          this.splits.forEach((link2, idx2) => {
            if (idx1 > idx2) {

              const end = link2.path.trimAtRoute(walker.route);
              if (end !== null) {

                duplicated = end;
              }
            }
          });
          walker = walker.path.next;
        }
        this.next = duplicated;
      });
    }
  }

  public leafLinks(): PathLink[] {
    if (this.splits.length !== 0) {
      return this.splits.reduce((acc, child) => [...acc, ...child.path.leafLinks()], new Array<PathLink>());
    }
    if (this.next !== null) {
      const nextLeaves = this.next.path.leafLinks();
      if (nextLeaves.length === 0) {
        return [this.next]; // if my next has no leaves, it is the leaf itself
      }
    }
    return [];
  }

  public removeLeafLink(segment: FlowSegment): void {
    this.splits.forEach((child) => child.path.removeLeafLink(segment));
    if (this.next !== null) {
      if (this.next.path.isSameSegment(segment)) {
        this.next = null;
        return;
      }
      else {
        this.next.path.removeLeafLink(segment);
      }
    }
  }

  public popDuplicatedLeaf(): PathLink | null {
    const leaves = this.leafLinks();
    if (leaves.length !== 0 && leaves.every(v => v.path.isSameSegment(leaves[0].path))) {
      this.removeLeafLink(leaves[0].path);
      return leaves[0];
    }
    return null;
  }
}
