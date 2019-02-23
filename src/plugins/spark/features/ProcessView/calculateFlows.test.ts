import { partSettings, partTransitions, flowPath, asFlowParts, FlowSegment } from './calculateFlows';
import { PersistentPart } from './state';
import { CENTER, DEFAULT_FRICTION, DEFAULT_DELTA_PRESSURE, COLD_WATER, MIXED_LIQUIDS } from './getters';
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


describe('calculate Flows', () => {
  const part: PersistentPart = {
    x: 1,
    y: 2,
    rotate: 0,
    type: 'InputTube',
  };

  it('Should return part settings', () => {
    expect(partSettings(part).isSource).toBeTruthy();
  });
});


describe('Data describing an input tube', () => {
  const part: PersistentPart = {
    x: 1,
    y: 2,
    rotate: 0,
    type: 'InputTube',
  };

  it('can resolve to transitions', () => {
    expect(partTransitions(part)).toEqual(
      {
        '0.5,0.5': [{ outCoords: '1,0.5' }],
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

  const path = flowPath(flowParts, start, '1.5,2.5');
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
});


describe('A path with a split, but no joins', () => {
  const parts: PersistentPart[] = [
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

  const path = flowPath(flowParts, start, '1.5,2.5');
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
    console.log(JSON.stringify(transitions));
    expect(transitions).toEqual(
      [
        {
          "1.5,2.5": [{ "outCoords": "2,2.5" }],
        },
        {
          "2,2.5": [{ "outCoords": "3,2.5" }],
        },
        {
          "3,2.5": [{ "outCoords": "3.5,2" }, { "outCoords": "3.5,3" }],
        },
        [
          [
            {
              "3.5,2": [{ "outCoords": "3.5,1.5", "pressure": 0 }],
            },
          ],
          [
            {
              "3.5,3": [{ "outCoords": "3.5,3.5", "pressure": 0 }],
            },
          ],
        ],
      ]);
  });

  it('Should have a friction value of 3.5', () => {
    expect(path.friction()).toEqual(3.5);
  });
});


describe('A path that forks and rejoins', () => {
  const parts: PersistentPart[] = [
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

  const path = flowPath(flowParts, start, '1.5,2.5');
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
          ],
          [
            'ElbowTube',
            'ElbowTube',
          ],
        ],
        'TeeTube',
        'OutputTube',
      ]);

    const transitions = propertyWalker([], path, ['transitions']);
    expect(transitions).toEqual(
      [
        { "1.5,2.5": [{ "outCoords": "2,2.5" }] },
        { "2,2.5": [{ "outCoords": "3,2.5" }] },
        { "3,2.5": [{ "outCoords": "3.5,2" }, { "outCoords": "3.5,3" }] },
        [
          [
            { "3.5,2": [{ "outCoords": "4,1.5" }] },
            { "4,1.5": [{ "outCoords": "4.5,2" }] },
          ],
          [
            { "3.5,3": [{ "outCoords": "4,3.5" }] },
            { "4,3.5": [{ "outCoords": "4.5,3" }] },
          ],
        ],
        {
          "4.5,2": [{ "outCoords": "5,2.5" }],
          "4.5,3": [{ "outCoords": "5,2.5" }],
        },
        { "5,2.5": [{ "outCoords": "5.5,2.5", "pressure": 0 }] },
      ]);
  });

  it('Should have a friction value of 6', () => {
    expect(path.friction()).toEqual(6);
  });
});

