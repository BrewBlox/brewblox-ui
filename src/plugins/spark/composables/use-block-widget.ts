import { nanoid } from 'nanoid';
import { computed, ComputedRef, Ref, ref, UnwrapRef, watch, WritableComputedRef } from 'vue';

import { useWidget, UseWidgetComponent } from '@/composables';
import { GraphConfig } from '@/plugins/history/types';
import { Block } from '@/shared-types';
import { dashboardStore } from '@/store/dashboards';
import { widgetStore } from '@/store/widgets';
import { createDialog } from '@/utils/dialog';
import { deepCopy } from '@/utils/functional';
import notify from '@/utils/notify';

import { SparkServiceModule, sparkStore } from '../store';
import { BlockConfig, BlockSpec, BlockWidget } from '../types';
import { blockGraphCfg, canDisplay as canDisplayFn, makeBlockIdRules } from '../utils';

export interface UseBlockWidgetComponent<BlockT extends Block>
  extends UseWidgetComponent<BlockWidget> {
  serviceId: string;
  blockId: string;
  sparkModule: SparkServiceModule;
  block: Ref<UnwrapRef<BlockT>>;
  graphConfig: WritableComputedRef<GraphConfig | null>;
  spec: ComputedRef<BlockSpec<BlockT>>;
  isVolatileBlock: ComputedRef<boolean>;

  saveBlock(block?: BlockT): Promise<void>;

  canDisplay: boolean;
  hasGraph: boolean;
  isDriven: ComputedRef<boolean>;
  constrainers: ComputedRef<string | null>;

  startMakeWidget(): void;
  startChangeBlockId(): void;
  startRemoveBlock(): void;
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

    const block = ref<BlockT>(
      sparkModule.blockById(config.value.blockId)!,
    );

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

    const spec = computed<BlockSpec<BlockT>>(
      () => sparkStore.spec(block.value),
    );

    const isVolatileBlock = computed<boolean>(
      () => !block.value.meta?.volatile,
    );

    async function saveBlock(v: BlockT = block.value): Promise<void> {
      await sparkModule.saveBlock(v);
    }

    const constrainers = computed<string | null>(
      () => sparkModule.limiters[config.value.blockId]?.join(', ') || null,
    );

    const hasGraph: boolean = !isVolatileBlock.value
      && sparkStore.spec(block.value).fields.some(f => f.graphed);

    const graphConfig = computed<GraphConfig | null>({
      get: () => hasGraph ? blockGraphCfg(block.value, config.value) : null,
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

    const canDisplay: boolean = !isVolatileBlock.value
      && canDisplayFn(block.value);


    const isDriven = computed<boolean>(
      () => sparkModule
        .drivenBlocks
        .includes(config.value.blockId),
    );

    function startMakeWidget(): void {
      const id = nanoid();
      const selectOptions = dashboardStore.dashboards
        .map(dashboard => ({
          label: dashboard.title,
          value: dashboard.id,
        }));

      createDialog({
        component: 'SelectDialog',
        componentProps: {
          modelValue: null,
          title: 'Make widget',
          message: `On which dashboard do you want to create a widget for <i>${widget.value.title}</i>?`,
          html: true,
          listSelect: selectOptions.length < 10,
          selectOptions,
        },
      })
        .onOk((dashboard: string) => {
          if (dashboard) {
            widgetStore.appendWidget({ ...deepCopy(widget.value), id, dashboard, pinnedPosition: null });
            notify.done(`Created <b>${widget.value.title}</b> on <b>${dashboardStore.dashboardTitle(dashboard)}</b>`);
          }
        });
    }

    async function changeBlockId(newId: string): Promise<void> {
      if (!isVolatileBlock.value) {
        await sparkModule.renameBlock([blockId, newId])
          .catch(() => { });
      } else {
        await sparkModule.saveBlock({ ...block.value, id: newId });
      }
    }

    function startChangeBlockId(): void {
      createDialog({
        component: 'InputDialog',
        componentProps: {
          modelValue: block.value.id,
          title: 'Change block name',
          message: `Choose a new name for <i>${block.value.id}</i>.`,
          html: true,
          clearable: false,
          rules: makeBlockIdRules(block.value.serviceId),
        },
      })
        .onOk((newId: string) => {
          changeBlockId(newId);
        });
    }

    function startRemoveBlock(): void {
      createDialog({
        component: 'ConfirmDialog',
        componentProps: {
          title: 'Remove block',
          message: `Are you sure you want to remove ${block.value.id}?`,
        },
      })
        .onOk(() => {
          sparkStore.removeBlock(block.value);
        });
    }

    return {
      widget,
      config,
      invalidate,
      ...useWidgetResults,
      sparkModule,
      serviceId,
      blockId,
      block,
      spec,
      isVolatileBlock,
      saveBlock,
      constrainers,
      graphConfig,
      canDisplay,
      hasGraph,
      isDriven,
      startMakeWidget,
      startChangeBlockId,
      startRemoveBlock,
    };
  },
};
