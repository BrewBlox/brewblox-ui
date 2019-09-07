import get from 'lodash/get';
import set from 'lodash/set';

import {
  asFlowParts,
  calculateFlows,
  flowPath,
} from '@/plugins/builder/calculateFlows';
import { FlowSegment } from '@/plugins/builder/FlowSegment';
import { COLD_WATER, HOT_WATER, IN_OUT } from '@/plugins/builder/getters';
import specs from '@/plugins/builder/specs';
import { FlowPart, FlowRoute, PersistentPart, StatePart } from '@/plugins/builder/types';

function asStatePart(part: PersistentPart): StatePart {
  const spec = specs[part.type];
  return {
    ...part,
    transitions: spec.transitions(part),
    size: spec.size(part),
  };
}

const propertyWalker = (acc: any[], item: FlowSegment, prop: string[]): any[] => {
  type StringList = string | any[];
  const subtree: StringList[] = [];

  acc = [...acc, get(item, prop)];
  item.splits.forEach((child) => {
    subtree.push(propertyWalker([], child.path, prop)); // splits
  });
  if (subtree.length !== 0) {
    acc = [...acc, subtree];
  }
  if (item.next !== null) {
    acc = [...acc, ...propertyWalker([], item.next.path, prop)];
  }
  return acc;
};

const routeWalker = (acc: any[], item: FlowSegment, inRoute: FlowRoute | null = null): any[] => {
  type StringList = string | any[];
  const subtree: StringList[] = [];

  if (inRoute) {
    acc = [...acc, inRoute];
  }

  item.splits.forEach((child) => {
    subtree.push(routeWalker([], child.path, child.route)); // splits
  });
  if (subtree.length !== 0) {
    acc = [...acc, subtree];
  }
  if (item.next !== null) {
    acc = [...acc, ...routeWalker([], item.next.path, item.next.route)];
  }
  return acc;
};

