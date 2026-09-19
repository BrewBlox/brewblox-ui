import { describe, expect, it } from 'vitest';
import blueprints from '@/plugins/builder/blueprints';
import {
  asFlowParts,
  calculateFlows,
  calculateNormalizedFlows,
  findPathsFromSources,
} from '@/plugins/builder/calculateFlows';
import {
  COLD_WATER,
  COLOR_KEY,
  IO_ENABLED_KEY,
  IO_PRESSURE_KEY,
  LEFT,
  RIGHT,
} from '@/plugins/builder/const';
import {
  FlowSegment,
  SPLIT_MERGE_WARNING,
} from '@/plugins/builder/FlowSegment';
import { BuilderPart, PartTransitions } from '@/plugins/builder/types';

/**
 * Flow calculation for layout topologies that go beyond a single series path.
 *
 * Tests marked with `it.fails` describe the physically correct outcome
 * for layouts where the path enumeration algorithm is known to be wrong.
 * They are expected to fail until the calculation is replaced,
 * and will start failing as "did not fail" when they are fixed.
 */

const makeAllTransitions = (parts: BuilderPart[]): Mapped<PartTransitions> =>
  parts.reduce((acc, part) => {
    const transitions = blueprints[part.type].transitions(part);
    if (transitions) {
      acc[part.id] = transitions;
    }
    return acc;
  }, {});

const makePart = (
  id: string,
  type: BuilderPart['type'],
  x: number,
  y: number,
  rotate = 0,
  settings: Mapped<any> = {},
): BuilderPart => ({ id, type, x, y, rotate, settings, width: 1, height: 1 });

const makeSource = (
  id: string,
  x: number,
  y: number,
  rotate: number,
  pressure = 12,
): BuilderPart =>
  makePart(id, 'SystemIO', x, y, rotate, {
    [IO_ENABLED_KEY]: true,
    [IO_PRESSURE_KEY]: pressure,
    [COLOR_KEY]: COLD_WATER,
  });

const makeSink = (
  id: string,
  x: number,
  y: number,
  rotate: number,
): BuilderPart => makePart(id, 'SystemIO', x, y, rotate);

const makePump = (
  id: string,
  x: number,
  y: number,
  rotate: number,
  pressure = 10,
): BuilderPart =>
  makePart(id, 'Pump', x, y, rotate, {
    [IO_ENABLED_KEY]: true,
    [IO_PRESSURE_KEY]: pressure,
  });

/**
 * Calculates flows, and sums liquids per coordinate.
 * Coordinates are absolute (not part-relative).
 */
const totalFlows = (parts: BuilderPart[]): Mapped<Mapped<number>> => {
  const result = calculateFlows(asFlowParts(parts, makeAllTransitions(parts)));
  return Object.fromEntries(
    result.map((part) => [
      part.id,
      Object.fromEntries(
        Object.entries(part.flows).map(([coord, liquids]) => [
          coord,
          Object.values(liquids).reduce((a, b) => a + b, 0),
        ]),
      ),
    ]),
  );
};

const allValues = (flows: Mapped<Mapped<number>>): number[] =>
  Object.values(flows).flatMap((v) => Object.values(v));

const countSegments = (segment: FlowSegment | null): number =>
  segment === null
    ? 0
    : 1 +
      countSegments(segment.next) +
      segment.splits.reduce((acc, split) => acc + countSegments(split), 0);

describe('A three-way split where two branches rejoin', () => {
  // src -> tube -> cross -> up: elbow, elbow -> tee -> sink X
  //                      -> right: tee -> sink X
  //                      -> down: sink Y
  const parts: BuilderPart[] = [
    makeSource('src', 1, 2, 0),
    makePart('tube', 'StraightTube', 2, 2),
    makePart('cross', 'CrossTube', 3, 2),
    makePart('up1', 'ElbowTube', 3, 1, 90),
    makePart('up2', 'ElbowTube', 4, 1, 180),
    makePart('tee', 'TeeTube', 4, 2, 0),
    makeSink('sinkX', 5, 2, 180),
    makeSink('sinkY', 3, 3, 270),
  ];

  it('collects a warning instead of raising it', () => {
    const { warnings } = calculateNormalizedFlows(
      parts,
      makeAllTransitions(parts),
    );
    expect(warnings).toEqual([SPLIT_MERGE_WARNING]);
  });

  it.fails('conserves flow between source and sinks', () => {
    const flows = totalFlows(parts);
    const out = Math.abs(flows['src']['2,2.5,0']);
    const inX = Math.abs(flows['sinkX']['5,2.5,0']);
    const inY = Math.abs(flows['sinkY']['3.5,3,0']);
    expect(inX + inY).toBeCloseTo(out, 6);
  });

  it.fails('conserves flow at the rejoining tee', () => {
    const flows = totalFlows(parts);
    const fromCross = Math.abs(flows['tee']['4,2.5,0']);
    const fromElbow = Math.abs(flows['tee']['4.5,2,0']);
    const toSink = Math.abs(flows['tee']['5,2.5,0']);
    expect(toSink).toBeCloseTo(fromCross + fromElbow, 6);
  });
});

