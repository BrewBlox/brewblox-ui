import { createLocalVue } from '@vue/test-utils';
import { pathsFromSources, component } from './calculateFlows';
import Vue from 'vue';

const createParts = () =>
  ([
    { 'type': 'InputTube', 'x': 4, 'y': 3, 'rotate': 0 },
    { 'type': 'StraightTube', 'x': 5, 'y': 3, 'rotate': 0 },
    { 'type': 'OutputTube', 'x': 6, 'y': 3, 'rotate': 0 },
  ]);

describe('calculateFlows', () => {

  const localVue = createLocalVue();

  it('Should calculate flow through parts', () => {
    // const flowParts = pathsFromSources(createParts());
    // console.log(flowParts);
    // expect(flowParts[1].flow).toBeGreaterThan(0);
  });
});
