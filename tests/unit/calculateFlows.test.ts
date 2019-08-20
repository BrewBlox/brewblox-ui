import get from 'lodash/get';
import set from 'lodash/set';

import { FlowSegment } from '@/plugins/builder/FlowSegment';
import {
  asFlowParts,
  calculateFlows,
  flowPath,
} from '@/plugins/builder/calculateFlows';
import { COLD_WATER, HOT_WATER, IN_OUT } from '@/plugins/builder/getters';
import specs from '@/plugins/builder/specs';
import { PersistentPart, StatePart } from '@/plugins/builder/types';

function asStatePart(part: PersistentPart): StatePart {
  const spec = specs[part.type];
  return {
    ...part,
    transitions: spec.transitions(part),
    size: spec.size(part),
  };
}

const propertyWalker = (acc: any[], next: FlowSegment, prop: string[]): any[] => {
  acc = [...acc, get(next, prop)];

  type StringList = string | any[];
  let subtree: StringList[] = [];

  next.splits.forEach((child) => {
    subtree.push(propertyWalker([], child, prop)); // splits
  });
  if (subtree.length !== 0) {
    acc = [...acc, subtree];
  }
  if (next.next !== null) {
    acc = [...acc, ...propertyWalker([], next.next, prop)];
  }
  return acc;
};

describe('Data describing an input tube', () => {
  const part: PersistentPart = {
    id: '',
    x: 1,
    y: 2,
    rotate: 0,
    type: 'SystemIO',
    settings: {
      pressure: 11,
      liquids: [COLD_WATER],
    },
  };

  it('can resolve to transitions', () => {
    expect(asStatePart(part).transitions).toEqual(
      {
        [IN_OUT]: [{ outCoords: '1,0.5,0', pressure: 11, liquids: [COLD_WATER] }],
        '1,0.5,0': [{ outCoords: IN_OUT }],
      });
  });
});


describe('asFlowParts', () => {
  const path: PersistentPart[] = [
    {
      id: 'one',
      x: 1,
      y: 2,
      rotate: 0,
      type: 'SystemIO',
      settings: {
        liquids: [COLD_WATER],
      },
    },
    {
      id: 'two',
      x: 2,
      y: 2,
      rotate: 0,
      type: 'StraightTube',
      settings: {},
    },
    {
      id: 'three',
      x: 3,
      y: 2,
      rotate: 0,
      type: 'SystemIO',
      settings: {},
    },
  ];

  it('it adds transitions', () => {
    asFlowParts(path.map(asStatePart)).forEach(part => {
      expect(part).toHaveProperty('transitions');
    });
  });
});


describe('A single path without splits', () => {
  const parts: PersistentPart[] = [
    {
      id: '1',
      x: 1,
      y: 2,
      rotate: 0,
      type: 'SystemIO',
      settings: {
        pressure: 6,
        liquids: [HOT_WATER],
      },
    },
    {
      id: '2',
      x: 3,
      y: 2,
      rotate: 180,
      type: 'SystemIO',
      settings: {},
    },
    {
      id: '3',
      x: 2,
      y: 2,
      rotate: 0,
      type: 'StraightTube',
      settings: {},
    },
  ];

  const flowParts = asFlowParts(parts.map(asStatePart));
  const start = flowParts[0];

  const path = flowPath(flowParts, start, IN_OUT);
  if (path === null) {
    throw ('no path found');
  }

  it('Should have no splits', () => {
    let walker: FlowSegment = path;
    let pathTypes: string[] = ['SystemIO'];
    while (true) {
      if (walker.next === null) {
        break; // end of path
      }
      expect(walker.splits).toHaveLength(0);
      pathTypes.push(walker.next.root.type);
      walker = walker.next;
    }
    expect(pathTypes).toEqual(['SystemIO', 'StraightTube', 'SystemIO']);
  });

  it('Should have a friction value of 3', () => {
    expect(path.friction()).toEqual(3);
  });

  it('Should have a flow of value of 2 for all parts', () => {
    const partsWithFlow = calculateFlows(flowParts);
    expect(partsWithFlow).toMatchObject(
      [{
        x: 1,
        y: 2,
        rotate: 0,
        type: 'SystemIO',
        flows: {
          [IN_OUT]: {
            [HOT_WATER]: -2,
          },
          '2,2.5,0': {
            [HOT_WATER]: 2,
          },
        },
        settings: {
          pressure: 6,
          liquids: [HOT_WATER],
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
          [IN_OUT]: {
            [HOT_WATER]: 2,
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
            [HOT_WATER]: - 2,
          },
          '3,2.5,0': {
            [HOT_WATER]: 2,
          },
        },
      }]
    );
  });
});