describe('A fork that rejoins, followed by a second fork', () => {
  // src -> tube -> tee -> elbow, elbow -> tee -> tube -> tee -> sink
  //                    -> elbow, elbow ->                    -> sink
  const parts: BuilderPart[] = [
    makeSource('src', 1, 2, 0),
    makePart('tube1', 'StraightTube', 2, 2),
    makePart('tee1', 'TeeTube', 3, 2, 270),
    makePart('up1', 'ElbowTube', 3, 1, 90),
    makePart('down1', 'ElbowTube', 3, 3, 0),
    makePart('up2', 'ElbowTube', 4, 1, 180),
    makePart('down2', 'ElbowTube', 4, 3, 270),
    makePart('tee2', 'TeeTube', 4, 2, 90),
    makePart('tube2', 'StraightTube', 5, 2),
    makePart('tee3', 'TeeTube', 6, 2, 270),
    makeSink('sinkUp', 6, 1, 90),
    makeSink('sinkDown', 6, 3, 270),
  ];
  const flowParts = asFlowParts(parts, makeAllTransitions(parts));

  it('conserves flow between source and sinks', () => {
    const flows = totalFlows(parts);
    const out = Math.abs(flows['src']['2,2.5,0']);
    const inUp = Math.abs(flows['sinkUp']['6.5,2,0']);
    const inDown = Math.abs(flows['sinkDown']['6.5,3,0']);
    expect(inUp + inDown).toBeCloseTo(out, 6);
  });

  it.fails('has the series/parallel friction of the entire path', () => {
    // source 1 + tube 1 + tee in 0.5
    // + parallel(0.5 + 1 + 1, 0.5 + 1 + 1) = 1.25
    // + tee in 0.5 + tee out 0.5 + tube 1 + tee in 0.5
    // + parallel(0.5 + 1, 0.5 + 1) = 0.75
    const [path] = findPathsFromSources(flowParts, flowParts[0]);
    const { friction } = path.friction({ pressureDiff: 0, friction: 0 });
    expect(friction).toBeCloseTo(7, 6);
  });
});

describe('A source without pressure, with a split downstream', () => {
  const parts: BuilderPart[] = [
    makeSource('src', 1, 2, 0, 0),
    makePart('tube', 'StraightTube', 2, 2),
    makePart('tee', 'TeeTube', 3, 2, 270),
    makeSink('sinkUp', 3, 1, 90),
    makeSink('sinkDown', 3, 3, 270),
  ];

  it.fails('has zero flow everywhere', () => {
    const values = allValues(totalFlows(parts));
    expect(values.length).toBeGreaterThan(0);
    values.forEach((v) => expect(v).toBe(0));
  });
});

describe('A split where the source and pump pressures cancel out', () => {
  // src(30) -> tube -> tee -> pump(30) -> sink
  //                        -> tube -> sink
  const parts = (pumpPressure: number): BuilderPart[] => [
    makeSource('src', 1, 2, 0, 30),
    makePart('tube', 'StraightTube', 2, 2),
    makePart('tee', 'TeeTube', 3, 2, 180),
    makePump('pump', 4, 2, 180, pumpPressure),
    makeSink('sinkRight', 5, 2, 180),
    makePart('tubeDown', 'StraightTube', 3, 3, 90),
    makeSink('sinkDown', 3, 4, 270),
  ];

  it('has finite flows when pressures differ', () => {
    allValues(totalFlows(parts(31))).forEach((v) =>
      expect(Number.isFinite(v)).toBe(true),
    );
  });

  it.fails('has finite flows when pressures are equal', () => {
    allValues(totalFlows(parts(30))).forEach((v) =>
      expect(Number.isFinite(v)).toBe(true),
    );
  });
});

