import set from 'lodash/set';
import { describe, expect, it } from 'vitest';
import blueprints from '@/plugins/builder/blueprints';
import { asFlowParts, calculateFlows } from '@/plugins/builder/calculateFlows';
import {
  CENTER,
  COLD_WATER,
  COLOR_KEY,
  HOT_WATER,
  IO_ENABLED_KEY,
  IO_PRESSURE_KEY,
} from '@/plugins/builder/const';
import { BuilderPart, PartTransitions } from '@/plugins/builder/types';

const makeTransitions = (part: BuilderPart): Maybe<PartTransitions> =>
  blueprints[part.type].transitions(part);

const makeAllTransitions = (parts: BuilderPart[]): Mapped<PartTransitions> =>
  parts.reduce((acc, part) => {
    const transitions = makeTransitions(part);
    if (transitions) {
      acc[part.id] = transitions;
    }
    return acc;
  }, {});

describe('Data describing an input tube', () => {
  const part: BuilderPart = {
    id: '',
    x: 1,
    y: 2,
    rotate: 0,
    type: 'SystemIO',
    settings: {
      [IO_PRESSURE_KEY]: 11,
      [IO_ENABLED_KEY]: true,
      [COLOR_KEY]: COLD_WATER,
    },
    width: 1,
    height: 1,
  };

  it('can resolve to transitions', () => {
    expect(makeTransitions(part)).toEqual({
      [CENTER]: [
        {
          outCoords: '1,0.5,0',
          pressure: 11,
          liquids: [COLD_WATER],
          source: true,
        },
      ],
      '1,0.5,0': [{ outCoords: CENTER, sink: true }],
    });
  });
});

describe('asFlowParts', () => {
  const path: BuilderPart[] = [
    {
      id: 'one',
      x: 1,
      y: 2,
      rotate: 0,
      type: 'SystemIO',
      settings: {
        [COLOR_KEY]: COLD_WATER,
      },
      width: 1,
      height: 1,
    },
    {
      id: 'two',
      x: 2,
      y: 2,
      rotate: 0,
      type: 'StraightTube',
      settings: {},
      width: 1,
      height: 1,
    },
    {
      id: 'three',
      x: 3,
      y: 2,
      rotate: 0,
      type: 'SystemIO',
      settings: {},
      width: 1,
      height: 1,
    },
  ];

  it('it adds transitions', () => {
    asFlowParts(path, makeAllTransitions(path)).forEach((part) => {
      expect(part).toHaveProperty('transitions');
    });
  });
});

describe('A single path without splits', () => {
  const parts: BuilderPart[] = [
    {
      id: '1',
      x: 1,
      y: 2,
      rotate: 0,
      type: 'SystemIO',
      settings: {
        [IO_PRESSURE_KEY]: 6,
        [IO_ENABLED_KEY]: true,
        [COLOR_KEY]: HOT_WATER,
      },
      width: 1,
      height: 1,
    },
    {
      id: '2',
      x: 3,
      y: 2,
      rotate: 180,
      type: 'SystemIO',
      settings: {},
      width: 1,
      height: 1,
    },
    {
      id: '3',
      x: 2,
      y: 2,
      rotate: 0,
      type: 'StraightTube',
      settings: {},
      width: 1,
      height: 1,
    },
  ];

  const flowParts = asFlowParts(parts, makeAllTransitions(parts));
  it('Should have a flow of value of 2 for all parts', () => {
    const partsWithFlow = calculateFlows(flowParts);
    expect(partsWithFlow).toMatchObject([
      {
        x: 1,
        y: 2,
        rotate: 0,
        type: 'SystemIO',
        flows: {
          '2,2.5,0': {
            [HOT_WATER]: 2,
          },
        },
        settings: {
          [IO_PRESSURE_KEY]: 6,
          [IO_ENABLED_KEY]: true,
          [COLOR_KEY]: HOT_WATER,
        },
      },
      {
        x: 3,
        y: 2,
        rotate: 180,
        type: 'SystemIO',
        flows: {
          '3,2.5,0': {
            [HOT_WATER]: -2,
          },
        },
      },
      {
        x: 2,
        y: 2,
        rotate: 0,
        type: 'StraightTube',
        flows: {
          '2,2.5,0': {
            [HOT_WATER]: -2,
          },
          '3,2.5,0': {
            [HOT_WATER]: 2,
          },
        },
      },
    ]);
  });
});

