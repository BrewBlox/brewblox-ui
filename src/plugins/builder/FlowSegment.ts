import { entryReducer } from '@/helpers/functional';

import { DEFAULT_FRICTION } from './getters';
import { FlowPart, PathFriction, Transitions } from './types';

export class FlowSegment {
  public constructor(part: FlowPart, transitions: Transitions) {
    this.root = part;
    this.transitions = transitions;
  }

  public transitions: Transitions;
  public root: FlowPart;
  public splits: FlowSegment[] = [];
  public next: FlowSegment | null = null;
  public flowing = true;

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

  public friction(input: PathFriction): PathFriction {
    const equivalentFriction = (toTransform: PathFriction[], splitInput: PathFriction): number => {
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
      const eqFriction = 1 / equivalentSplitFrictions.reduce((acc, entry) => acc + 1 / entry, 0);
      return eqFriction;
    };

    const series: PathFriction = this.next ? this.next.friction(input) : input;
    if (Object(this.transitions).values > 1) {
      // split
      if (this.splits.length > 0) {
        const splitPF = this.splits.map(split => split.friction(series));
        const splitFriction = equivalentFriction(splitPF, { pressureDiff: 10, friction: 10 });
        series.friction = series.friction + splitFriction;
      }
      else {
        throw ('Found multiple transitions but no split path');
      }
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

  public isSameSegment(other: FlowSegment): boolean {
    return JSON.stringify(this) === JSON.stringify(other);
  }

  public removeInternalFlows(): void {
    if (this.splits.length !== 0) {
      return;
    }

    if (this.next) {
      this.next.removeInternalFlows();
      if (this.next && this.next.root.id === this.root.id) {
        const nextTransitions = { ...this.next.transitions };
        Object.entries(this.transitions).forEach(([k, v]) => {
          v.forEach(outFlow => {
            if (nextTransitions[outFlow.outCoords]) {
              this.transitions[k] = nextTransitions[outFlow.outCoords];
            }
          });
        });
        this.splits = this.next.splits;
        this.next = this.next.next;
      }
    }
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
      const combinedTransitions = leaves
        .reduce((acc: Transitions, leaf) => ({ ...acc, ...leaf.transitions }), {});
      leaves[0].transitions = combinedTransitions;
      this.removeLeafSegment(leaves[0]);
      return leaves[0];
    }
    return null;
  }
}
