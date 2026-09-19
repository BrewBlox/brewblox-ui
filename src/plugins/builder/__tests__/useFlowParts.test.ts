import { mount, VueWrapper } from '@vue/test-utils';
import {
  ActuatorPwmBlock,
  BlockType,
  DigitalActuatorBlock,
  DigitalState,
  SetpointSensorPairBlock,
} from 'brewblox-proto/ts';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, defineComponent, h, nextTick } from 'vue';
import blueprints from '@/plugins/builder/blueprints';
import { useFlowParts } from '@/plugins/builder/composables';
import {
  COLD_WATER,
  COLOR_KEY,
  IO_ENABLED_KEY,
  IO_PRESSURE_KEY,
  PUMP_KEY,
  VALVE_KEY,
} from '@/plugins/builder/const';
import { SPLIT_MERGE_WARNING } from '@/plugins/builder/FlowSegment';
import { useBuilderStore } from '@/plugins/builder/store';
import { BuilderLayout, BuilderPart } from '@/plugins/builder/types';
import { useSparkStore } from '@/plugins/spark/store';
import { notify } from '@/utils/notify';

const mocks = vi.hoisted(() => ({
  onLayoutChanged: (() => {}) as (layout: unknown) => void,
}));

vi.mock('@/plugins/builder/store/api', () => ({
  default: {
    fetch: async () => [],
    persist: async (v: unknown) => v,
    persistMult: async () => {},
    create: async (v: unknown) => v,
    remove: async () => {},
    subscribe: (onChanged: (layout: unknown) => void) => {
      mocks.onLayoutChanged = onChanged;
    },
  },
}));

vi.mock('@/utils/notify', async (orig) => {
  const actual = await orig<typeof import('@/utils/notify')>();
  return {
    ...actual,
    notify: {
      ...actual.notify,
      warn: vi.fn(),
      error: vi.fn(),
    },
  };
});

const serviceId = 'spark-one';

const makePart = (
  id: string,
  type: BuilderPart['type'],
  x: number,
  y: number,
  rotate = 0,
  settings: Mapped<any> = {},
): BuilderPart => ({ id, type, x, y, rotate, settings, width: 1, height: 1 });

const makeLayout = (id: string, parts: BuilderPart[]): BuilderLayout => ({
  id,
  title: id,
  width: 10,
  height: 10,
  parts,
});

const valveBlock = (state: DigitalState): DigitalActuatorBlock =>
  ({
    id: 'valve-1',
    serviceId,
    type: BlockType.DigitalActuator,
    data: { state, desiredState: state },
  }) as DigitalActuatorBlock;

const pwmBlock = (
  enabled: boolean,
  setting: number,
  value: number,
): ActuatorPwmBlock =>
  ({
    id: 'pump-1',
    serviceId,
    type: BlockType.ActuatorPwm,
    data: { enabled, setting, value, desiredSetting: setting },
  }) as ActuatorPwmBlock;

const setpointBlock = (value: number): SetpointSensorPairBlock =>
  ({
    id: 'setpoint-1',
    serviceId,
    type: BlockType.SetpointSensorPair,
    data: { value },
  }) as unknown as SetpointSensorPairBlock;

// src -> tube -> valve (linked) -> tube -> sink
const valveLayout = (): BuilderLayout =>
  makeLayout('valve-layout', [
    makePart('src', 'SystemIO', 1, 2, 0, {
      [IO_ENABLED_KEY]: true,
      [IO_PRESSURE_KEY]: 12,
      [COLOR_KEY]: COLD_WATER,
    }),
    makePart('tube1', 'StraightTube', 2, 2),
    makePart('valve', 'Valve', 3, 2, 0, {
      [VALVE_KEY]: {
        id: 'valve-1',
        serviceId,
        type: BlockType.DigitalActuator,
      },
    }),
    makePart('tube2', 'StraightTube', 4, 2),
    makePart('sink', 'SystemIO', 5, 2, 180),
  ]);

