import { mount, VueWrapper } from '@vue/test-utils';
import {
  BlockType,
  SequenceBlock,
  SequenceError,
  SequenceStatus,
  SequenceStoreMode,
} from 'brewblox-proto/ts';
import { createPinia, setActivePinia } from 'pinia';
import { describe, expect, it } from 'vitest';
import { computed, reactive } from 'vue';
import LabeledField from '@/components/form/LabeledField.vue';
import LinkField from '@/components/form/LinkField.vue';
import { useSparkStore } from '@/plugins/spark/store';
import { BlockKey } from '@/plugins/spark/symbols';
import {
  ChangeWidgetTitleKey,
  ContextKey,
  InvalidateKey,
  PatchWidgetKey,
  VolatileKey,
  WidgetKey,
} from '@/symbols';
import { bloxLink } from '@/utils/link';
import { bloxQty } from '@/utils/quantity';
import SequenceWidget from '../SequenceWidget.vue';

// A Spark built without Variables sends no variablesId, which the type requires
const sequence = (variablesId?: string): SequenceBlock =>
  ({
    id: 'Sequence',
    serviceId: 'spark',
    type: BlockType.Sequence,
    data: {
      enabled: false,
      instructions: [],
      ...(variablesId && { variablesId: bloxLink(variablesId) }),
      overrideState: false,
      activeInstruction: 0,
      storeMode: SequenceStoreMode.AT_RESTORE_INSTRUCTION_RESTORE_ENABLED,
      status: SequenceStatus.UNKNOWN,
      error: SequenceError.NONE,
      elapsed: bloxQty('0s'),
    },
  }) as SequenceBlock;

// jsdom lays out no text, which CodeMirror measures through ranges
Range.prototype.getClientRects = () => [] as unknown as DOMRectList;

// The widget in Full mode, its links shown by the real LinkField
function mountFull(block: SequenceBlock): VueWrapper {
  setActivePinia(createPinia());
  const sparkStore = useSparkStore();
  sparkStore.$patch((state) => {
    state.serviceIds = [block.serviceId];
    state.blocks = { [block.serviceId]: [block] };
  });
  const widget = {
    id: 'widget',
    title: block.id,
    feature: block.type,
    dashboard: 'dashboard',
    order: 0,
    cols: 4,
    rows: 4,
    config: { serviceId: block.serviceId, blockId: block.id },
  };
  return mount(SequenceWidget, {
    global: {
      components: { LabeledField, LinkField },
      stubs: {
        BlockWidgetToolbar: true,
        CardWarning: true,
        PreviewCard: true,
        SelectField: true,
      },
      renderStubDefaultSlot: true,
      provide: {
        [WidgetKey as symbol]: computed(() => widget),
        [PatchWidgetKey as symbol]: () => {},
        [InvalidateKey as symbol]: () => {},
        [VolatileKey as symbol]: false,
        [ChangeWidgetTitleKey as symbol]: () => {},
        [ContextKey as symbol]: reactive({
          container: 'Dashboard',
          mode: 'Full',
          size: 'Fixed',
        }),
        [BlockKey as symbol]: computed(() =>
          sparkStore.blockById(block.serviceId, block.id),
        ),
      },
    },
  });
}

describe('SequenceWidget', () => {
  it('shows its Full view without a Variables field when the Spark sends no variablesId', () => {
    const wrapper = mountFull(sequence());

    expect(wrapper.findComponent(LinkField).exists()).toBe(false);
  });

  it('shows the Variables link when the Spark sends one', () => {
    const wrapper = mountFull(sequence('Variables'));

    expect(wrapper.findComponent(LinkField).props('modelValue')).toEqual(
      bloxLink('Variables'),
    );
  });
});
