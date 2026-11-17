import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { BlockType, SparkStatusDescription } from 'brewblox-proto/ts';
import { createPinia, setActivePinia } from 'pinia';
import { describe, expect, it } from 'vitest';
import { computed, defineComponent, ref } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import { SPARK_SERVICE_TYPE } from '@/plugins/spark/const';
import { useBlockSpecStore, useSparkStore } from '@/plugins/spark/store';
import { BlockSpec } from '@/plugins/spark/types';
import { useServiceStore } from '@/store/services';
import { DenseKey, TouchKey } from '@/symbols';
import { slotStub } from '../../../../../test/block-widget';
import BlockWizardDialog from '../BlockWizardDialog.vue';

const ListSelect = defineComponent({
  name: 'ListSelect',
  props: {
    modelValue: { type: Object, default: null },
    options: { type: Array, default: () => [] },
  },
  emits: ['update:modelValue', 'confirm'],
  render: () => null,
});

const spec = (type: string, title: string, simulatorOnly = false): BlockSpec =>
  ({
    type,
    title,
    simulatorOnly,
    generate: () => ({}),
    analyze: () => 'Active',
  }) as unknown as BlockSpec;

// The controller platforms the service reports from the handshake
const SERVICES = {
  sparkey: 'sim',
  spark3: 'p1',
  spark4: 'esp32',
};

type Platforms = Partial<Record<keyof typeof SERVICES, string>>;

/** The wizard, opened from the given page, among these Spark services */
async function mountWizard(
  services: Platforms,
  { path = '/', serviceId = null as string | null } = {},
): Promise<VueWrapper> {
  setActivePinia(createPinia());
  const serviceStore = useServiceStore();
  const sparkStore = useSparkStore();
  Object.keys(services).forEach((id) =>
    serviceStore.setService({
      id,
      title: id,
      type: SPARK_SERVICE_TYPE,
      config: {},
    }),
  );
  sparkStore.$patch((state) => {
    state.serviceIds = Object.keys(services);
    state.blocks = Object.fromEntries(
      Object.keys(services).map((id) => [id, []]),
    );
    state.statuses = Object.fromEntries(
      Object.entries(services).map(([id, platform]) => [
        id,
        { controller: { platform } } as SparkStatusDescription,
      ]),
    );
  });
  const specStore = useBlockSpecStore();
  specStore.addBlockSpec(spec(BlockType.TempSensorMock, 'Temp Sensor (Mock)'));
  specStore.addBlockSpec(
    spec(
      BlockType.TempSensorMockFluctuating,
      'Temp Sensor (Mock, fluctuating)',
      true,
    ),
  );

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:path(.*)*', component: { render: () => null } }],
  });
  await router.push(path);

  const wrapper = mount(BlockWizardDialog, {
    props: { serviceId },
    global: {
      plugins: [router],
      provide: {
        [DenseKey as symbol]: computed(() => false),
        [TouchKey as symbol]: ref(false),
      },
      stubs: {
        Card: slotStub('default'),
        KeyboardButton: true,
        ListSelect,
        QDialog: slotStub('default'),
        QInput: { render: () => null },
        QStep: slotStub('default'),
        QStepper: slotStub('default'),
        Toolbar: true,
      },
    },
  });
  await flushPromises();
  return wrapper;
}

const lists = (wrapper: VueWrapper): VueWrapper<any>[] =>
  wrapper.findAllComponents(ListSelect);

const blockOpt = (wrapper: VueWrapper, type: string): any =>
  lists(wrapper)[0]
    .props('options')
    .find((opt: any) => opt.value === type);

const serviceIds = (wrapper: VueWrapper): string[] =>
  lists(wrapper)[1]
    .props('options')
    .map((opt: any) => opt.value);

/** Confirms a block type, as a double click in the type list does */
async function chooseType(wrapper: VueWrapper, type: string): Promise<void> {
  lists(wrapper)[0].vm.$emit('confirm', blockOpt(wrapper, type));
  await flushPromises();
}

describe('BlockWizardDialog with a simulator-only block type', () => {
  it('lists only simulator services for it', async () => {
    const wrapper = await mountWizard({
      sparkey: SERVICES.sparkey,
      spark4: SERVICES.spark4,
    });

    await chooseType(wrapper, BlockType.TempSensorMockFluctuating);

    expect(serviceIds(wrapper)).toEqual(['sparkey']);
  });

  it('lists every service for a type that is not simulator-only', async () => {
    const wrapper = await mountWizard({
      sparkey: SERVICES.sparkey,
      spark4: SERVICES.spark4,
    });

    await chooseType(wrapper, BlockType.TempSensorMock);

    expect(serviceIds(wrapper)).toEqual(['spark4', 'sparkey']);
  });

  it('greys it out when no service is a simulator', async () => {
    const wrapper = await mountWizard({
      spark3: SERVICES.spark3,
      spark4: SERVICES.spark4,
    });

    expect(
      blockOpt(wrapper, BlockType.TempSensorMockFluctuating),
    ).toMatchObject({ disable: true, tooltip: 'Simulator only' });
    expect(blockOpt(wrapper, BlockType.TempSensorMock).disable).toBe(false);
  });

  it('greys it out when opened for a Spark that is not a simulator', async () => {
    const wrapper = await mountWizard(
      { sparkey: SERVICES.sparkey, spark4: SERVICES.spark4 },
      { serviceId: 'spark4' },
    );

    expect(blockOpt(wrapper, BlockType.TempSensorMockFluctuating).disable).toBe(
      true,
    );
  });

  it("drops the current page's Spark when it is not a simulator", async () => {
    const wrapper = await mountWizard(
      { sparkey: SERVICES.sparkey, spark4: SERVICES.spark4 },
      { path: '/service/spark4' },
    );
    expect(lists(wrapper)[1].props('modelValue')).toMatchObject({
      value: 'spark4',
    });

    await chooseType(wrapper, BlockType.TempSensorMockFluctuating);

    expect(lists(wrapper)[1].props('modelValue')).toBeNull();
  });
});