describe('A path with a split, but no joins', () => {
  const parts: BuilderPart[] = [
    {
      id: '1',
      x: 1,
      y: 2,
      rotate: 0,
      type: 'SystemIO',
      settings: {
        [IO_PRESSURE_KEY]: 13,
        [IO_ENABLED_KEY]: true,
        [COLOR_KEY]: COLD_WATER,
      },
      width: 1,
      height: 1,
    },
    {
      id: '2',
      x: 2,
      y: 2,
      rotate: 0,
      type: 'StraightTube',
      settings: {},
      width: 1,
      height: 1,
    },
    {
      id: '3',
      x: 3,
      y: 2,
      rotate: 270,
      type: 'TeeTube',
      settings: {},
      width: 1,
      height: 1,
    },
    {
      id: '4',
      x: 3,
      y: 1,
      rotate: 90,
      type: 'SystemIO',
      settings: {},
      width: 1,
      height: 1,
    },
    {
      id: '5',
      x: 3,
      y: 3,
      rotate: 270,
      type: 'SystemIO',
      settings: {},
      width: 1,
      height: 1,
    },
  ];

  const flowParts = asFlowParts(parts, makeAllTransitions(parts));
  it('Should have a flow of value of 4 total and 2 for each split', () => {
    const partsWithFlow = calculateFlows(flowParts);
    expect(partsWithFlow).toMatchObject([
      {
        flows: {
          '2,2.5,0': {
            [COLD_WATER]: 4,
          },
        },
        type: 'SystemIO',
      },
      {
        flows: {
          '2,2.5,0': {
            [COLD_WATER]: -4,
          },
          '3,2.5,0': {
            [COLD_WATER]: 4,
          },
        },
        type: 'StraightTube',
      },
      {
        flows: {
          '3,2.5,0': {
            [COLD_WATER]: -4,
          },
          '3.5,2,0': {
            [COLD_WATER]: 2,
          },
          '3.5,3,0': {
            [COLD_WATER]: 2,
          },
        },
        type: 'TeeTube',
      },
      {
        flows: {
          '3.5,2,0': {
            [COLD_WATER]: -2,
          },
        },
        type: 'SystemIO',
        x: 3,
        y: 1,
      },
      {
        flows: {
          '3.5,3,0': {
            [COLD_WATER]: -2,
          },
        },
        type: 'SystemIO',
      },
    ]);
  });
});

