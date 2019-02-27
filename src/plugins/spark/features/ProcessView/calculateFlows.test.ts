import {
  partTransitions,
  flowPath,
  asFlowParts,
  FlowSegment,
  calculateFlows,
} from './calculateFlows';
import { PersistentPart } from './state';
import { IN_OUT, COLD_WATER, HOT_WATER } from './getters';
import get from 'lodash/get';
import set from 'lodash/set';


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
    x: 1,
    y: 2,
    rotate: 0,
    type: 'InputTube',
    settings: {
      pressure: 11,
      liquids: [COLD_WATER],
    },
  };

  it('can resolve to transitions', () => {
    expect(partTransitions(part)).toEqual(
      {
        [IN_OUT]: [{ outCoords: '1,0.5', pressure: 11, liquids: [COLD_WATER] }],
        '1,0.5': [{ outCoords: IN_OUT }],
      });
  });
});


describe('asFlowParts', () => {
  const path: PersistentPart[] = [
    {

      x: 1,
      y: 2,
      rotate: 0,
      type: 'InputTube',
      settings: {
        liquids: [COLD_WATER],
      },
    },
    {
      x: 2,
      y: 2,
      rotate: 0,
      type: 'StraightTube',
      settings: {},
    },
    {

      x: 3,
      y: 2,
      rotate: 0,
      type: 'OutputTube',
      settings: {},
    },
  ];

  it('it adds transitions', () => {
    asFlowParts(path).forEach(part => {
      expect(part).toHaveProperty('transitions');
    });
  });
});


