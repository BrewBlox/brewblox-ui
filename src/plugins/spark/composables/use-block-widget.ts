import debounce from 'lodash/debounce';
import {
  computed,
  ComputedRef,
  Ref,
  ref,
  UnwrapRef,
  watch,
  WritableComputedRef,
} from 'vue';

import { useWidget, UseWidgetComponent } from '@/composables';
import { GraphConfig } from '@/plugins/history/types';
import { Block } from '@/shared-types';
import { useWidgetStore } from '@/store/widgets';

import { useBlockSpecStore, useSparkStore } from '../store';
import { BlockConfig, BlockSpec, BlockWidget } from '../types';
import {
  findLimitations,
  isBlockVolatile,
  limitationString,
  makeBlockGraphConfig,
} from '../utils';

export interface UseBlockWidgetComponent<BlockT extends Block>
  extends UseWidgetComponent<BlockWidget> {
  serviceId: string;
  blockId: string;
  block: Ref<UnwrapRef<BlockT>>;
  graphConfig: WritableComputedRef<GraphConfig | null>;
  blockSpec: ComputedRef<BlockSpec<BlockT>>;
  isVolatileBlock: ComputedRef<boolean>;

  saveBlock(block?: BlockT): Promise<void>;

  hasGraph: boolean;
  isDriven: ComputedRef<boolean>;
  limitations: ComputedRef<string | null>;
}

export interface UseBlockWidgetComposable {
  setup<BlockT extends Block>(): UseBlockWidgetComponent<BlockT>;
}

export const useBlockWidget: UseBlockWidgetComposable = {
  setup<BlockT extends Block>(): UseBlockWidgetComponent<BlockT> {
    const { widget, config, invalidate, ...useWidgetResults } =
      useWidget.setup<BlockWidget>();

    const sparkStore = useSparkStore();
    const specStore = useBlockSpecStore();
    const widgetStore = useWidgetStore();

    // We assume that serviceId/blockId are constant while the widget is mounted
    // If we rename the block, we invalidate the rendering dialog
    const { serviceId, blockId } = config.value;

    if (!sparkStore.serviceIds.includes(serviceId)) {
      // We expect parent objects to check configuration before creating the widget
      // Module lifetime should always start before, and end after widget lifetime
      throw new Error(
        `No Spark Service found for widget ${widget.value?.title} (${serviceId} / ${blockId})`,
      );
    }

    const block = ref<BlockT>(
      sparkStore.blockById(serviceId, config.value.blockId)!,
    );

    if (!block.value) {
      throw new Error(`Block not found: (${serviceId} / ${blockId})`);
    }

    const debouncedCheckValid = debounce(
      () => {
        if (!sparkStore.blockById(serviceId, blockId)) {
          invalidate();
        }
      },
      1000,
      { leading: false, trailing: true },
    );

    watch(
      () => sparkStore.blockById(serviceId, blockId),
      (newV) => {
        if (newV) {
          block.value = newV;
        } else {
          debouncedCheckValid();
        }
      },
    );

    const blockSpec = computed<BlockSpec<BlockT>>(
      () => specStore.blockSpecByAddress(block.value)!,
    );

    const isVolatileBlock = computed<boolean>(() =>
      isBlockVolatile(block.value),
    );

    async function saveBlock(v: BlockT = block.value): Promise<void> {
      await sparkStore.saveBlock(v);
    }

    const limitations = computed<string | null>(() =>
      limitationString(findLimitations(block.value)),
    );

    const hasGraph: boolean =
      !isVolatileBlock.value &&
      specStore.fieldSpecs.some(
        (f) => f.type === block.value.type && f.graphed,
      );

    const graphConfig = computed<GraphConfig | null>({
      get: () =>
        hasGraph ? makeBlockGraphConfig(block.value, config.value) : null,
      set: (cfg) => {
        if (hasGraph) {
          const updated: BlockConfig = {
            ...config.value,
            queryParams: cfg?.params,
            graphAxes: cfg?.axes,
            graphLayout: cfg?.layout,
          };
          widgetStore.saveWidget({ ...widget.value, config: updated });
        }
      },
    });

    const isDriven = computed<boolean>(() =>
      sparkStore
        .driveChainsByService(serviceId)
        .some((c) => c.target === blockId),
    );

    return {
      widget,
      config,
      invalidate,
      ...useWidgetResults,
      serviceId,
      blockId,
      block,
      blockSpec,
      isVolatileBlock,
      saveBlock,
      limitations,
      graphConfig,
      hasGraph,
      isDriven,
    };
  },
};