describe('A path that forks and rejoins', () => {
  const parts: BuilderPart[] = [
    {
      id: '1',
      x: 1,
      y: 2,
      rotate: 0,
      type: 'SystemIO',
      settings: {
        [IO_ENABLED_KEY]: true,
        [IO_PRESSURE_KEY]: 11,
        [COLOR_KEY]: COLD_WATER,
      },
      width: 1,
      height: 1,
    },
    {
      id: '2',
      x: 2,
      y: 2,
      rotate: 0,
      type: 'StraightTube',
      settings: {},
      width: 1,
      height: 1,
    },
    {
      id: '3',
      x: 3,
      y: 2,
      rotate: 270,
      type: 'TeeTube',
      settings: {},
      width: 1,
      height: 1,
    },
    {
      id: '4',
      x: 3,
      y: 1,
      rotate: 90,
      type: 'ElbowTube',
      settings: {},
      width: 1,
      height: 1,
    },
    {
      id: '5',
      x: 3,
      y: 3,
      rotate: 0,
      type: 'ElbowTube',
      settings: {},
      width: 1,
      height: 1,
    },
    {
      id: '6',
      x: 4,
      y: 1,
      rotate: 180,
      type: 'ElbowTube',
      settings: {},
      width: 1,
      height: 1,
    },
    {
      id: '7',
      x: 4,
      y: 3,
      rotate: 270,
      type: 'ElbowTube',
      settings: {},
      width: 1,
      height: 1,
    },
    {
      id: '8',
      x: 4,
      y: 2,
      rotate: 90,
      type: 'TeeTube',
      settings: {},
      width: 1,
      height: 1,
    },
    {
      id: '9',
      x: 5,
      y: 2,
      rotate: 180,
      type: 'SystemIO',
      settings: {},
      width: 1,
      height: 1,
    },
  ];

  const flowParts = asFlowParts(parts, makeAllTransitions(parts));

  it('Should have a flow of value of 2 total and 1 for each split', () => {
    // source 1 + tube 1 + tee 0.5
    // + parallel(0.5 + 1 + 1 + 0.5, 0.5 + 1 + 1 + 0.5) = 1.5
    // + tee 0.5 + sink 1
    const partsWithFlow = calculateFlows(flowParts);
    expect(partsWithFlow).toMatchObject([
      {
        flows: {
          '2,2.5,0': { [COLD_WATER]: 2 },
        },
        type: 'SystemIO',
      },
      {
        flows: {
          '2,2.5,0': { [COLD_WATER]: -2 },
          '3,2.5,0': { [COLD_WATER]: 2 },
        },
        type: 'StraightTube',
      },
      {
        flows: {
          '3,2.5,0': { [COLD_WATER]: -2 },
          '3.5,2,0': { [COLD_WATER]: 1 },
          '3.5,3,0': { [COLD_WATER]: 1 },
        },
        type: 'TeeTube',
      },
      {
        flows: {
          '3.5,2,0': { [COLD_WATER]: -1 },
          '4,1.5,0': { [COLD_WATER]: 1 },
        },
        type: 'ElbowTube',
      },
      {
        flows: {
          '3.5,3,0': { [COLD_WATER]: -1 },
          '4,3.5,0': { [COLD_WATER]: 1 },
        },
        type: 'ElbowTube',
      },
      {
        flows: {
          '4,1.5,0': { [COLD_WATER]: -1 },
          '4.5,2,0': { [COLD_WATER]: 1 },
        },
        type: 'ElbowTube',
      },
      {
        flows: {
          '4,3.5,0': { [COLD_WATER]: -1 },
          '4.5,3,0': { [COLD_WATER]: 1 },
        },
        type: 'ElbowTube',
      },
      {
        flows: {
          '4.5,2,0': { [COLD_WATER]: -1 },
          '4.5,3,0': { [COLD_WATER]: -1 },
          '5,2.5,0': { [COLD_WATER]: 2 },
        },
        type: 'TeeTube',
      },
      {
        flows: {
          '5,2.5,0': { [COLD_WATER]: -2 },
        },
        type: 'SystemIO',
      },
    ]);
  });
});

