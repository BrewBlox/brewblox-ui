import { partSettings, partTransitions, flowPath, asFlowParts, FlowSegment, calculateFlows } from './calculateFlows';
import { PersistentPart } from './state';
import { IN_OUT, DEFAULT_FRICTION, DEFAULT_DELTA_PRESSURE, COLD_WATER, MIXED_LIQUIDS } from './getters';
import get from 'lodash/get';


type StringList = string | any[];

const propertyWalker = (acc: any[], next: FlowSegment, prop: string[]): any[] => {
  acc = [...acc, get(next, prop)];
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
    pressure: 11,
  };

  it('can resolve to transitions', () => {
    expect(partTransitions(part)).toEqual(
      {
        [IN_OUT]: [{ outCoords: '1,0.5', pressure: 11 }],
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
    },
    {

      x: 2,
      y: 2,
      rotate: 0,
      type: 'StraightTube',
    },
    {

      x: 3,
      y: 2,
      rotate: 0,
      type: 'OutputTube',
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
      pressure: 6,
    },
    {

      x: 3,
      y: 2,
      rotate: 0,
      type: 'OutputTube',
    },
    {
      x: 2,
      y: 2,
      rotate: 0,
      type: 'StraightTube',
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
        pressure: 6,
        liquid: 'water',
        flows: { '-1,-1': -2, '2,2.5': 2 },
      },
      {
        x: 3,
        y: 2,
        rotate: 0,
        type: 'OutputTube',
        liquid: 'water',
        flows: { '3,2.5': -2, '-1,-1': 2 },
      },
      {
        x: 2,
        y: 2,
        rotate: 0,
        type: 'StraightTube',
        liquid: 'water',
        flows: { '2,2.5': -2, '3,2.5': 2 },
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
      pressure: 14,
    },
    {
      x: 2,
      y: 2,
      rotate: 0,
      type: 'StraightTube',
    },
    {
      x: 3,
      y: 2,
      rotate: 270,
      type: 'TeeTube',
    },
    {
      x: 3,
      y: 1,
      rotate: 270,
      type: 'OutputTube',
    },
    {
      x: 3,
      y: 3,
      rotate: 90,
      type: 'OutputTube',
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
          [IN_OUT]: [{ outCoords: "2,2.5", pressure: 14 }],
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
              "3.5,2": [{ outCoords: IN_OUT, pressure: 0 }],
            },
          ],
          [
            {
              "3.5,3": [{ outCoords: IN_OUT, pressure: 0 }],
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
            "-1,-1": -4,
            "2,2.5": 4,
          },
          type: "InputTube",
        },
        {
          flows: {
            "2,2.5": -4,
            "3,2.5": 4,
          },
          type: "StraightTube",
        },
        {
          flows: {
            "3,2.5": -4,
            "3.5,2": 2,
            "3.5,3": 2,
          },
          type: "TeeTube",
        },
        {
          flows: {
            "-1,-1": 2,
            "3.5,2": -2,
          },
          type: "OutputTube",
          x: 3,
          y: 1,
        },
        {
          flows: {
            "-1,-1": 2,
            "3.5,3": -2,
          },
          type: "OutputTube",
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
      pressure: 11,
    },
    {
      x: 2,
      y: 2,
      rotate: 0,
      type: 'StraightTube',
    },
    {
      x: 3,
      y: 2,
      rotate: 270,
      type: 'TeeTube',
    },
    {
      x: 3,
      y: 1,
      rotate: 90,
      type: 'ElbowTube',
    },
    {
      x: 3,
      y: 3,
      rotate: 0,
      type: 'ElbowTube',
    },
    {
      x: 4,
      y: 1,
      rotate: 180,
      type: 'ElbowTube',
    },
    {
      x: 4,
      y: 3,
      rotate: 270,
      type: 'ElbowTube',
    },
    {
      x: 4,
      y: 2,
      rotate: 90,
      type: 'TeeTube',
    },
    {
      x: 5,
      y: 2,
      rotate: 0,
      type: 'OutputTube',
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
        { [IN_OUT]: [{ outCoords: "2,2.5", pressure: 11 }] },
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
        { "5,2.5": [{ outCoords: IN_OUT, pressure: 0 }] },
      ]);
  });

  it('Should have a friction value of 6', () => {
    expect(path.friction()).toEqual(5.5);
  });

  it('Should have a flow of value of 4 total and 2 for each split', () => {
    const partsWithFlow = calculateFlows(flowParts);
    expect(partsWithFlow).toMatchObject(
      [
        {
          flows: {
            "-1,-1": -2,
            "2,2.5": 2,
          },
          type: "InputTube",
        },
        {
          flows: {
            "2,2.5": -2,
            "3,2.5": 2,
          },
          type: "StraightTube",
        },
        {
          flows: {
            "3,2.5": -2,
            "3.5,2": 1,
            "3.5,3": 1,
          },
          type: "TeeTube",

        },
        {
          flows: {
            "3.5,2": -1,
            "4,1.5": 1,
          },
          type: "ElbowTube",
        },
        {
          flows: {
            "3.5,3": -1,
            "4,3.5": 1,
          },
          type: "ElbowTube",
        },
        {
          flows: {
            "4,1.5": -1,
            "4.5,2": 1,
          },
          type: "ElbowTube",
        },
        {
          flows: {
            "4,3.5": -1,
            "4.5,3": 1,
          },
          type: "ElbowTube",
        },
        {
          flows: {
            "4.5,2": -1,
            "4.5,3": -1,
            "5,2.5": 2,
          },
          type: "TeeTube",
        },
        {
          flows: {
            "-1,-1": 2,
            "5,2.5": -2,
          },
          type: "OutputTube",
        },
      ]
    );
  });
});