describe('A path with a split, but no joins', () => {
  const parts: PersistentPart[] = [
    {
      id: '1',
      x: 1,
      y: 2,
      rotate: 0,
      type: 'SystemIO',
      settings: {
        pressure: 14,
        liquids: [COLD_WATER],
      },
    },
    {
      id: '2',
      x: 2,
      y: 2,
      rotate: 0,
      type: 'StraightTube',
      settings: {},
    },
    {
      id: '3',
      x: 3,
      y: 2,
      rotate: 270,
      type: 'TeeTube',
      settings: {},
    },
    {
      id: '4',
      x: 3,
      y: 1,
      rotate: 90,
      type: 'SystemIO',
      settings: {},
    },
    {
      id: '5',
      x: 3,
      y: 3,
      rotate: 270,
      type: 'SystemIO',
      settings: {},
    },
  ];

  const flowParts = asFlowParts(parts.map(asStatePart));
  const start = flowParts[0];

  const path = flowPath(flowParts, start, IN_OUT);
  if (path === null) {
    throw ('no path found');
  }

  it('Should return a forking path', () => {

    const visitedTypes = propertyWalker([], path, ['root', 'type']);
    expect(visitedTypes).toEqual(
      [
        'SystemIO',
        'StraightTube',
        'TeeTube',
        [
          [
            'SystemIO',
          ],
          [
            'SystemIO',
          ],
        ],
      ]);

    const transitions = propertyWalker([], path, ['transitions']);
    expect(transitions).toEqual(
      [
        {
          [IN_OUT]: [{ outCoords: '2,2.5,0', pressure: 14, liquids: [COLD_WATER] }],
        },
        {
          '2,2.5,0': [{ outCoords: '3,2.5,0' }],
        },
        {
          '3,2.5,0': [{ outCoords: '3.5,2,0' }, { outCoords: '3.5,3,0' }],
        },
        [
          [
            {
              '3.5,2,0': [{ outCoords: IN_OUT }],
            },
          ],
          [
            {
              '3.5,3,0': [{ outCoords: IN_OUT }],
            },
          ],
        ],
      ]);
  });

  it('Should have a friction value of 3.5', () => {
    expect(path.friction()).toEqual(3.5);
  });

  it('Should have a flow of value of 4 total and 2 for each split', () => {
    const partsWithFlow = calculateFlows(flowParts);
    expect(partsWithFlow).toMatchObject(
      [
        {
          flows: {
            [IN_OUT]: {
              [COLD_WATER]: -4,
            },
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
            [IN_OUT]: {
              [COLD_WATER]: 2,
            },
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
            [IN_OUT]: {
              [COLD_WATER]: 2,
            },
            '3.5,3,0': {
              [COLD_WATER]: -2,
            },
          },
          type: 'SystemIO',
        },
      ]
    );
  });
});

describe('A path that forks and rejoins', () => {
  const parts: PersistentPart[] = [
    {
      id: '1',
      x: 1,
      y: 2,
      rotate: 0,
      type: 'SystemIO',
      settings: {
        pressure: 11,
        liquids: [COLD_WATER],
      },
    },
    {
      id: '2',
      x: 2,
      y: 2,
      rotate: 0,
      type: 'StraightTube',
      settings: {},
    },
    {
      id: '3',
      x: 3,
      y: 2,
      rotate: 270,
      type: 'TeeTube',
      settings: {},
    },
    {
      id: '4',
      x: 3,
      y: 1,
      rotate: 90,
      type: 'ElbowTube',
      settings: {},
    },
    {
      id: '5',
      x: 3,
      y: 3,
      rotate: 0,
      type: 'ElbowTube',
      settings: {},
    },
    {
      id: '6',
      x: 4,
      y: 1,
      rotate: 180,
      type: 'ElbowTube',
      settings: {},
    },
    {
      id: '7',
      x: 4,
      y: 3,
      rotate: 270,
      type: 'ElbowTube',
      settings: {},
    },
    {
      id: '8',
      x: 4,
      y: 2,
      rotate: 90,
      type: 'TeeTube',
      settings: {},
    },
    {
      id: '9',
      x: 5,
      y: 2,
      rotate: 180,
      type: 'SystemIO',
      settings: {},
    },
  ];

  const flowParts = asFlowParts(parts.map(asStatePart));
  const start = flowParts[0];

  const path = flowPath(flowParts, start, IN_OUT);
  if (path === null) {
    throw ('no path found');
  }

  it('Should return a forking and rejoining path', () => {

    const visitedTypes = propertyWalker([], path, ['root', 'type']);

    expect(visitedTypes).toEqual(
      [
        'SystemIO',
        'StraightTube',
        'TeeTube',
        [
          [
            'ElbowTube',
            'ElbowTube',
            'TeeTube',
          ],
          [
            'ElbowTube',
            'ElbowTube',
            'TeeTube',
          ],
        ],
        'SystemIO',
      ]);

    const transitions = propertyWalker([], path, ['transitions']);
    expect(transitions).toEqual(
      [
        { [IN_OUT]: [{ outCoords: '2,2.5,0', pressure: 11, liquids: [COLD_WATER] }] },
        { '2,2.5,0': [{ outCoords: '3,2.5,0' }] },
        { '3,2.5,0': [{ outCoords: '3.5,2,0' }, { outCoords: '3.5,3,0' }] },
        [
          [
            { '3.5,2,0': [{ outCoords: '4,1.5,0' }] },
            { '4,1.5,0': [{ outCoords: '4.5,2,0' }] },
            { '4.5,2,0': [{ outCoords: '5,2.5,0' }] },
          ],
          [
            { '3.5,3,0': [{ outCoords: '4,3.5,0' }] },
            { '4,3.5,0': [{ outCoords: '4.5,3,0' }] },
            { '4.5,3,0': [{ outCoords: '5,2.5,0' }] },
          ],
        ],
        { '5,2.5,0': [{ outCoords: IN_OUT }] },
      ]);
  });

  it('Should have a friction value of 6', () => {
    expect(path.friction()).toEqual(5.5);
  });

  it('Should have a flow of value of 2 total and 1 for each split', () => {
    const partsWithFlow = calculateFlows(flowParts);
    expect(partsWithFlow).toMatchObject(
      [
        {
          flows: {
            [IN_OUT]: { [COLD_WATER]: -2 },
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
            [IN_OUT]: { [COLD_WATER]: 2 },
            '5,2.5,0': { [COLD_WATER]: -2 },
          },
          type: 'SystemIO',
        },
      ]
    );
  });
});