describe('A single path with a pump', () => {
  const parts: BuilderPart[] = [
    {
      id: '1',
      x: 3,
      y: 2,
      rotate: 180,
      type: 'SystemIO',
      settings: {
        [IO_ENABLED_KEY]: true,
        [IO_PRESSURE_KEY]: 9,
        [COLOR_KEY]: COLD_WATER,
      },
      width: 1,
      height: 1,
    },
    {
      id: '2',
      x: 2,
      y: 2,
      rotate: 0,
      type: 'Pump',
      settings: {
        [IO_ENABLED_KEY]: false,
        [IO_PRESSURE_KEY]: 12,
      },
      width: 1,
      height: 1,
    },
    {
      id: '3',
      x: 1,
      y: 2,
      rotate: 0,
      type: 'SystemIO',
      settings: {},
      width: 1,
      height: 1,
    },
  ];

  it('Should have a flow of value of 3 for all parts with the pump disabled', () => {
    const flowParts = asFlowParts(parts, makeAllTransitions(parts));
    const partsWithFlow = calculateFlows(flowParts);
    expect(partsWithFlow).toMatchObject([
      {
        id: '1',
        x: 3,
        y: 2,
        rotate: 180,
        type: 'SystemIO',
        flows: {
          '3,2.5,0': { [COLD_WATER]: 3 },
        },
        settings: {
          [IO_ENABLED_KEY]: true,
          [IO_PRESSURE_KEY]: 9,
          [COLOR_KEY]: COLD_WATER,
        },
      },
      {
        id: '2',
        x: 2,
        y: 2,
        rotate: 0,
        type: 'Pump',
        flows: {
          '3,2.5,0': { [COLD_WATER]: -3 },
          '2,2.5,0': { [COLD_WATER]: 3 },
        },
        settings: {
          [IO_ENABLED_KEY]: false,
          [IO_PRESSURE_KEY]: 12,
        },
      },
      {
        id: '3',
        x: 1,
        y: 2,
        rotate: 0,
        type: 'SystemIO',
        flows: {
          '2,2.5,0': { [COLD_WATER]: -3 },
        },
      },
    ]);
  });

  describe('Two input tubes with different liquid joining', () => {
    it('Should have a flow of value of 9 when the pump is enabled', () => {
      // (input pressure 9 + pump pressure 12) / friction 3 = 7
      set(parts[1], ['settings', IO_ENABLED_KEY], true);
      const flowParts = asFlowParts(parts, makeAllTransitions(parts));
      const partsWithFlow = calculateFlows(flowParts);
      expect(partsWithFlow).toMatchObject([
        {
          id: '1',
          x: 3,
          y: 2,
          rotate: 180,
          type: 'SystemIO',
          flows: {
            '3,2.5,0': { [COLD_WATER]: 7 },
          },
          settings: {
            [IO_ENABLED_KEY]: true,
            [IO_PRESSURE_KEY]: 9,
          },
        },
        {
          id: '2',
          x: 2,
          y: 2,
          rotate: 0,
          type: 'Pump',
          flows: {
            '3,2.5,0': { [COLD_WATER]: -7 },
            '2,2.5,0': { [COLD_WATER]: 7 },
          },
          settings: {
            [IO_ENABLED_KEY]: true,
            [IO_PRESSURE_KEY]: 12,
          },
        },
        {
          id: '3',
          x: 1,
          y: 2,
          rotate: 0,
          type: 'SystemIO',
          flows: {
            '2,2.5,0': { [COLD_WATER]: -7 },
          },
        },
      ]);
    });
  });
});

describe('Two sources joining', () => {
  const parts: BuilderPart[] = [
    {
      id: '1',
      x: 1,
      y: 1,
      rotate: 0,
      type: 'SystemIO',
      settings: {
        [IO_ENABLED_KEY]: true,
        [IO_PRESSURE_KEY]: 15,
        [COLOR_KEY]: COLD_WATER,
      },
      width: 1,
      height: 1,
    },
    {
      id: '2',
      x: 1,
      y: 3,
      rotate: 0,
      type: 'SystemIO',
      settings: {
        [IO_ENABLED_KEY]: true,
        [IO_PRESSURE_KEY]: 15,
        [COLOR_KEY]: HOT_WATER,
      },
      width: 1,
      height: 1,
    },
    {
      id: '3',
      x: 2,
      y: 1,
      rotate: 180,
      type: 'ElbowTube',
      settings: {},
      width: 1,
      height: 1,
    },
    {
      id: '4',
      x: 2,
      y: 3,
      rotate: 270,
      type: 'ElbowTube',
      settings: {},
      width: 1,
      height: 1,
    },
    {
      id: '5',
      x: 2,
      y: 2,
      rotate: 90,
      type: 'TeeTube',
      settings: {},
      width: 1,
      height: 1,
    },
    {
      id: '6',
      x: 3,
      y: 2,
      rotate: 0,
      type: 'StraightTube',
      settings: {},
      width: 1,
      height: 1,
    },
    {
      id: '7',
      x: 4,
      y: 2,
      rotate: 180,
      type: 'SystemIO',
      settings: {},
      width: 1,
      height: 1,
    },
  ];

  it('Should have the correct flow and liquids in all paths', () => {
    const partsWithFlow = calculateFlows(
      asFlowParts(parts, makeAllTransitions(parts)),
    );
    expect(partsWithFlow).toMatchObject([
      {
        flows: {
          '2,1.5,0': {
            [COLD_WATER]: 2,
          },
        },
        type: 'SystemIO',
        x: 1,
        y: 1,
      },
      {
        flows: {
          '2,3.5,0': {
            [HOT_WATER]: 2,
          },
        },
        type: 'SystemIO',
        x: 1,
        y: 3,
      },
      {
        flows: {
          '2,1.5,0': {
            [COLD_WATER]: -2,
          },
          '2.5,2,0': {
            [COLD_WATER]: 2,
          },
        },
        type: 'ElbowTube',
        x: 2,
        y: 1,
      },
      {
        flows: {
          '2,3.5,0': {
            [HOT_WATER]: -2,
          },
          '2.5,3,0': {
            [HOT_WATER]: 2,
          },
        },
        type: 'ElbowTube',
        x: 2,
        y: 3,
      },
      {
        flows: {
          '2.5,2,0': {
            [COLD_WATER]: -2,
          },
          '2.5,3,0': {
            [HOT_WATER]: -2,
          },
          '3,2.5,0': {
            [COLD_WATER]: 2,
            [HOT_WATER]: 2,
          },
        },
        type: 'TeeTube',
        x: 2,
        y: 2,
      },
      {
        flows: {
          '3,2.5,0': {
            [COLD_WATER]: -2,
            [HOT_WATER]: -2,
          },
          '4,2.5,0': {
            [COLD_WATER]: 2,
            [HOT_WATER]: 2,
          },
        },
        type: 'StraightTube',
        x: 3,
        y: 2,
      },
      {
        flows: {
          '4,2.5,0': {
            [COLD_WATER]: -2,
            [HOT_WATER]: -2,
          },
        },
        type: 'SystemIO',
        x: 4,
        y: 2,
      },
    ]);
  });
});