// src (no pressure) -> pump (linked PWM) -> sink
const pumpLayout = (): BuilderLayout =>
  makeLayout('pump-layout', [
    makePart('src', 'SystemIO', 1, 2, 0, {
      [IO_ENABLED_KEY]: true,
      [IO_PRESSURE_KEY]: 0,
      [COLOR_KEY]: COLD_WATER,
    }),
    makePart('pump', 'Pump', 2, 2, 180, {
      [PUMP_KEY]: { id: 'pump-1', serviceId, type: BlockType.ActuatorPwm },
      [IO_PRESSURE_KEY]: 30,
    }),
    makePart('sink', 'SystemIO', 3, 2, 180),
  ]);

// src -> tube -> cross -> up: elbow, elbow -> tee -> sink X
//                      -> right: tee -> sink X
//                      -> down: sink Y
const splitLayout = (): BuilderLayout =>
  makeLayout('split-layout', [
    makePart('src', 'SystemIO', 1, 2, 0, {
      [IO_ENABLED_KEY]: true,
      [IO_PRESSURE_KEY]: 12,
      [COLOR_KEY]: COLD_WATER,
    }),
    makePart('tube', 'StraightTube', 2, 2),
    makePart('cross', 'CrossTube', 3, 2),
    makePart('up1', 'ElbowTube', 3, 1, 90),
    makePart('up2', 'ElbowTube', 4, 1, 180),
    makePart('tee', 'TeeTube', 4, 2, 0),
    makePart('sinkX', 'SystemIO', 5, 2, 180),
    makePart('sinkY', 'SystemIO', 3, 3, 270),
  ]);

const Host = defineComponent({
  props: { layoutId: { type: String, required: true } },
  setup(props) {
    const api = useFlowParts.setup(computed(() => props.layoutId));
    return { api };
  },
  render: () => h('div'),
});

type HostWrapper = VueWrapper<InstanceType<typeof Host>>;

// Wait for watchers, and for the debounced calculation
async function settle(): Promise<void> {
  await nextTick();
  await new Promise((resolve) => setTimeout(resolve, 150));
  await nextTick();
}

// Nested refs in the setup return value are not unwrapped
const tubeFlow = (wrapper: HostWrapper, id: string): number =>
  Object.values(wrapper.vm.api.flows.value[id]?.['1,0.5,0'] ?? {}).reduce(
    (a, b) => a + b,
    0,
  );

