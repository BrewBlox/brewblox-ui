import { describe, expect, it } from 'vitest';
import blueprints from '@/plugins/builder/blueprints';
import {
  asFlowParts,
  calculateFlows,
  calculateNormalizedFlows,
} from '@/plugins/builder/calculateFlows';
import {
  COLD_WATER,
  COLOR_KEY,
  HOT_WATER,
  IO_ENABLED_KEY,
  IO_PRESSURE_KEY,
  LEFT,
  RIGHT,
} from '@/plugins/builder/const';
import { BuilderPart, PartTransitions } from '@/plugins/builder/types';

/**
 * Flow calculation for layout topologies that go beyond a single series path.
 * Expected values are derived by hand from series/parallel friction,
 * or from conservation of flow.
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

  it('has no warnings', () => {
    const { warnings } = calculateNormalizedFlows(
      parts,
      makeAllTransitions(parts),
    );
    expect(warnings).toEqual([]);
  });

  it('conserves flow between source and sinks', () => {
    const flows = totalFlows(parts);
    const out = Math.abs(flows['src']['2,2.5,0']);
    const inX = Math.abs(flows['sinkX']['5,2.5,0']);
    const inY = Math.abs(flows['sinkY']['3.5,3,0']);
    expect(inX + inY).toBeCloseTo(out, 6);
  });

  it('conserves flow at the rejoining tee', () => {
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

  it('conserves flow between source and sinks', () => {
    const flows = totalFlows(parts);
    const out = Math.abs(flows['src']['2,2.5,0']);
    const inUp = Math.abs(flows['sinkUp']['6.5,2,0']);
    const inDown = Math.abs(flows['sinkDown']['6.5,3,0']);
    expect(inUp + inDown).toBeCloseTo(out, 6);
  });

  it('has the series/parallel friction of the entire path', () => {
    // source 1 + tube 1 + tee out 0.5
    // + parallel(0.5 + 1 + 1 + 0.5, 0.5 + 1 + 1 + 0.5) = 1.5
    // + tee out 0.5 + tube 1 + tee in 0.5
    // + parallel(0.5 + 1, 0.5 + 1) = 0.75
    const flows = totalFlows(parts);
    expect(flows['src']['2,2.5,0']).toBeCloseTo(12 / 6.75, 6);
    expect(flows['sinkUp']['6.5,2,0']).toBeCloseTo(-12 / 6.75 / 2, 6);
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

  it('has zero flow everywhere', () => {
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

  it('has finite flows when pressures are equal', () => {
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

  it('does not route flow through the loop', () => {
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

  it('has less flow with the pump enabled', () => {
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

  it('counts the pump pressure once', () => {
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
  const manifold = (size: number): BuilderPart[] => [
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

  it('conserves flow between source and sink', () => {
    const parts = manifold(4);
    const { flows } = calculateNormalizedFlows(
      parts,
      makeAllTransitions(parts),
    );
    const out = Object.values(flows['src'][RIGHT]).reduce((a, b) => a + b, 0);
    const inn = Object.values(flows['sink'][LEFT]).reduce((a, b) => a + b, 0);
    expect(Math.abs(inn)).toBeCloseTo(Math.abs(out), 6);
  });

  it('is calculated quickly for a large grid', () => {
    const parts = manifold(10);
    const start = performance.now();
    const { flows } = calculateNormalizedFlows(
      parts,
      makeAllTransitions(parts),
    );
    expect(performance.now() - start).toBeLessThan(1000);
    const out = Object.values(flows['src'][RIGHT]).reduce((a, b) => a + b, 0);
    const inn = Object.values(flows['sink'][LEFT]).reduce((a, b) => a + b, 0);
    expect(Math.abs(inn)).toBeCloseTo(Math.abs(out), 6);
    expect(out).toBeGreaterThan(0);
  });
});

describe('A check valve', () => {
  // src(12) -> check valve -> sink, with the valve in either direction
  const parts = (rotate: number): BuilderPart[] => [
    makeSource('src', 1, 1, 0, 12),
    makePart('valve', 'CheckValve', 2, 1, rotate),
    makeSink('sink', 3, 1, 180),
  ];

  it('passes flow in its own direction', () => {
    const flows = totalFlows(parts(0));
    expect(flows['valve']['3,1.5,0']).toBeCloseTo(12 / 3, 6);
  });

  it('blocks flow in the opposite direction', () => {
    const flows = totalFlows(parts(180));
    expect(flows['valve']?.['3,1.5,0'] ?? 0).toBe(0);
    expect(flows['src']?.['2,1.5,0'] ?? 0).toBe(0);
  });

  it('blocks a bypass around a pump that pumps in the other direction', () => {
    // src(0) -> tee1 -> pump(10) -> tee2 -> sink
    //           tee1 <- check valve <- tee2
    const parts: BuilderPart[] = [
      makeSource('src', 1, 2, 0, 0),
      makePart('tee1', 'TeeTube', 2, 2),
      makePump('pump', 3, 2, 180, 10),
      makePart('tee2', 'TeeTube', 4, 2),
      makeSink('sink', 5, 2, 180),
      makePart('elbow1', 'ElbowTube', 2, 1, 90),
      makePart('valve', 'CheckValve', 3, 1),
      makePart('elbow2', 'ElbowTube', 4, 1, 180),
    ];
    const flows = totalFlows(parts);
    // The check valve would carry flow from tee2 back to tee1
    expect(flows['valve']?.['4,1.5,0'] ?? 0).toBe(0);
    // source 1 + tee 0.5 + 0.5 + pump 1 + tee 0.5 + 0.5 + sink 1
    expect(flows['pump']['4,2.5,0']).toBeCloseTo(10 / 5, 6);
    expect(flows['sink']['5,2.5,0']).toBeCloseTo(-10 / 5, 6);
  });

  it('passes a bypass around a pump that pumps in its direction', () => {
    const parts: BuilderPart[] = [
      makeSource('src', 1, 2, 0, 0),
      makePart('tee1', 'TeeTube', 2, 2),
      makePump('pump', 3, 2, 180, 10),
      makePart('tee2', 'TeeTube', 4, 2),
      makeSink('sink', 5, 2, 180),
      makePart('elbow1', 'ElbowTube', 2, 1, 90),
      makePart('valve', 'CheckValve', 3, 1, 180),
      makePart('elbow2', 'ElbowTube', 4, 1, 180),
    ];
    const flows = totalFlows(parts);
    // The pump pushes liquid around: through the check valve (4),
    // or through the sink and the source (3)
    const pumpFlow = 10 / (2 + (4 * 3) / (4 + 3));
    expect(flows['pump']['4,2.5,0']).toBeCloseTo(pumpFlow, 6);
    expect(flows['valve']['3,1.5,0']).toBeCloseTo((pumpFlow * 3) / 7, 6);
    expect(flows['sink']['5,2.5,0']).toBeCloseTo((-pumpFlow * 4) / 7, 6);
  });
});

describe('Liquids without flow', () => {
  // src(0, cold) -> tube -> tee -> tube -> sink (hot, 0)
  //                             -> tube (dead end)
  const parts: BuilderPart[] = [
    makeSource('src', 1, 2, 0, 0),
    makePart('tube1', 'StraightTube', 2, 2),
    makePart('tee', 'TeeTube', 3, 2, 270),
    makePart('tube2', 'StraightTube', 3, 1, 90),
    makePart('tube3', 'StraightTube', 3, 3, 90),
    makePart('sink', 'SystemIO', 3, 0, 90, {
      [IO_ENABLED_KEY]: true,
      [IO_PRESSURE_KEY]: 0,
      [COLOR_KEY]: HOT_WATER,
    }),
  ];

  it('are shown in all connected parts', () => {
    const result = calculateFlows(
      asFlowParts(parts, makeAllTransitions(parts)),
    );
    const byId = Object.fromEntries(result.map((v) => [v.id, v.flows]));
    expect(byId['tube1']['3,2.5,0']).toEqual({
      [COLD_WATER]: 0,
      [HOT_WATER]: 0,
    });
    expect(byId['tube3']['3.5,4,0']).toEqual({
      [COLD_WATER]: 0,
      [HOT_WATER]: 0,
    });
  });

  it('do not pass a closed valve', () => {
    const closed = [
      ...parts.filter((v) => v.id !== 'tube2'),
      makePart('valve', 'Valve', 3, 1, 90, { closed: true }),
    ];
    const result = calculateFlows(
      asFlowParts(closed, makeAllTransitions(closed)),
    );
    const byId = Object.fromEntries(result.map((v) => [v.id, v.flows]));
    expect(byId['tube1']['3,2.5,0']).toEqual({ [COLD_WATER]: 0 });
    expect(byId['valve']).toEqual({});
  });
});

describe('A closed loop without source or sink', () => {
  // A ring of tubes with a pump, not connected to anything else
  const parts: BuilderPart[] = [
    makePart('elbow1', 'ElbowTube', 1, 1, 90),
    makePump('pump', 2, 1, 0, 10),
    makePart('elbow2', 'ElbowTube', 3, 1, 180),
    makePart('tube1', 'StraightTube', 3, 2, 90),
    makePart('elbow3', 'ElbowTube', 3, 3, 270),
    makePart('tube2', 'StraightTube', 2, 3),
    makePart('elbow4', 'ElbowTube', 1, 3, 0),
    makePart('tube3', 'StraightTube', 1, 2, 90),
  ];

  it('has no flow', () => {
    const flows = totalFlows(parts);
    expect(allValues(flows)).toEqual([]);
  });
});

describe('Mixing liquids', () => {
  // cold(12) -> tee <- hot(12)
  //             tee -> tube -> sink
  const parts = (hotPressure: number): BuilderPart[] => [
    makeSource('cold', 1, 1, 0, 12),
    makePart('hot', 'SystemIO', 3, 1, 180, {
      [IO_ENABLED_KEY]: true,
      [IO_PRESSURE_KEY]: hotPressure,
      [COLOR_KEY]: HOT_WATER,
    }),
    makePart('tee', 'TeeTube', 2, 1, 180),
    makePart('tube', 'StraightTube', 2, 2, 90),
    makeSink('sink', 2, 3, 270),
  ];

  it('splits flow between liquids in proportion to their inflow', () => {
    const result = calculateFlows(
      asFlowParts(parts(12), makeAllTransitions(parts(12))),
    );
    const tube = result.find((v) => v.id === 'tube')!;
    // tee node pressure V: 2 * (12 - V) / 1.5 = V / 2.5 -> V = 60 / 6.5
    const each = (12 - 60 / 6.5) / 1.5;
    expect(tube.flows['2.5,3,0']).toEqual({
      [COLD_WATER]: expect.closeTo(each, 6),
      [HOT_WATER]: expect.closeTo(each, 6),
    });
  });

  it('pushes back into a weaker source', () => {
    const result = calculateFlows(
      asFlowParts(parts(0), makeAllTransitions(parts(0))),
    );
    const hot = result.find((v) => v.id === 'hot')!;
    // The weaker source receives cold water
    expect(Object.keys(hot.flows['3,1.5,0'])).toEqual([COLD_WATER]);
    expect(hot.flows['3,1.5,0'][COLD_WATER]).toBeLessThan(0);
  });
});