describe('A path with a bridge', () => {
  // 7 transitions long, passes the bridge twice
  const parts: BuilderPart[] = [
    {
      id: '1',
      x: 11,
      y: 2,
      type: 'SystemIO',
      rotate: 0,
      settings: {
        [COLOR_KEY]: COLD_WATER,
        [IO_ENABLED_KEY]: true,
        [IO_PRESSURE_KEY]: 8,
      },
      width: 1,
      height: 1,
    },
    {
      id: '2',
      x: 12,
      y: 2,
      type: 'StraightTube',
      rotate: 0,
      settings: {},
      width: 1,
      height: 1,
    },
    {
      id: '3',
      type: 'BridgeTube',
      x: 13,
      y: 2,
      rotate: 0,
      settings: {},
      width: 1,
      height: 1,
    },
    {
      id: '4',
      type: 'SystemIO',
      x: 13,
      y: 1,
      rotate: 90,
      settings: {},
      width: 1,
      height: 1,
    },
    {
      id: '5',
      x: 14,
      y: 2,
      type: 'ElbowTube',
      rotate: 180,
      settings: {},
      width: 1,
      height: 1,
    },
    {
      id: '6',
      type: 'ElbowTube',
      x: 14,
      y: 3,
      rotate: 270,
      settings: {},
      width: 1,
      height: 1,
    },
    {
      id: '7',
      x: 13,
      y: 3,
      type: 'ElbowTube',
      rotate: 0,
      settings: {},
      width: 1,
      height: 1,
    },
  ];

  it('Should have the correct flow and liquids in all paths', () => {
    const partsWithFlow = calculateFlows(
      asFlowParts(parts, makeAllTransitions(parts)),
    );
    expect(partsWithFlow).toMatchObject([
      {
        x: 11,
        y: 2,
        type: 'SystemIO',
        rotate: 0,
        settings: {
          [COLOR_KEY]: COLD_WATER,
          [IO_ENABLED_KEY]: true,
          [IO_PRESSURE_KEY]: 8,
        },
        flows: {
          '12,2.5,0': {
            [COLD_WATER]: 1,
          },
        },
      },
      {
        x: 12,
        y: 2,
        type: 'StraightTube',
        rotate: 0,
        settings: {},
        flows: {
          '12,2.5,0': {
            [COLD_WATER]: -1,
          },
          '13,2.5,0': {
            [COLD_WATER]: 1,
          },
        },
      },
      {
        type: 'BridgeTube',
        x: 13,
        y: 2,
        rotate: 0,
        settings: {},
        flows: {
          '13.5,3,0': {
            [COLD_WATER]: -1,
          },
          '13.5,2,0': {
            [COLD_WATER]: 1,
          },
          '14,2.5,0': {
            [COLD_WATER]: 1,
          },
          '13,2.5,0': {
            [COLD_WATER]: -1,
          },
        },
      },
      {
        type: 'SystemIO',
        x: 13,
        y: 1,
        rotate: 90,
        settings: {},
        flows: {
          '13.5,2,0': {
            [COLD_WATER]: -1,
          },
        },
      },
      {
        x: 14,
        y: 2,
        type: 'ElbowTube',
        rotate: 180,
        settings: {},
        flows: {
          '14,2.5,0': {
            [COLD_WATER]: -1,
          },
          '14.5,3,0': {
            [COLD_WATER]: 1,
          },
        },
      },
      {
        type: 'ElbowTube',
        x: 14,
        y: 3,
        rotate: 270,
        settings: {},
        flows: {
          '14.5,3,0': {
            [COLD_WATER]: -1,
          },
          '14,3.5,0': {
            [COLD_WATER]: 1,
          },
        },
      },
      {
        x: 13,
        y: 3,
        type: 'ElbowTube',
        rotate: 0,
        settings: {},
        flows: {
          '14,3.5,0': {
            [COLD_WATER]: -1,
          },
          '13.5,3,0': {
            [COLD_WATER]: 1,
          },
        },
      },
    ]);
  });
});

