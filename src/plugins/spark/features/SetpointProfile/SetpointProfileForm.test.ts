import { Wrapper, shallowMount } from '@vue/test-utils';
import { setupSpark } from 'tests/setup';
import Vue from 'vue';

import { Unit } from '@/helpers/units';
import { SetpointSensorPairLink } from '@/helpers/units/KnownLinks';
import { deepCopy } from '@/helpers/units/parseObject';
import { BlockCrud } from '@/plugins/spark/components/BlockCrudComponent';
import { SetpointProfileBlock } from '@/plugins/spark/features/SetpointProfile/types';

import SetpointProfileForm from './SetpointProfileForm.vue';

interface ProfileCrud extends BlockCrud {
  block: SetpointProfileBlock;
  saveWidget: jest.Mock;
  saveBlock: jest.Mock;
}

const crudMock = (): ProfileCrud => ({
  widget: {
    id: '12345',
    title: 'test profile',
    feature: 'SetpointProfile',
    cols: 5,
    rows: 5,
    order: 0,
    dashboard: 'test-dash',
    config: {
      serviceId: 'test-service',
      blockId: 'test-block',
    },
  },
  isStoreWidget: false,
  saveWidget: jest.fn(),
  closeDialog: () => { },
  block: {
    id: 'test-block',
    serviceId: 'test-service',
    type: 'SetpointProfile',
    groups: [0],
    data: {
      enabled: true,
      targetId: new SetpointSensorPairLink('pair'),
      drivenTargetId: new SetpointSensorPairLink('pair', true),
      start: 1564578548,
      points: [{
        time: 0,
        temperature: new Unit(15, 'degC'),
      },
      {
        time: 1000,
        temperature: new Unit(20, 'degC'),
      },
      ],
    },
  },
  isStoreBlock: false,
  saveBlock: jest.fn(),
});

beforeAll(() => {
  setupSpark(Vue);
});

describe('SetpointProfileForm.vue', () => {
  let crud: ProfileCrud;
  let block: SetpointProfileBlock;
  let wrapper: Wrapper<any>;

  beforeEach(() => {
    crud = crudMock();
    block = crud.block;
    wrapper = shallowMount(SetpointProfileForm, {
      propsData: { crud },
    });
  });

  test('can update points', () => {
    const local = crudMock().block;
    const startSec = crud.block.data.start;

    expect(wrapper.vm.start).toEqual(startSec * 1000);
    expect(wrapper.vm.points).toEqual([
      {
        offsetMs: 0,
        absTimeMs: startSec * 1000,
        temperature: new Unit(15, 'degC'),
      },
      {
        offsetMs: 1000 * 1000,
        absTimeMs: (startSec * 1000) + (1000 * 1000),
        temperature: new Unit(20, 'degC'),
      },
    ]);

    const sync = () => {
      const { calls } = crud.saveBlock.mock;
      block = calls[calls.length - 1][0];
      crud = { ...crud, block };
      wrapper.setProps({ crud });
    };

    // Add point
    wrapper.vm.addPoint();
    local.data.points.push(deepCopy(local.data.points[1]));

    sync();
    expect(block).toEqual(local);

    // Remove point
    wrapper.vm.removePoint(0);
    local.data.points.splice(0, 1);

    sync();
    expect(block).toEqual(local);
  });
});
