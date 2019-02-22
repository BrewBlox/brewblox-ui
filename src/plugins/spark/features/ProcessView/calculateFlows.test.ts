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
  const createInput = (): PersistentPart => ({
    x: 1,
    y: 2,
    rotate: 0,
    type: 'InputTube',
  });

  it('Should return part settings', () => {
    expect(partSettings(createInput()).isSource).toBeTruthy();
  });
});


describe('Data describing an input tube', () => {
  const createInput = (): PersistentPart => ({
    x: 1,
    y: 2,
    rotate: 0,
    type: 'InputTube',
  });

  it('can resolve to transitions', () => {
    expect(partTransitions(createInput())).toEqual(
      {
        '0.5,0.5': [{ outCoords: '1,0.5' }],
      });
  });
});


describe('asFlowParts', () => {
  const createPath = (): PersistentPart[] => ([
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
  ]);

  it('it adds transitions', () => {
    asFlowParts(createPath()).forEach(part => {
      expect(part).toHaveProperty('transitions');
    });
  });
});


describe('A single path without splits', () => {
  const createParts = (): PersistentPart[] => ([
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
  ]);

  it('Should have no splits', () => {
    const parts = asFlowParts(createParts());
    const start = parts[0];

    const path = flowPath(parts, start, '1.5,2.5');
    if (path === null) {
      throw ('no path found');
    }
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
});


describe('A path with a split, but no joins', () => {
  const createParts = (): PersistentPart[] => ([
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
  ]);

  it('Should return a forking path', () => {
    const parts = asFlowParts(createParts());
    const start = parts[0];

    const path = flowPath(parts, start, '1.5,2.5');
    if (path === null) {
      throw ('no path found');
    }

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

    const visitedInCoords = propertyWalker([], path, ['inCoords']);
    expect(visitedInCoords).toEqual(
      [
        ['1.5,2.5'],
        ['2,2.5'],
        ['3,2.5'],
        [
          [
            ['3.5,2'],
          ]
          , [
            ['3.5,3'],
          ],
        ],
      ]);
  });
});


describe('A path that forks and rejoins', () => {
  const createParts = (): PersistentPart[] => ([
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
  ]);

  it('Should return a forking and rejoining path', () => {
    const parts = asFlowParts(createParts());
    const start = parts[0];

    const path = flowPath(parts, start, '1.5,2.5');
    if (path === null) {
      throw ('no path found');
    }
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

    const visitedInCoords = propertyWalker([], path, ['inCoords']);
    expect(visitedInCoords).toEqual(
      [
        ['1.5,2.5'],
        ['2,2.5'],
        ['3,2.5'],
        [
          [
            ['3.5,2'],
            ['4,1.5'],
          ],
          [
            ['3.5,3'],
            ['4,3.5'],
          ],
        ],
        ['4.5,2', '4.5,3'],
        ['5,2.5'],
      ]);
  });
});