describe('A passive loop attached to a junction', () => {
  // src -> cross -> right: tube -> sink
  //              -> up: tubes around the loop, back into the cross from below
  const parts: BuilderPart[] = [
    makeSource('src', 1, 2, 0),
    makePart('cross', 'CrossTube', 2, 2),
    makePart('tube', 'StraightTube', 3, 2),
    makeSink('sink', 4, 2, 180),
    makePart('loop1', 'ElbowTube', 2, 1, 90),
    makePart('loop2', 'StraightTube', 3, 1),
    makePart('loop3', 'StraightTube', 4, 1),
    makePart('loop4', 'ElbowTube', 5, 1, 180),
    makePart('loop5', 'StraightTube', 5, 2, 90),
    makePart('loop6', 'ElbowTube', 5, 3, 270),
    makePart('loop7', 'StraightTube', 4, 3),
    makePart('loop8', 'StraightTube', 3, 3),
    makePart('loop9', 'ElbowTube', 2, 3, 0),
  ];
  const flowParts = asFlowParts(parts, makeAllTransitions(parts));

  it('finds a single path', () => {
    const paths = findPathsFromSources(flowParts, flowParts[0]);
    expect(paths).toHaveLength(1);
    expect(countSegments(paths[0])).toBeGreaterThan(0);
  });

  it.fails('does not route flow through the loop', () => {
    const flows = totalFlows(parts);
    // source 1 + cross 0.5 + 0.5 + tube 1 + sink 1
    expect(Math.abs(flows['tube']['3,2.5,0'])).toBeCloseTo(12 / 4, 6);
    expect(Math.abs(flows['loop2']?.['3,1.5,0'] ?? 0)).toBe(0);
  });
});

describe('A pump working against a pressurized inlet', () => {
  // src(12) -> pump(10, pumping towards src) -> sink
  const parts = (enabled: boolean): BuilderPart[] => [
    makeSource('src', 1, 1, 0, 12),
    makePart('pump', 'Pump', 2, 1, 0, {
      [IO_ENABLED_KEY]: enabled,
      [IO_PRESSURE_KEY]: 10,
    }),
    makeSink('sink', 3, 1, 180),
  ];

  it('has flow from the inlet with the pump disabled', () => {
    // source 1 + pump 1 + sink 1
    expect(totalFlows(parts(false))['pump']['3,1.5,0']).toBeCloseTo(4, 6);
  });

  it.fails('has less flow with the pump enabled', () => {
    expect(totalFlows(parts(true))['pump']['3,1.5,0']).toBeCloseTo(
      (12 - 10) / 3,
      6,
    );
  });
});

describe('Two sources feeding a single pump', () => {
  // src A -> tee <- src B
  //          tee -> pump(10) -> sink
  const parts: BuilderPart[] = [
    makeSource('srcA', 1, 1, 0, 0),
    makeSource('srcB', 3, 1, 180, 0),
    makePart('tee', 'TeeTube', 2, 1, 180),
    makePump('pump', 2, 2, 270, 10),
    makeSink('sink', 2, 3, 270),
  ];

  it.fails('counts the pump pressure once', () => {
    // parallel(source 1 + tee 0.5, source 1 + tee 0.5) = 0.75
    // + tee 0.5 + pump 1 + sink 1
    const flows = totalFlows(parts);
    expect(Math.abs(flows['pump']['2.5,3,0'])).toBeCloseTo(10 / 3.25, 6);
    expect(Math.abs(flows['srcA']['2,1.5,0'])).toBeCloseTo(
      Math.abs(flows['srcB']['3,1.5,0']),
      6,
    );
  });
});

describe('A manifold of cross tubes', () => {
  // The number of enumerated paths grows exponentially with the grid size.
  // A 4x4 grid takes ~150ms. A 5x5 grid takes ~20s.
  const size = 4;
  const parts: BuilderPart[] = [
    makeSource('src', 0, 1, 0, 20),
    ...Array.from({ length: size * size }, (_, n) =>
      makePart(
        `cross-${n % size}-${Math.floor(n / size)}`,
        'CrossTube',
        1 + (n % size),
        1 + Math.floor(n / size),
      ),
    ),
    makeSink('sink', 1 + size, size, 180),
  ];

  it.fails('conserves flow between source and sink', () => {
    const { flows } = calculateNormalizedFlows(
      parts,
      makeAllTransitions(parts),
    );
    const out = Object.values(flows['src'][RIGHT]).reduce((a, b) => a + b, 0);
    const inn = Object.values(flows['sink'][LEFT]).reduce((a, b) => a + b, 0);
    expect(Math.abs(inn)).toBeCloseTo(Math.abs(out), 6);
  });
});