describe('A kettle with 2 outflows', () => {
  const parts: BuilderPart[] = [
    {
      id: '1',
      rotate: 0,
      settings: {
        [COLOR_KEY]: '#ff0000',
      },
      flipped: false,
      type: 'Kettle',
      x: 1,
      y: 1,
      width: 4,
      height: 6,
    },
    {
      id: '2',
      rotate: 0,
      settings: {},
      flipped: true,
      type: 'DipTube',
      x: 4,
      y: 6,
      width: 1,
      height: 1,
    },
    {
      id: '3',
      rotate: 0,
      settings: {
        [IO_ENABLED_KEY]: true,
        [IO_PRESSURE_KEY]: 10,
      },
      flipped: true,
      type: 'Pump',
      x: 5,
      y: 6,
      width: 1,
      height: 1,
    },
    {
      id: '4',
      rotate: 0,
      settings: {},
      flipped: true,
      type: 'SystemIO',
      x: 6,
      y: 6,
      width: 1,
      height: 1,
    },
    {
      id: '5',
      rotate: 0,
      settings: {},
      flipped: true,
      type: 'DipTube',
      x: 4,
      y: 5,
      width: 1,
      height: 1,
    },
    {
      id: '6',
      rotate: 0,
      type: 'Pump',
      settings: {
        [IO_ENABLED_KEY]: true,
        [IO_PRESSURE_KEY]: 10,
      },
      flipped: true,
      x: 5,
      y: 5,
      width: 1,
      height: 1,
    },
    {
      id: '7',
      rotate: 0,
      settings: {},
      flipped: true,
      type: 'SystemIO',
      x: 6,
      y: 5,
      width: 1,
      height: 1,
    },
  ];

  it('Each branch should have flow 10/3', () => {
    const partsWithFlow = calculateFlows(
      asFlowParts(parts, makeAllTransitions(parts)),
    );
    const straight1 = partsWithFlow.find((part) => part.id === '3');
    expect(straight1).toMatchObject({
      id: '3',
      flows: {
        '5,6.5,0': {
          '#ff0000': expect.closeTo(-10 / 3, 6),
        },
        '6,6.5,0': {
          '#ff0000': expect.closeTo(10 / 3, 6),
        },
      },
    });

    const straight2 = partsWithFlow.find((part) => part.id === '6');
    expect(straight2).toMatchObject({
      id: '6',
      flows: {
        '5,5.5,0': {
          '#ff0000': expect.closeTo(-10 / 3, 6),
        },
        '6,5.5,0': {
          '#ff0000': expect.closeTo(10 / 3, 6),
        },
      },
    });
  });
});

