import { partSettings, partTransitions, flowPath, asFlowParts, FlowSegment } from './calculateFlows';
import { PersistentPart } from './state';
import { CENTER, DEFAULT_FRICTION, DEFAULT_DELTA_PRESSURE, COLD_WATER, MIXED_LIQUIDS } from './getters';


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
        "0.5,0.5": [{ outCoords: "1,0.5" }],
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

  it('Should have a only one child at each node', () => {
    const parts = asFlowParts(createParts());
    const start = parts[0];

    const path = flowPath(parts, start, "1.5,2.5");
    let walker: FlowSegment = path;
    let pathTypes: string[] = ['InputTube'];
    while (true) {
      if (walker.children.length === 0) {
        break; // end of path
      }
      expect(walker.children).toHaveLength(1);
      pathTypes.push(walker.children[0].root[0].type);
      walker = walker.children[0];
    }
    expect(pathTypes).toEqual(['InputTube', 'StraightTube', 'OutputTube']);
  });
});


describe('A path with a split', () => {
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

  it('Should return a nested path', () => {
    const parts = asFlowParts(createParts());
    const start = parts[0];

    const path = flowPath(parts, start, "1.5,2.5");

    type TypeList = string | any[];

    const walkTypes = (acc: any[], next: FlowSegment): any[] => {
      acc = [...acc, next.root[0].type];
      if (next.children.length === 0) {
        return acc; // end of path
      }
      if (next.children.length === 1) {
        return [...acc, ...walkTypes([], next.children[0])];  // no split
      }
      let subtree: TypeList[] = [];
      next.children.forEach((child) => {
        subtree = [...subtree, ...walkTypes([], child)]; // split
      });
      console.log(subtree);
      return [...acc, subtree];
    };

    const visitedTypes = walkTypes([], path);
    expect(visitedTypes).toEqual(
      [
        'InputTube',
        'StraightTube',
        'TeeTube',
        [
          'OutputTube',
          'OutputTube',
        ],
      ]);
  });
});