describe('useFlowParts', () => {
  let builderStore: ReturnType<typeof useBuilderStore>;
  let sparkStore: ReturnType<typeof useSparkStore>;

  beforeEach(async () => {
    vi.clearAllMocks();
    builderStore = useBuilderStore();
    sparkStore = useSparkStore();
    builderStore.blueprints = Object.values(blueprints);
    await builderStore.start();
    if (!sparkStore.serviceIds.includes(serviceId)) {
      sparkStore.serviceIds.push(serviceId);
    }
    sparkStore.blocks[serviceId] = [];
  });

  it('calculates flows when the layout is loaded', async () => {
    mocks.onLayoutChanged(valveLayout());
    sparkStore.blocks[serviceId] = [valveBlock(DigitalState.STATE_ACTIVE)];
    const wrapper = mount(Host, { props: { layoutId: 'valve-layout' } });
    await settle();
    expect(tubeFlow(wrapper, 'tube1')).toBeCloseTo(12 / 5, 6);
    wrapper.unmount();
  });

  it('follows a linked block that is loaded after the layout', async () => {
    mocks.onLayoutChanged(valveLayout());
    const wrapper = mount(Host, { props: { layoutId: 'valve-layout' } });
    await settle();
    expect(tubeFlow(wrapper, 'tube1')).toBe(0);

    sparkStore.blocks[serviceId] = [valveBlock(DigitalState.STATE_ACTIVE)];
    await settle();
    expect(tubeFlow(wrapper, 'tube1')).toBeCloseTo(12 / 5, 6);

    sparkStore.blocks[serviceId] = [valveBlock(DigitalState.STATE_INACTIVE)];
    await settle();
    expect(tubeFlow(wrapper, 'tube1')).toBe(0);
    wrapper.unmount();
  });

  it('follows the achieved value of a linked PWM block', async () => {
    mocks.onLayoutChanged(pumpLayout());
    sparkStore.blocks[serviceId] = [pwmBlock(true, 100, 0)];
    const wrapper = mount(Host, { props: { layoutId: 'pump-layout' } });
    await settle();
    expect(tubeFlow(wrapper, 'pump')).toBe(0);

    // Setting and enabled are unchanged
    sparkStore.blocks[serviceId] = [pwmBlock(true, 100, 100)];
    await settle();
    expect(tubeFlow(wrapper, 'pump')).toBeCloseTo(30 / 3, 6);

    sparkStore.blocks[serviceId] = [pwmBlock(false, 0, 100)];
    await settle();
    expect(tubeFlow(wrapper, 'pump')).toBeCloseTo(30 / 3, 6);

    sparkStore.blocks[serviceId] = [pwmBlock(false, 0, 0)];
    await settle();
    expect(tubeFlow(wrapper, 'pump')).toBe(0);
    wrapper.unmount();
  });

  it('does not recalculate for unrelated block changes', async () => {
    mocks.onLayoutChanged(valveLayout());
    sparkStore.blocks[serviceId] = [
      valveBlock(DigitalState.STATE_ACTIVE),
      setpointBlock(20),
    ];
    const wrapper = mount(Host, { props: { layoutId: 'valve-layout' } });
    await settle();
    const flows = wrapper.vm.api.flows.value;
    expect(tubeFlow(wrapper, 'tube1')).toBeCloseTo(12 / 5, 6);

    // Replaced with new objects, like a state event would
    sparkStore.blocks[serviceId] = [
      valveBlock(DigitalState.STATE_ACTIVE),
      setpointBlock(21),
    ];
    await settle();
    expect(wrapper.vm.api.flows.value).toBe(flows);
    wrapper.unmount();
  });

  it('recalculates when parts are updated', async () => {
    mocks.onLayoutChanged(valveLayout());
    const wrapper = mount(Host, { props: { layoutId: 'valve-layout' } });
    await settle();
    expect(tubeFlow(wrapper, 'tube1')).toBe(0);

    // Unlink the valve, and open it manually
    wrapper.vm.api.updateParts((draft) => {
      draft['valve'] = { ...draft['valve'], settings: {} };
    });
    await settle();
    expect(tubeFlow(wrapper, 'tube1')).toBeCloseTo(12 / 5, 6);
    wrapper.unmount();
  });

  it('shows calculation warnings once', async () => {
    mocks.onLayoutChanged(splitLayout());
    const wrapper = mount(Host, { props: { layoutId: 'split-layout' } });
    await settle();
    expect(notify.warn).toHaveBeenCalledTimes(1);
    expect(notify.warn).toHaveBeenCalledWith(SPLIT_MERGE_WARNING);

    wrapper.vm.api.updateParts((draft) => {
      draft['src'] = {
        ...draft['src'],
        settings: { ...draft['src'].settings, [IO_PRESSURE_KEY]: 13 },
      };
    });
    await settle();
    expect(notify.warn).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });
});

describe('Pump blueprint', () => {
  const sparkStore = useSparkStore();

  const pumpPart = (settings: Mapped<any>): BuilderPart =>
    makePart('pump', 'Pump', 2, 2, 0, {
      [IO_PRESSURE_KEY]: 30,
      ...settings,
    });

  const pumpPressure = (part: BuilderPart): number =>
    blueprints.Pump.transitions(part)!['1,0.5,0'][0].pressure!;

  beforeEach(() => {
    if (!sparkStore.serviceIds.includes(serviceId)) {
      sparkStore.serviceIds.push(serviceId);
    }
    sparkStore.blocks[serviceId] = [];
  });

  it('uses the manual setting when no block is linked', () => {
    expect(pumpPressure(pumpPart({ [IO_ENABLED_KEY]: true }))).toBe(30);
    expect(pumpPressure(pumpPart({ [IO_ENABLED_KEY]: false }))).toBe(0);
  });

  it('ignores the manual setting when a linked block is missing', () => {
    const part = pumpPart({
      [IO_ENABLED_KEY]: true,
      [PUMP_KEY]: { id: 'pump-1', serviceId, type: BlockType.ActuatorPwm },
    });
    expect(pumpPressure(part)).toBe(0);

    sparkStore.blocks[serviceId] = [pwmBlock(true, 50, 50)];
    expect(pumpPressure(part)).toBe(15);
  });
});