describe('A kettle with flow back to itself', () => {
  let parts: BuilderPart[] = [
    {
      id: '1',
      rotate: 0,
      settings: {
        [COLOR_KEY]: '#ff0000',
      },
      type: 'Kettle',
      x: 1,
      y: 1,
      width: 4,
      height: 6,
    },
    {
      id: '2',
      rotate: 0,
      settings: {},
      flipped: true,
      type: 'DipTube',
      x: 4,
      y: 4,
      width: 1,
      height: 1,
    },
    {
      id: '3',
      rotate: 180,
      settings: {},
      type: 'ElbowTube',
      x: 5,
      y: 4,
      width: 1,
      height: 1,
    },
    {
      id: '5',
      rotate: 270,
      settings: {},
      type: 'ElbowTube',
      x: 5,
      y: 6,
      width: 1,
      height: 1,
    },
    {
      id: '6',
      rotate: 0,
      settings: {},
      flipped: true,
      type: 'DipTube',
      x: 4,
      y: 6,
      width: 1,
      height: 1,
    },
  ];

  describe('with a disabled pump', () => {
    parts = [
      ...parts,
      {
        id: '4',
        rotate: 270,
        settings: {
          [IO_ENABLED_KEY]: false,
          [IO_PRESSURE_KEY]: 10,
        },
        type: 'Pump',
        x: 5,
        y: 5,
        width: 1,
        height: 1,
      },
    ];

    const flowParts = asFlowParts(parts, makeAllTransitions(parts));
    it('Should have zero flow with the pump disabled', () => {
      const partsWithFlow = calculateFlows(flowParts);
      const part = partsWithFlow.find((part) => part.id === '3');
      expect(part).toMatchObject({
        id: '3',
        flows: {
          '5,4.5,0': {
            '#ff0000': 0,
          },
          '5.5,5,0': {
            '#ff0000': 0,
          },
        },
      });
    });
  });

  describe('with an enabled pump', () => {
    parts = [
      ...parts.filter((p) => p.type !== 'Pump'),
      {
        id: '4',
        rotate: 270,
        settings: {
          [IO_ENABLED_KEY]: true,
          [IO_PRESSURE_KEY]: 10,
        },
        type: 'Pump',
        x: 5,
        y: 5,
        width: 1,
        height: 1,
      },
    ];
    it('Should have flow 2', () => {
      const partsWithFlow = calculateFlows(
        asFlowParts(parts, makeAllTransitions(parts)),
      );
      const part = partsWithFlow.find((part) => part.id === '3');
      expect(part).toMatchObject({
        id: '3',
        flows: {
          '5,4.5,0': {
            '#ff0000': -2,
          },
          '5.5,5,0': {
            '#ff0000': 2,
          },
        },
      });
    });
  });
});