describe('A single path without splits', () => {
  const parts: PersistentPart[] = [
    {
      x: 1,
      y: 2,
      rotate: 0,
      type: 'InputTube',
      settings: {
        pressure: 6,
        liquids: [HOT_WATER],
      },
    },
    {

      x: 3,
      y: 2,
      rotate: 0,
      type: 'OutputTube',
      settings: {},
    },
    {
      x: 2,
      y: 2,
      rotate: 0,
      type: 'StraightTube',
      settings: {},
    },
  ];

  const flowParts = asFlowParts(parts);
  const start = flowParts[0];

  const path = flowPath(flowParts, start, IN_OUT);
  if (path === null) {
    throw ('no path found');
  }

  it('Should have no splits', () => {
    let walker: FlowSegment = path;
    let pathTypes: string[] = ['InputTube'];
    while (true) {
      if (walker.next === null) {
        break; // end of path
      }
      expect(walker.splits).toHaveLength(0);
      pathTypes.push(walker.next.root.type);
      walker = walker.next;
    }
    expect(pathTypes).toEqual(['InputTube', 'StraightTube', 'OutputTube']);
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
        type: 'InputTube',
        flows: {
          '-1,-1': {
            [HOT_WATER]: -2,
          },
          '2,2.5': {
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
        rotate: 0,
        type: 'OutputTube',
        flows: {
          '3,2.5': {
            [HOT_WATER]: -2,
          },
          '-1,-1': {
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
          '2,2.5': {
            [HOT_WATER]: - 2,
          }
          , '3,2.5': {
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

      x: 1,
      y: 2,
      rotate: 0,
      type: 'InputTube',
      settings: {
        pressure: 14,
        liquids: [COLD_WATER],
      },
    },
    {
      x: 2,
      y: 2,
      rotate: 0,
      type: 'StraightTube',
      settings: {},
    },
    {
      x: 3,
      y: 2,
      rotate: 270,
      type: 'TeeTube',
      settings: {},
    },
    {
      x: 3,
      y: 1,
      rotate: 270,
      type: 'OutputTube',
      settings: {},
    },
    {
      x: 3,
      y: 3,
      rotate: 90,
      type: 'OutputTube',
      settings: {},
    },
  ];

  const flowParts = asFlowParts(parts);
  const start = flowParts[0];

  const path = flowPath(flowParts, start, IN_OUT);
  if (path === null) {
    throw ('no path found');
  }

  it('Should return a forking path', () => {

    const visitedTypes = propertyWalker([], path, ['root', 'type']);
    expect(visitedTypes).toEqual(
      [
        'InputTube',
        'StraightTube',
        'TeeTube',
        [
          [
            'OutputTube',
          ],
          [
            'OutputTube',
          ],
        ],
      ]);

    const transitions = propertyWalker([], path, ['transitions']);
    expect(transitions).toEqual(
      [
        {
          [IN_OUT]: [{ outCoords: "2,2.5", pressure: 14, liquids: [COLD_WATER] }],
        },
        {
          "2,2.5": [{ outCoords: "3,2.5" }],
        },
        {
          "3,2.5": [{ outCoords: "3.5,2" }, { outCoords: "3.5,3" }],
        },
        [
          [
            {
              "3.5,2": [{ outCoords: IN_OUT }],
            },
          ],
          [
            {
              "3.5,3": [{ outCoords: IN_OUT }],
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
            "-1,-1": {
              [COLD_WATER]: -4,
            },
            "2,2.5": {
              [COLD_WATER]: 4,
            },
          },
          type: 'InputTube',
        },
        {
          flows: {
            "2,2.5": {
              [COLD_WATER]: -4,
            },
            "3,2.5": {
              [COLD_WATER]: 4,
            },
          },
          type: 'StraightTube',
        },
        {
          flows: {
            "3,2.5": {
              [COLD_WATER]: -4,
            },
            "3.5,2": {
              [COLD_WATER]: 2,
            },
            "3.5,3": {
              [COLD_WATER]: 2,
            },
          },
          type: 'TeeTube',
        },
        {
          flows: {
            "-1,-1": {
              [COLD_WATER]: 2,
            },
            "3.5,2": {
              [COLD_WATER]: -2,
            },
          },
          type: 'OutputTube',
          x: 3,
          y: 1,
        },
        {
          flows: {
            "-1,-1": {
              [COLD_WATER]: 2,
            },
            "3.5,3": {
              [COLD_WATER]: -2,
            },
          },
          type: 'OutputTube',
        },
      ]
    );
  });
});

describe('A path that forks and rejoins', () => {
  const parts: PersistentPart[] = [
    {
      x: 1,
      y: 2,
      rotate: 0,
      type: 'InputTube',
      settings: {
        pressure: 11,
        liquids: [COLD_WATER],
      },
    },
    {
      x: 2,
      y: 2,
      rotate: 0,
      type: 'StraightTube',
      settings: {},
    },
    {
      x: 3,
      y: 2,
      rotate: 270,
      type: 'TeeTube',
      settings: {},
    },
    {
      x: 3,
      y: 1,
      rotate: 90,
      type: 'ElbowTube',
      settings: {},
    },
    {
      x: 3,
      y: 3,
      rotate: 0,
      type: 'ElbowTube',
      settings: {},
    },
    {
      x: 4,
      y: 1,
      rotate: 180,
      type: 'ElbowTube',
      settings: {},
    },
    {
      x: 4,
      y: 3,
      rotate: 270,
      type: 'ElbowTube',
      settings: {},
    },
    {
      x: 4,
      y: 2,
      rotate: 90,
      type: 'TeeTube',
      settings: {},
    },
    {
      x: 5,
      y: 2,
      rotate: 0,
      type: 'OutputTube',
      settings: {},
    },
  ];

  const flowParts = asFlowParts(parts);
  const start = flowParts[0];

  const path = flowPath(flowParts, start, IN_OUT);
  if (path === null) {
    throw ('no path found');
  }

  it('Should return a forking and rejoining path', () => {

    const visitedTypes = propertyWalker([], path, ['root', 'type']);

    expect(visitedTypes).toEqual(
      [
        'InputTube',
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
        'OutputTube',
      ]);

    const transitions = propertyWalker([], path, ['transitions']);
    expect(transitions).toEqual(
      [
        { [IN_OUT]: [{ outCoords: "2,2.5", pressure: 11, liquids: [COLD_WATER] }] },
        { "2,2.5": [{ outCoords: "3,2.5" }] },
        { "3,2.5": [{ outCoords: "3.5,2" }, { outCoords: "3.5,3" }] },
        [
          [
            { "3.5,2": [{ outCoords: "4,1.5" }] },
            { "4,1.5": [{ outCoords: "4.5,2" }] },
            { "4.5,2": [{ outCoords: "5,2.5" }] },
          ],
          [
            { "3.5,3": [{ outCoords: "4,3.5" }] },
            { "4,3.5": [{ outCoords: "4.5,3" }] },
            { "4.5,3": [{ outCoords: "5,2.5" }] },
          ],
        ],
        { "5,2.5": [{ outCoords: IN_OUT }] },
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
            "-1,-1": { [COLD_WATER]: -2 },
            "2,2.5": { [COLD_WATER]: 2 },
          },
          type: 'InputTube',
        },
        {
          flows: {
            "2,2.5": { [COLD_WATER]: -2 },
            "3,2.5": { [COLD_WATER]: 2 },
          },
          type: 'StraightTube',
        },
        {
          flows: {
            "3,2.5": { [COLD_WATER]: -2 },
            "3.5,2": { [COLD_WATER]: 1 },
            "3.5,3": { [COLD_WATER]: 1 },
          },
          type: 'TeeTube',

        },
        {
          flows: {
            "3.5,2": { [COLD_WATER]: -1 },
            "4,1.5": { [COLD_WATER]: 1 },
          },
          type: 'ElbowTube',
        },
        {
          flows: {
            "3.5,3": { [COLD_WATER]: -1 },
            "4,3.5": { [COLD_WATER]: 1 },
          },
          type: 'ElbowTube',
        },
        {
          flows: {
            "4,1.5": { [COLD_WATER]: -1 },
            "4.5,2": { [COLD_WATER]: 1 },
          },
          type: 'ElbowTube',
        },
        {
          flows: {
            "4,3.5": { [COLD_WATER]: -1 },
            "4.5,3": { [COLD_WATER]: 1 },
          },
          type: 'ElbowTube',
        },
        {
          flows: {
            "4.5,2": { [COLD_WATER]: -1 },
            "4.5,3": { [COLD_WATER]: -1 },
            "5,2.5": { [COLD_WATER]: 2 },
          },
          type: 'TeeTube',
        },
        {
          flows: {
            "-1,-1": { [COLD_WATER]: 2 },
            "5,2.5": { [COLD_WATER]: -2 },
          },
          type: 'OutputTube',
        },
      ]
    );
  });
});

describe('A single path with a pump', () => {
  const parts: PersistentPart[] = [
    {
      x: 3,
      y: 2,
      rotate: 180,
      type: 'InputTube',
      settings: {
        pressure: 6,
        liquids: [COLD_WATER],
      },
    },
    {
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
      x: 1,
      y: 2,
      rotate: 180,
      type: 'OutputTube',
      settings: {},
    },
  ];


  it('Should have a flow of value of 2 for all parts with the pump disabled', () => {
    const flowParts = asFlowParts(parts);
    const partsWithFlow = calculateFlows(flowParts);
    expect(partsWithFlow).toMatchObject(
      [{
        x: 3,
        y: 2,
        rotate: 180,
        type: 'InputTube',
        flows: {
          '-1,-1': { [COLD_WATER]: -2 },
          '3,2.5': { [COLD_WATER]: 2 },
        },
        settings: {
          pressure: 6,
          liquids: [COLD_WATER],
        },
      },
      {
        x: 2,
        y: 2,
        rotate: 0,
        type: 'Pump',
        flows: {
          '3,2.5': { [COLD_WATER]: -2 },
          '2,2.5': { [COLD_WATER]: 2 },
        },
        settings: {
          disabled: true,
          pressure: 12,
        },
      },
      {
        x: 1,
        y: 2,
        rotate: 180,
        type: 'OutputTube',
        flows: {
          '2,2.5': { [COLD_WATER]: -2 },
          '-1,-1': { [COLD_WATER]: 2 },
        },
      },
      ]
    );
  });

  describe('Two input tubes with different liquid joining', () => {
    it('Should have a flow of value of (input pressure 6 + pump pressure 12) / friction 3 = 6 when the pump is enabled', () => {
      set(parts[1], ['settings', 'disabled'], false);
      const flowParts = asFlowParts(parts);
      const partsWithFlow = calculateFlows(flowParts);
      expect(partsWithFlow).toMatchObject(
        [{
          x: 3,
          y: 2,
          rotate: 180,
          type: 'InputTube',
          flows: {}, /*{
            '-1,-1': { [COLD_WATER]: -6 },
            '3,2.5': { [COLD_WATER]: 6 },
          },*/
          settings: {
            pressure: 6,
          },
        },
        {
          x: 2,
          y: 2,
          rotate: 0,
          type: 'Pump',
          flows: {
            '3,2.5': { [COLD_WATER]: -6 },
            '2,2.5': { [COLD_WATER]: 6 },
          },
          settings: {
            disabled: false,
            pressure: 12,
          },
        },
        {
          x: 1,
          y: 2,
          rotate: 180,
          type: 'OutputTube',
          flows: {
            '2,2.5': { [COLD_WATER]: -6 },
            '-1,-1': { [COLD_WATER]: 6 },
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
      x: 1,
      y: 1,
      rotate: 0,
      type: 'InputTube',
      settings: {
        pressure: 11,
        liquids: [COLD_WATER],
      },
    },
    {
      x: 1,
      y: 3,
      rotate: 0,
      type: 'InputTube',
      settings: {
        pressure: 11,
        liquids: [HOT_WATER],
      },
    },
    {
      x: 2,
      y: 1,
      rotate: 180,
      type: 'ElbowTube',
      settings: {},
    },
    {
      x: 2,
      y: 3,
      rotate: 270,
      type: 'ElbowTube',
      settings: {},
    },
    {
      x: 2,
      y: 2,
      rotate: 90,
      type: 'TeeTube',
      settings: {},
    },
    {
      x: 3,
      y: 2,
      rotate: 0,
      type: 'OutputTube',
      settings: {},
    },
  ];

  it('Should have the correct flow and liquids in all paths', () => {
    const partsWithFlow = calculateFlows(asFlowParts(parts));
    expect(partsWithFlow).toMatchObject(
      [
        {
          'flows': {
            "-1,-1": {
              [COLD_WATER]: -2,
            },
            "2,1.5": {
              [COLD_WATER]: 2,
            },
          },
          'type': 'InputTube',
          'x': 1,
          'y': 1,
        },
        {
          'flows': {
            "-1,-1": {
              [HOT_WATER]: -2,
            },
            "2,3.5": {
              [HOT_WATER]: 2,
            },
          },
          'type': 'InputTube',
          'x': 1,
          'y': 3,
        },
        {
          flows: {
            "2,1.5": {
              [COLD_WATER]: -2,
            },
            "2.5,2": {
              [COLD_WATER]: 2,
            },
          },
          'type': 'ElbowTube',
          'x': 2,
          'y': 1,
        },
        {
          'flows': {
            "2,3.5": {
              [HOT_WATER]: -2,
            },
            "2.5,3": {
              [HOT_WATER]: 2,
            },
          },
          'type': 'ElbowTube',
          'x': 2,
          'y': 3,
        },
        {
          'flows': {
            "2.5,2": {
              [COLD_WATER]: -2,
            },
            "2.5,3": {
              [HOT_WATER]: -2,
            },
            "3,2.5": {
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
            "-1,-1": {
              [COLD_WATER]: 2,
              [HOT_WATER]: 2,
            },
            "3,2.5": {
              [COLD_WATER]: -2,
              [HOT_WATER]: -2,
            },
          },
          'type': 'OutputTube',
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
      x: 11,
      y: 2,
      type: "InputTube",
      rotate: 0,
      settings: {
        liquids: [COLD_WATER],
        pressure: 8,
      },
    },
    {
      x: 12,
      y: 2,
      type: "StraightTube",
      rotate: 0,
      settings: {},
    },
    {
      type: "BridgeTube",
      x: 13,
      y: 2,
      rotate: 0,
      settings: {},
    },
    {
      type: "OutputTube",
      x: 13,
      y: 1,
      rotate: 270,
      settings: {},
    },
    {
      x: 14,
      y: 2,
      type: "ElbowTube",
      rotate: 180,
      settings: {},
    },
    {
      type: "ElbowTube",
      x: 14,
      y: 3,
      rotate: 270,
      settings: {},
    },
    {
      x: 13,
      y: 3,
      type: "ElbowTube",
      rotate: 0,
      settings: {},
    },
  ];

  it('Should have the correct flow and liquids in all paths', () => {
    const partsWithFlow = calculateFlows(asFlowParts(parts));
    console.log(JSON.stringify(partsWithFlow));
    expect(partsWithFlow).toMatchObject(
      [
        {
          x: 11,
          y: 2,
          type: "InputTube",
          rotate: 0,
          settings: {
            liquids: [COLD_WATER],
            pressure: 8,
          },
          flows: {
            "-1,-1": {
              [COLD_WATER]: -1,
            },
            "12,2.5": {
              [COLD_WATER]: 1,
            },
          },
        },
        {
          x: 12,
          y: 2,
          type: "StraightTube",
          rotate: 0,
          settings: {},
          flows: {
            "12,2.5": {
              [COLD_WATER]: -1,
            },
            "13,2.5": {
              [COLD_WATER]: 1,
            },
          },
        },
        {
          type: "BridgeTube",
          x: 13,
          y: 2,
          rotate: 0,
          settings: {},
          flows: {
            "13.5,3": {
              [COLD_WATER]: -1,
            },
            "13.5,2": {
              [COLD_WATER]: 1,
            },
            "14,2.5": {
              [COLD_WATER]: 1,
            },
            "13,2.5": {
              [COLD_WATER]: -1,
            },
          },
        },
        {
          type: "OutputTube",
          x: 13,
          y: 1,
          rotate: 270,
          settings: {},
          flows: {
            "13.5,2": {
              [COLD_WATER]: -1,
            },
            "-1,-1": {
              [COLD_WATER]: 1,
            },
          },
        },
        {
          x: 14,
          y: 2,
          type: "ElbowTube",
          rotate: 180,
          settings: {},
          flows: {
            "14,2.5": {
              [COLD_WATER]: -1,
            },
            "14.5,3": {
              [COLD_WATER]: 1,
            },
          },
        },
        {
          type: "ElbowTube",
          x: 14,
          y: 3,
          rotate: 270,
          settings: {},
          flows: {
            "14.5,3": {
              [COLD_WATER]: -1,
            },
            "14,3.5": {
              [COLD_WATER]: 1,
            },
          },
        },
        {
          x: 13,
          y: 3,
          type: "ElbowTube",
          rotate: 0,
          settings: {},
          flows: {
            "14,3.5": {
              [COLD_WATER]: -1,
            },
            "13.5,3": {
              [COLD_WATER]: 1,
            },
          },
        },
      ]);
  });
});