const findPath = (
  parts: FlowPart[],
  start: FlowPart): FlowSegment => {

  const link = flowPath(parts, start, { outCoords: IN_OUT });
  if (link === null) {
    throw ('no path found');
  }
  return link.path;
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
        [IN_OUT]: [{ outCoords: '1,0.5,0', pressure: 11, liquids: [COLD_WATER], source: true }],
        '1,0.5,0': [{ outCoords: IN_OUT, pressure: -11, sink: true }],
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
        pressure: 4,
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

  const path = findPath(flowParts, start);

  it('Should have no splits', () => {
    const visitedTypes = propertyWalker([], path, ['root', 'type']);
    expect(visitedTypes).toEqual(['SystemIO', 'StraightTube', 'SystemIO']);
  });

  it('Should have a friction value of 2', () => {
    const { friction, pressureDiff } = path.friction({ pressureDiff: 0, friction: 0 });
    expect(friction).toEqual(2);
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
          '2,2.5,0': {
            [HOT_WATER]: 2,
          },
        },
        settings: {
          pressure: 4,
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

  it('The end can be cut of at a specified route', () => {
    const end = path.trimAtRoute({ outCoords: '3,2.5,0' });
    expect(end).not.toBeNull();
    if (end !== null) {
      expect(end.path.root.x).toBe(3);

      expect(propertyWalker([], path, ['root', 'type'])).toEqual(['SystemIO', 'StraightTube']);
      expect(propertyWalker([], end.path, ['root', 'type'])).toEqual(['SystemIO']);
    }
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
        pressure: 10,
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

  const path = findPath(flowParts, start);

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

    const route = routeWalker([], path);
    expect(route).toEqual(
      [
        { outCoords: '2,2.5,0', pressure: 10, liquids: [COLD_WATER], source: true },
        { outCoords: '3,2.5,0' },
        [[{ outCoords: '3.5,2,0' }], [{ outCoords: '3.5,3,0' }]],
      ]);
  });

  it('Should have a friction value of 2.5', () => {
    const { friction, pressureDiff } = path.friction({ pressureDiff: 0, friction: 0 });
    expect(friction).toEqual(2.5);
  });

  it('Should have a flow of value of 4 total and 2 for each split', () => {
    const partsWithFlow = calculateFlows(flowParts);
    expect(partsWithFlow).toMatchObject(
      [
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
        pressure: 9,
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

  const path = findPath(flowParts, start);
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
  });
  it('It should should have the correct routes', () => {
    const routes = routeWalker([], path);
    expect(routes).toEqual(
      [
        { outCoords: '2,2.5,0', pressure: 9, liquids: [COLD_WATER], source: true },
        { outCoords: '3,2.5,0' },
        [
          [
            { outCoords: '3.5,2,0' },
            { outCoords: '4,1.5,0' },
            { outCoords: '4.5,2,0' },
          ],
          [
            { outCoords: '3.5,3,0' },
            { outCoords: '4,3.5,0' },
            { outCoords: '4.5,3,0' },
          ],
        ],
        { outCoords: '5,2.5,0' },
      ]);
  });

  it('Should have a friction value of 4.5', () => {
    const { friction } = path.friction({ pressureDiff: 0, friction: 0 });
    expect(friction).toEqual(4.5);
  });

  it('Should have a flow of value of 2 total and 1 for each split', () => {
    const partsWithFlow = calculateFlows(flowParts);
    expect(partsWithFlow).toMatchObject(
      [
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
        enabled: false,
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


  it('Should have a flow of value of 3 for all parts with the pump disabled', () => {
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
          '3,2.5,0': { [COLD_WATER]: 3 },
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
          '3,2.5,0': { [COLD_WATER]: -3 },
          '2,2.5,0': { [COLD_WATER]: 3 },
        },
        settings: {
          enabled: false,
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
          '2,2.5,0': { [COLD_WATER]: -3 },
        },
      },
      ]
    );
  });

  describe('Two input tubes with different liquid joining', () => {
    it('Should have a flow of value of 9 when the pump is enabled', () => {
      // (input pressure 6 + pump pressure 12) / friction 2 = 9
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
          flows: {
            '3,2.5,0': { [COLD_WATER]: 9 },
          },
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
            '3,2.5,0': { [COLD_WATER]: -9 },
            '2,2.5,0': { [COLD_WATER]: 9 },
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
            '2,2.5,0': { [COLD_WATER]: -9 },
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
        pressure: 8,
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
        pressure: 8,
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
  // 7 transitions long, passes the bridge twice
  const parts: PersistentPart[] = [
    {
      id: '1',
      x: 11,
      y: 2,
      type: 'SystemIO',
      rotate: 0,
      settings: {
        liquids: [COLD_WATER],
        pressure: 7,
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
            pressure: 7,
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
  const parts: PersistentPart[] = [
    {
      'id': '1',
      'rotate': 0,
      'settings': { color: '#ff0000' },
      'flipped': false,
      'type': 'Kettle',
      'x': 1,
      'y': 1,
    },
    {
      'id': '2',
      'rotate': 0,
      'settings': {},
      'flipped': true,
      'type': 'DipTube',
      'x': 4,
      'y': 6,
    },
    {
      'id': '3',
      'rotate': 0,
      settings: {
        enabled: true,
        pressure: 10,
      },
      'flipped': true,
      'type': 'Pump',
      'x': 5,
      'y': 6,
    },
    {
      'id': '4',
      'rotate': 0,
      'settings': {},
      'flipped': true,
      'type': 'SystemIO',
      'x': 6,
      'y': 6,
    },
    {
      'id': '5',
      'rotate': 0,
      'settings': {},
      'flipped': true,
      'type': 'DipTube',
      'x': 4,
      'y': 5,
    },
    {
      'id': '6',
      'rotate': 0,
      'type': 'Pump',
      settings: {
        enabled: true,
        pressure: 10,
      },
      'flipped': true,
      'x': 5,
      'y': 5,
    },
    {
      'id': '7',
      'rotate': 0,
      'settings': {},
      'flipped': true,
      'type': 'SystemIO',
      'x': 6,
      'y': 5,
    },
  ];

  const flowParts = asFlowParts(parts.map(asStatePart));
  it('Should have 2 outlfow paths', () => {
    const start = flowParts[0];

    const path = findPath(flowParts, start);

    const visitedTypes = propertyWalker([], path, ['root', 'type']);
    expect(visitedTypes).toEqual(
      [
        'Kettle',
        [['DipTube',
          'Pump',
          'SystemIO'],
        ['DipTube',
          'Pump',
          'SystemIO']],
      ]);
  });
  it('Each branch should have flow 10/3', () => {
    const partsWithFlow = calculateFlows(asFlowParts(parts.map(asStatePart)));
    const straight1 = partsWithFlow.find((part) => part.id === '3');
    expect(straight1).toMatchObject(
      {
        'id': '3',
        'flows': {
          '5,6.5,0': {
            '#ff0000': -10 / 3,
          },
          '6,6.5,0': {
            '#ff0000': 10 / 3,
          },
        },
      });

    const straight2 = partsWithFlow.find((part) => part.id === '6');
    expect(straight2).toMatchObject(
      {
        'id': '6',
        'flows': {
          '5,5.5,0': {
            '#ff0000': -10 / 3,
          },
          '6,5.5,0': {
            '#ff0000': 10 / 3,
          },
        },
      });
  });
});


describe('A kettle with flow back to itself', () => {
  let parts: PersistentPart[] = [
    {
      'id': '1',
      'rotate': 0,
      'settings': { color: '#ff0000' },
      'type': 'Kettle',
      'x': 1,
      'y': 1,
    },
    {
      'id': '2',
      'rotate': 0,
      'settings': {},
      'flipped': true,
      'type': 'DipTube',
      'x': 4,
      'y': 4,
    },
    {
      'id': '3',
      'rotate': 180,
      'settings': {},
      'type': 'ElbowTube',
      'x': 5,
      'y': 4,
    },
    {
      'id': '5',
      'rotate': 270,
      'settings': {},
      'type': 'ElbowTube',
      'x': 5,
      'y': 6,
    },
    {
      'id': '6',
      'rotate': 0,
      'settings': {},
      'flipped': true,
      'type': 'DipTube',
      'x': 4,
      'y': 6,
    },
  ];


  describe('with a disabled pump', () => {
    parts = [...parts, {
      'id': '4',
      'rotate': 270,
      settings: {
        enabled: false,
      },
      'type': 'Pump',
      'x': 5,
      'y': 5,
    }];

    const flowParts = asFlowParts(parts.map(asStatePart));
    it('Should return the right path starting at the kettle', () => {
      const start = flowParts[0];

      const path = findPath(flowParts, start);

      const visitedTypes = propertyWalker([], path, ['root', 'type']);
      expect(visitedTypes).toEqual(
        [
          'Kettle',
          'DipTube',
          'ElbowTube',
          'Pump',
          'ElbowTube',
          'DipTube',
          'Kettle',
        ]);


      const { friction, pressureDiff } = path.friction({ pressureDiff: 0, friction: 0 });
      expect(friction).toEqual(5);
    });


    it('Should have zero flow with the pump disabled', () => {
      const partsWithFlow = calculateFlows(flowParts);
      const part = partsWithFlow.find((part) => part.id === '3');
      expect(part).toMatchObject(
        {
          'id': '3',
          'flows': {
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
    parts = [...parts, {
      'id': '4',
      'rotate': 270,
      settings: {
        enabled: true,
      },
      'type': 'Pump',
      'x': 5,
      'y': 5,
    }];
    const flowParts = asFlowParts(parts.map(asStatePart));
    it('Should return the right path starting at the kettle', () => {
      const start = flowParts[0];
      const path = findPath(flowParts, start);

      const visitedTypes = propertyWalker([], path, ['root', 'type']);
      expect(visitedTypes).toEqual(
        [
          'Kettle',
          'DipTube',
          'ElbowTube',
          'Pump',
          'ElbowTube',
          'DipTube',
          'Kettle',
        ]);

      const { friction, pressureDiff } = path.friction({ pressureDiff: 0, friction: 0 });
      expect(friction).toEqual(5);
    });

    it('Should have flow 2', () => {
      const partsWithFlow = calculateFlows(asFlowParts(parts.map(asStatePart)));
      const part = partsWithFlow.find((part) => part.id === '3');
      expect(part).toMatchObject(
        {
          'id': '3',
          'flows': {
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