describe('A forking and joining path with a pump in each fork', () => {
  const partsBase: BuilderPart[] = [
    {
      id: '1a',
      rotate: 180,
      settings: {
        [COLOR_KEY]: '#DB0023',
        [IO_ENABLED_KEY]: true,
        [IO_PRESSURE_KEY]: 0,
      },
      flipped: false,
      type: 'SystemIO',
      x: 2,
      y: 2,
      width: 1,
      height: 1,
    },
    {
      id: '1b',
      rotate: 180,
      settings: {},
      flipped: false,
      type: 'SystemIO',
      x: 2,
      y: 0,
      width: 1,
      height: 1,
    },
    {
      id: '2',
      rotate: 0,
      settings: {},
      flipped: false,
      type: 'ElbowTube',
      x: 0,
      y: 2,
      width: 1,
      height: 1,
    },
    {
      id: '3',
      rotate: 90,
      settings: {},
      flipped: false,
      type: 'ElbowTube',
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    },
    {
      id: '4',
      rotate: 0,
      settings: {},
      flipped: false,
      type: 'TeeTube',
      x: 1,
      y: 2,
      width: 1,
      height: 1,
    },
    {
      id: '5',
      rotate: 180,
      settings: {},
      flipped: false,
      type: 'TeeTube',
      x: 1,
      y: 0,
      width: 1,
      height: 1,
    },
  ];

  it('has no flow with both pumps disabled', () => {
    const parts: BuilderPart[] = [
      ...partsBase,
      {
        id: '8',
        rotate: 90,
        settings: {
          [IO_ENABLED_KEY]: false,
        },
        flipped: false,
        type: 'Pump',
        x: 1,
        y: 1,
        width: 1,
        height: 1,
      },
      {
        id: '9',
        rotate: 90,
        settings: {
          [IO_ENABLED_KEY]: false,
        },
        flipped: false,
        type: 'Pump',
        x: 0,
        y: 1,
        width: 1,
        height: 1,
      },
    ];

    const partsWithFlow = calculateFlows(
      asFlowParts(parts, makeAllTransitions(parts)),
    );
    expect(partsWithFlow[0].flows['2,2.5,0']['#DB0023']).toBeCloseTo(0, 2);
  });

  it('has flow with one pump enabled', () => {
    const parts: BuilderPart[] = [
      ...partsBase,
      {
        id: '10',
        rotate: 90,
        settings: {
          [IO_ENABLED_KEY]: true,
          [IO_PRESSURE_KEY]: 10,
        },
        flipped: false,
        type: 'Pump',
        x: 1,
        y: 1,
        width: 1,
        height: 1,
      },
      {
        id: '11',
        rotate: 90,
        settings: {
          [IO_ENABLED_KEY]: false,
          [IO_PRESSURE_KEY]: 10,
        },
        flipped: false,
        type: 'Pump',
        x: 0,
        y: 1,
        width: 1,
        height: 1,
      },
    ];

    const partsWithFlow = calculateFlows(
      asFlowParts(parts, makeAllTransitions(parts)),
    );
    // The pump pushes liquid around the loop: (0.5 + 1 + 0.5) + parallel(4, 3)
    // 4/7 of it passes through the source and the sink
    const pumpFlow = 10 / (2 + (4 * 3) / (4 + 3));
    expect(partsWithFlow[0].flows['2,2.5,0']['#DB0023']).toBeCloseTo(
      (pumpFlow * 4) / 7,
      6,
    );
  });

  it('has flow with the other pump enabled', () => {
    const parts: BuilderPart[] = [
      ...partsBase,
      {
        id: '10',
        rotate: 90,
        settings: {
          [IO_ENABLED_KEY]: false,
          [IO_PRESSURE_KEY]: 10,
        },
        flipped: false,
        type: 'Pump',
        x: 1,
        y: 1,
        width: 1,
        height: 1,
      },
      {
        id: '11',
        rotate: 90,
        settings: {
          [IO_ENABLED_KEY]: true,
          [IO_PRESSURE_KEY]: 10,
        },
        flipped: false,
        type: 'Pump',
        x: 0,
        y: 1,
        width: 1,
        height: 1,
      },
    ];

    const partsWithFlow = calculateFlows(
      asFlowParts(parts, makeAllTransitions(parts)),
    );
    // The pump pushes liquid around the loop: (0.5 + 1 + 1 + 1 + 0.5) + parallel(2, 3)
    // 2/5 of it passes through the source and the sink
    const pumpFlow = 10 / (4 + (2 * 3) / (2 + 3));
    expect(partsWithFlow[0].flows['2,2.5,0']['#DB0023']).toBeCloseTo(
      (pumpFlow * 2) / 5,
      6,
    );
  });

  it('has more flow with both pumps', () => {
    const parts: BuilderPart[] = [
      ...partsBase,
      {
        id: '10',
        rotate: 90,
        settings: {
          [IO_ENABLED_KEY]: true,
          [IO_PRESSURE_KEY]: 10,
        },
        flipped: false,
        type: 'Pump',
        x: 1,
        y: 1,
        width: 1,
        height: 1,
      },
      {
        id: '11',
        rotate: 90,
        settings: {
          [IO_ENABLED_KEY]: true,
          [IO_PRESSURE_KEY]: 10,
        },
        flipped: false,
        type: 'Pump',
        x: 0,
        y: 1,
        width: 1,
        height: 1,
      },
    ];

    const partsWithFlow = calculateFlows(
      asFlowParts(parts, makeAllTransitions(parts)),
    );
    // Superposition of both pumps
    const pumpFlowA = 10 / (2 + (4 * 3) / (4 + 3));
    const pumpFlowB = 10 / (4 + (2 * 3) / (2 + 3));
    expect(partsWithFlow[0].flows['2,2.5,0']['#DB0023']).toBeCloseTo(
      (pumpFlowA * 4) / 7 + (pumpFlowB * 2) / 5,
      6,
    );
  });
});