describe('A single path with a pump', () => {
  const parts: PersistentPart[] = [
    {
      id: '1',
      x: 3,
      y: 2,
      rotate: 180,
      type: 'SystemIO',
      settings: {
        pressure: 6,
        liquids: [COLD_WATER],
      },
    },
    {
      id: '2',
      x: 2,
      y: 2,
      rotate: 0,
      type: 'Pump',
      settings: {
        disabled: true,
        pressure: 12,
      },
    },
    {
      id: '3',
      x: 1,
      y: 2,
      rotate: 0,
      type: 'SystemIO',
      settings: {},
    },
  ];


  it('Should have a flow of value of 2 for all parts with the pump disabled', () => {
    const flowParts = asFlowParts(parts.map(asStatePart));
    const partsWithFlow = calculateFlows(flowParts);
    expect(partsWithFlow).toMatchObject(
      [{
        id: '1',
        x: 3,
        y: 2,
        rotate: 180,
        type: 'SystemIO',
        flows: {
          [IN_OUT]: { [COLD_WATER]: -2 },
          '3,2.5,0': { [COLD_WATER]: 2 },
        },
        settings: {
          pressure: 6,
          liquids: [COLD_WATER],
        },
      },
      {
        id: '2',
        x: 2,
        y: 2,
        rotate: 0,
        type: 'Pump',
        flows: {
          '3,2.5,0': { [COLD_WATER]: -2 },
          '2,2.5,0': { [COLD_WATER]: 2 },
        },
        settings: {
          disabled: true,
          pressure: 12,
        },
      },
      {
        id: '3',
        x: 1,
        y: 2,
        rotate: 0,
        type: 'SystemIO',
        flows: {
          '2,2.5,0': { [COLD_WATER]: -2 },
          [IN_OUT]: { [COLD_WATER]: 2 },
        },
      },
      ]
    );
  });

  describe('Two input tubes with different liquid joining', () => {
    it('Should have a flow of value of 6 when the pump is enabled', () => {
      // (input pressure 6 + pump pressure 12) / friction 3 = 6
      set(parts[1], ['settings', 'enabled'], true);
      const flowParts = asFlowParts(parts.map(asStatePart));
      const partsWithFlow = calculateFlows(flowParts);
      expect(partsWithFlow).toMatchObject(
        [{
          id: '1',
          x: 3,
          y: 2,
          rotate: 180,
          type: 'SystemIO',
          flows: {}, /*{
            [IN_OUT]: { [COLD_WATER]: -6 },
            '3,2.5': { [COLD_WATER]: 6 },
          },*/
          settings: {
            pressure: 6,
          },
        },
        {
          id: '2',
          x: 2,
          y: 2,
          rotate: 0,
          type: 'Pump',
          flows: {
            '3,2.5,0': { [COLD_WATER]: -6 },
            '2,2.5,0': { [COLD_WATER]: 6 },
          },
          settings: {
            enabled: true,
            pressure: 12,
          },
        },
        {
          id: '3',
          x: 1,
          y: 2,
          rotate: 0,
          type: 'SystemIO',
          flows: {
            '2,2.5,0': { [COLD_WATER]: -6 },
            [IN_OUT]: { [COLD_WATER]: 6 },
          },
        },
        ]
      );
    });
  });
});


