import { computed, ComputedRef, Ref, ref, UnwrapRef, watch, WritableComputedRef } from 'vue';

import { useWidget, UseWidgetComponent } from '@/composables';
import { GraphConfig } from '@/plugins/history/types';
import { Block } from '@/shared-types';
import { widgetStore } from '@/store/widgets';

import { SparkServiceModule, sparkStore } from '../store';
import { BlockConfig, BlockSpec, BlockWidget } from '../types';
import { isBlockVolatile, makeBlockGraphConfig } from '../utils';

export interface UseBlockWidgetComponent<BlockT extends Block>
  extends UseWidgetComponent<BlockWidget> {
  serviceId: string;
  blockId: string;
  sparkModule: SparkServiceModule;
  block: Ref<UnwrapRef<BlockT>>;
  graphConfig: WritableComputedRef<GraphConfig | null>;
  blockSpec: ComputedRef<BlockSpec<BlockT>>;
  isVolatileBlock: ComputedRef<boolean>;

  saveBlock(block?: BlockT): Promise<void>;

  hasGraph: boolean;
  isDriven: ComputedRef<boolean>;
  constrainers: ComputedRef<string | null>;
}

export interface UseBlockWidgetComposable {
  setup<BlockT extends Block>(): UseBlockWidgetComponent<BlockT>;
}

export const useBlockWidget: UseBlockWidgetComposable = {
  setup<BlockT extends Block>(): UseBlockWidgetComponent<BlockT> {
    const {
      widget,
      config,
      invalidate,
      ...useWidgetResults
    } = useWidget.setup<BlockWidget>();

    // We assume that serviceId/blockId are constant while the widget is mounted
    // If we rename the block, we invalidate the rendering dialog
    const { serviceId, blockId } = config.value;
    const sparkModule = sparkStore.moduleById(serviceId)!;

    if (!sparkModule) {
      // We expect parent objects to check configuration before creating the widget
      // Module lifetime should always start before, and end after widget lifetime
      throw new Error(`No Spark Module found for widget ${widget.value?.title} (${serviceId} / ${blockId})`);
    }

    const block = ref<BlockT>(sparkModule.blockById(config.value.blockId)!);

    if (!block.value) {
      throw new Error(`Block not found: (${serviceId} / ${blockId})`);
    }

    watch(
      () => sparkModule.blockById(config.value.blockId),
      (newV) => {
        if (newV) {
          block.value = newV;
        }
        else {
          invalidate();
        }
      },
    );

    const blockSpec = computed<BlockSpec<BlockT>>(
      () => sparkStore.blockSpecByAddress(block.value)!,
    );

    const isVolatileBlock = computed<boolean>(
      () => isBlockVolatile(block.value),
    );

    async function saveBlock(v: BlockT = block.value): Promise<void> {
      await sparkModule.saveBlock(v);
    }

    const constrainers = computed<string | null>(
      () => sparkModule.limiters[config.value.blockId]?.join(', ') || null,
    );

    const hasGraph: boolean = !isVolatileBlock.value
      && sparkStore.fieldSpecs.some(f => f.type === block.value.type && f.graphed);

    const graphConfig = computed<GraphConfig | null>({
      get: () => hasGraph ? makeBlockGraphConfig(block.value, config.value) : null,
      set: cfg => {
        const updated: BlockConfig = {
          ...config.value,
          queryParams: cfg?.params,
          graphAxes: cfg?.axes,
          graphLayout: cfg?.layout,
        };
        widgetStore.saveWidget({ ...widget.value, config: updated });
      },
    });

    const isDriven = computed<boolean>(
      () => sparkModule
        .drivenBlocks
        .includes(config.value.blockId),
    );

    return {
      widget,
      config,
      invalidate,
      ...useWidgetResults,
      sparkModule,
      serviceId,
      blockId,
      block,
      blockSpec,
      isVolatileBlock,
      saveBlock,
      constrainers,
      graphConfig,
      hasGraph,
      isDriven,
    };
  },
};
