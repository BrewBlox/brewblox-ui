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
  VALVE_POSITION_KEY,
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
    // Each side of the closed valve holds the liquid of its own tube
    expect(byId['valve']).toEqual({
      '3.5,2,0': { [COLD_WATER]: 0 },
      '3.5,1,0': { [HOT_WATER]: 0 },
    });
  });

  it('are shown on the blocked port of a three-way valve', () => {
    // src(0, cold) -> tube -> three-way valve (left port blocked)
    const blocked = [
      makeSource('src', 1, 2, 0, 0),
      makePart('tube1', 'StraightTube', 2, 2),
      makePart('valve', 'ThreeWayValve', 3, 2, 0, { [VALVE_POSITION_KEY]: 3 }),
    ];
    const result = calculateFlows(
      asFlowParts(blocked, makeAllTransitions(blocked)),
    );
    const byId = Object.fromEntries(result.map((v) => [v.id, v.flows]));
    expect(byId['valve']).toEqual({ '3,2.5,0': { [COLD_WATER]: 0 } });
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

describe('Two check valves in a pumped ring', () => {
  // The all-open solution reverses both valves.
  // Closing one of them leaves a forward pressure on the other.
  //
  //   x -> D1 -> y
  //   |          |
  // link       pump (pushes y-wards)
  //   |          |
  //   q <- D2 <- p <- src
  //   |
  //  sink
  const parts: BuilderPart[] = [
    makePart('x', 'ElbowTube', 1, 0, 90),
    makePart('D1', 'CheckValve', 2, 0),
    makePart('y', 'ElbowTube', 3, 0, 180),
    makePart('link', 'StraightTube', 1, 1, 90),
    makePump('pump', 3, 1, 90, 30),
    makePart('q', 'TeeTube', 1, 2),
    makePart('D2', 'CheckValve', 2, 2, 180),
    makePart('p', 'TeeTube', 3, 2),
    makeSource('src', 4, 2, 180, 12),
    makeSink('sink', 0, 2, 0),
  ];

  it('keeps the valve with forward pressure open', () => {
    const flows = totalFlows(parts);
    // src -> p -> D2 -> q -> sink: 1 + 0.5 + 0.5 + 1 + 0.5 + 0.5 + 1
    expect(flows['D2']['2,2.5,0']).toBeCloseTo(12 / 5, 6);
    expect(flows['sink']['1,2.5,0']).toBeCloseTo(-12 / 5, 6);
    expect(flows['D1']?.['3,0.5,0'] ?? 0).toBe(0);
    expect(
      calculateNormalizedFlows(parts, makeAllTransitions(parts)).warnings,
    ).toEqual([]);
  });
});

describe('A pumped loop attached to a dead end', () => {
  // src -> tee -> loop with a pump, back into the tee
  const parts = (pumpPressure: number): BuilderPart[] => [
    makeSource('src', 1, 2, 0),
    makePart('tee', 'TeeTube', 2, 2, 270),
    makePart('loop1', 'ElbowTube', 2, 1, 90),
    makePump('pump', 3, 1, 180, pumpPressure),
    makePart('loop2', 'ElbowTube', 4, 1, 180),
    makePart('loop3', 'StraightTube', 4, 2, 90),
    makePart('loop4', 'ElbowTube', 4, 3, 270),
    makePart('loop5', 'StraightTube', 3, 3),
    makePart('loop6', 'ElbowTube', 2, 3, 0),
  ];

  it('circulates the liquid of the source', () => {
    const result = calculateFlows(
      asFlowParts(parts(10), makeAllTransitions(parts(10))),
    );
    const pump = result.find((v) => v.id === 'pump')!;
    // 0.5 + 0.5 + 1 + 1 + 1 + 1 + 1 + 1 + 1
    expect(pump.flows['4,1.5,0']).toEqual({
      [COLD_WATER]: expect.closeTo(10 / 8, 6),
    });
    const src = result.find((v) => v.id === 'src')!;
    expect(src.flows['2,2.5,0']).toEqual({ [COLD_WATER]: 0 });
  });

  it('holds the liquid of the source without flow', () => {
    const result = calculateFlows(
      asFlowParts(parts(0), makeAllTransitions(parts(0))),
    );
    const pump = result.find((v) => v.id === 'pump')!;
    expect(pump.flows['4,1.5,0']).toEqual({ [COLD_WATER]: 0 });
  });
});

describe('A strongly recirculating loop', () => {
  // src(0) -> 20 tubes -> tee -> pump(100) -> tee -> 20 tubes -> sink
  //                           -> tubes    ->
  const tubes = (from: number, count: number): BuilderPart[] =>
    Array.from({ length: count }, (_, i) =>
      makePart(`t${from + i}`, 'StraightTube', from + i, 2),
    );
  const parts: BuilderPart[] = [
    makeSource('src', 0, 2, 0, 0),
    ...tubes(1, 20),
    makePart('tee1', 'TeeTube', 21, 2, 270),
    makePart('a1', 'ElbowTube', 21, 1, 90),
    makePump('pump', 22, 1, 180, 100),
    makePart('a2', 'ElbowTube', 23, 1, 180),
    makePart('b1', 'ElbowTube', 21, 3, 0),
    makePart('b2', 'StraightTube', 22, 3),
    makePart('b3', 'ElbowTube', 23, 3, 270),
    makePart('tee2', 'TeeTube', 23, 2, 90),
    ...tubes(24, 20),
    makeSink('sink', 44, 2, 180),
  ];

  it('reports the full flow for the liquid', () => {
    const flows = totalFlows(parts);
    // Thevenin: pump 100 over 4 in parallel with 4 -> 50 over 2;
    // external path 21.5 + 21.5
    const through = 50 / 45;
    const pumpFlow = (100 - (50 - through * 2)) / 4;
    expect(flows['sink']['44,2.5,0']).toBeCloseTo(-through, 6);
    expect(flows['pump']['23,1.5,0']).toBeCloseTo(pumpFlow, 6);
    expect(flows['b2']['23,3.5,0']).toBeCloseTo(through - pumpFlow, 6);
  });
});

describe('An inlet without a color', () => {
  it('does not push liquid', () => {
    const colorless = makePart('src', 'SystemIO', 1, 1, 0, {
      [IO_ENABLED_KEY]: true,
      [IO_PRESSURE_KEY]: 10,
    });
    const route = makeAllTransitions([colorless])['src']['0.5,0.5,0'][0];
    expect(route.pressure).toBe(0);
    expect(route.liquids).toEqual([]);
  });
});

describe('Static liquid and one-way parts', () => {
  it('does not spread backwards through an open check valve', () => {
    // src -> tube -> tee -> tube -> sink
    //                tee <- check valve <- dead end
    const parts: BuilderPart[] = [
      makeSource('src', 1, 2, 0, 0),
      makePart('tube1', 'StraightTube', 2, 2),
      makePart('tee', 'TeeTube', 3, 2, 180),
      makePart('tube2', 'StraightTube', 4, 2),
      makeSink('sink', 5, 2, 180),
      makePart('valve', 'CheckValve', 3, 3, 270),
      makePart('dead', 'StraightTube', 3, 4, 90),
    ];
    const result = calculateFlows(
      asFlowParts(parts, makeAllTransitions(parts)),
    );
    const byId = Object.fromEntries(result.map((v) => [v.id, v.flows]));
    expect(byId['tube1']['3,2.5,0']).toEqual({ [COLD_WATER]: 0 });
    expect(byId['valve']).toEqual({ '3.5,3,0': { [COLD_WATER]: 0 } });
    expect(byId['dead']).toEqual({});
  });

  it('shows liquid on the inlet side of a closed check valve', () => {
    const parts: BuilderPart[] = [
      makeSource('src', 1, 1, 0, 10),
      makePart('tube1', 'StraightTube', 2, 1),
      makePart('valve', 'CheckValve', 3, 1, 180),
      makePart('tube2', 'StraightTube', 4, 1),
      makeSink('sink', 5, 1, 180),
    ];
    const result = calculateFlows(
      asFlowParts(parts, makeAllTransitions(parts)),
    );
    const byId = Object.fromEntries(result.map((v) => [v.id, v.flows]));
    expect(byId['tube1']['3,1.5,0']).toEqual({ [COLD_WATER]: 0 });
    expect(byId['valve']).toEqual({ '3,1.5,0': { [COLD_WATER]: 0 } });
    expect(byId['tube2']).toEqual({});
  });
});

describe('Routes without friction', () => {
  it('are only merged for container cells', () => {
    const parts: BuilderPart[] = [
      makeSource('src', 1, 1, 0, 10),
      makePart('slick', 'StraightTube', 2, 1),
      makePart('tube', 'StraightTube', 3, 1),
      makeSink('sink', 4, 1, 180),
    ];
    const transitions = {
      ...makeAllTransitions(parts),
      slick: {
        [LEFT]: [{ outCoords: RIGHT, friction: 0 }],
        [RIGHT]: [{ outCoords: LEFT, friction: 0 }],
      },
    };
    const result = calculateFlows(asFlowParts(parts, transitions));
    const byId = Object.fromEntries(result.map((v) => [v.id, v.flows]));
    const total = 10 / (1 + 0.01 + 1 + 1);
    expect(byId['slick']['3,1.5,0'][COLD_WATER]).toBeCloseTo(total, 6);
    expect(byId['tube']['4,1.5,0'][COLD_WATER]).toBeCloseTo(total, 6);
  });
});

describe('Rounding', () => {
  it('produces clean numbers', () => {
    const parts: BuilderPart[] = [
      makeSource('src', 1, 1, 0, 0.9),
      makePart('tube', 'StraightTube', 2, 1),
      makeSink('sink', 3, 1, 180),
    ];
    expect(totalFlows(parts)['tube']['3,1.5,0']).toBe(0.3);
  });
});
