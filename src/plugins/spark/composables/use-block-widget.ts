import { Block } from 'brewblox-proto/ts';
import {
  computed,
  ComputedRef,
  inject,
  ref,
  watch,
  WritableComputedRef,
} from 'vue';
import { useWidget, UseWidgetComponent } from '@/composables';
import { GraphConfig } from '@/plugins/history/types';
import { emptyGraphConfig } from '@/plugins/history/utils';
import { useBlockSpecStore, useSparkStore } from '@/plugins/spark/store';
import { BlockKey } from '@/plugins/spark/symbols';
import { BlockConfig, BlockSpec, BlockWidget } from '@/plugins/spark/types';
import { makeBlockGraphConfig } from '@/plugins/spark/utils/configuration';
import { prettyLimitations } from '@/plugins/spark/utils/formatting';

export interface UseBlockWidgetComponent<BlockT extends Block>
  extends UseWidgetComponent<BlockWidget> {
  serviceId: string;
  blockId: string;
  block: ComputedRef<BlockT>;
  graphConfig: WritableComputedRef<GraphConfig>;
  blockSpec: ComputedRef<BlockSpec<BlockT>>;

  patchBlock(data: Partial<BlockT['data']>): Promise<void>;

  hasGraph: boolean;
  hasRelations: boolean;
  isClaimed: ComputedRef<boolean>;
  limitations: ComputedRef<string | null>;
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
      updateConfig,
      ...useWidgetComponentSetup
    } = useWidget.setup<BlockWidget>();

    const sparkStore = useSparkStore();
    const specStore = useBlockSpecStore();

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

    const block = inject<ComputedRef<BlockT>>(BlockKey)!;

    if (!block) {
      throw new Error('Block not injected');
    }

    const blockSpec = computed<BlockSpec<BlockT>>(
      () => specStore.blockSpecByAddress(block.value)!,
    );

    async function patchBlock(data: Partial<BlockT['data']>): Promise<void> {
      await sparkStore.patchBlock(block.value, data);
    }

    const limitations = computed<string | null>(
      () => prettyLimitations(block.value.data.constraints) || null,
    );

    const hasRelations: boolean = !!blockSpec.value.hasRelations;

    const hasGraph: boolean = specStore.fieldSpecs.some(
      (f) => f.type === block.value.type && f.graphed,
    );

    const localGraphConfig = ref(
      hasGraph
        ? makeBlockGraphConfig(block.value, config.value)
        : emptyGraphConfig(),
    );

    // We don't want to reload on every block data change
    if (hasGraph) {
      watch(
        () => config.value,
        (cfg: BlockConfig) => {
          localGraphConfig.value = makeBlockGraphConfig(block.value, cfg);
        },
      );
    }

    const graphConfig = computed<GraphConfig>({
      get: () => localGraphConfig.value,
      set: (cfg) => {
        if (hasGraph) {
          updateConfig((draft: BlockConfig) => {
            draft.queryParams = cfg?.params;
            draft.graphAxes = cfg?.axes;
            draft.graphLayout = cfg?.layout;
          });
        }
      },
    });

    const isClaimed = computed<boolean>(
      () => block.value.data.claimedBy && block.value.data.claimedBy.id != null,
    );

    return {
      widget,
      config,
      invalidate,
      updateConfig,
      ...useWidgetComponentSetup,
      serviceId,
      blockId,
      block,
      blockSpec,
      patchBlock,
      limitations,
      graphConfig,
      hasGraph,
      hasRelations,
      isClaimed,
    };
  },
};