describe('Two sources joining', () => {
  const parts: PersistentPart[] = [
    {
      id: '1',
      x: 1,
      y: 1,
      rotate: 0,
      type: 'SystemIO',
      settings: {
        pressure: 11,
        liquids: [COLD_WATER],
      },
    },
    {
      id: '2',
      x: 1,
      y: 3,
      rotate: 0,
      type: 'SystemIO',
      settings: {
        pressure: 11,
        liquids: [HOT_WATER],
      },
    },
    {
      id: '3',
      x: 2,
      y: 1,
      rotate: 180,
      type: 'ElbowTube',
      settings: {},
    },
    {
      id: '4',
      x: 2,
      y: 3,
      rotate: 270,
      type: 'ElbowTube',
      settings: {},
    },
    {
      id: '5',
      x: 2,
      y: 2,
      rotate: 90,
      type: 'TeeTube',
      settings: {},
    },
    {
      id: '6',
      x: 3,
      y: 2,
      rotate: 180,
      type: 'SystemIO',
      settings: {},
    },
  ];

  it('Should have the correct flow and liquids in all paths', () => {
    const partsWithFlow = calculateFlows(asFlowParts(parts.map(asStatePart)));
    expect(partsWithFlow).toMatchObject(
      [
        {
          'flows': {
            [IN_OUT]: {
              [COLD_WATER]: -2,
            },
            '2,1.5,0': {
              [COLD_WATER]: 2,
            },
          },
          'type': 'SystemIO',
          'x': 1,
          'y': 1,
        },
        {
          'flows': {
            [IN_OUT]: {
              [HOT_WATER]: -2,
            },
            '2,3.5,0': {
              [HOT_WATER]: 2,
            },
          },
          'type': 'SystemIO',
          'x': 1,
          'y': 3,
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
          'type': 'ElbowTube',
          'x': 2,
          'y': 1,
        },
        {
          'flows': {
            '2,3.5,0': {
              [HOT_WATER]: -2,
            },
            '2.5,3,0': {
              [HOT_WATER]: 2,
            },
          },
          'type': 'ElbowTube',
          'x': 2,
          'y': 3,
        },
        {
          'flows': {
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
          'type': 'TeeTube',
          'x': 2,
          'y': 2,
        },
        {
          'flows': {
            [IN_OUT]: {
              [COLD_WATER]: 2,
              [HOT_WATER]: 2,
            },
            '3,2.5,0': {
              [COLD_WATER]: -2,
              [HOT_WATER]: -2,
            },
          },
          'type': 'SystemIO',
          'x': 3,
          'y': 2,
        },
      ]
    );
  });
});


describe('A path with a bridge', () => {
  const parts: PersistentPart[] = [
    {
      id: '1',
      x: 11,
      y: 2,
      type: 'SystemIO',
      rotate: 0,
      settings: {
        liquids: [COLD_WATER],
        pressure: 8,
      },
    },
    {
      id: '2',
      x: 12,
      y: 2,
      type: 'StraightTube',
      rotate: 0,
      settings: {},
    },
    {
      id: '3',
      type: 'BridgeTube',
      x: 13,
      y: 2,
      rotate: 0,
      settings: {},
    },
    {
      id: '4',
      type: 'SystemIO',
      x: 13,
      y: 1,
      rotate: 90,
      settings: {},
    },
    {
      id: '5',
      x: 14,
      y: 2,
      type: 'ElbowTube',
      rotate: 180,
      settings: {},
    },
    {
      id: '6',
      type: 'ElbowTube',
      x: 14,
      y: 3,
      rotate: 270,
      settings: {},
    },
    {
      id: '7',
      x: 13,
      y: 3,
      type: 'ElbowTube',
      rotate: 0,
      settings: {},
    },
  ];

  it('Should have the correct flow and liquids in all paths', () => {
    const partsWithFlow = calculateFlows(asFlowParts(parts.map(asStatePart)));
    expect(partsWithFlow).toMatchObject(
      [
        {
          x: 11,
          y: 2,
          type: 'SystemIO',
          rotate: 0,
          settings: {
            liquids: [COLD_WATER],
            pressure: 8,
          },
          flows: {
            [IN_OUT]: {
              [COLD_WATER]: -1,
            },
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
            [IN_OUT]: {
              [COLD_WATER]: 1,
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
