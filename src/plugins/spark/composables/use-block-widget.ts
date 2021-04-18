import { nanoid } from 'nanoid';
import { computed, ComputedRef, watch, WritableComputedRef } from 'vue';

import { useWidget, UseWidgetComponent } from '@/composables';
import { GraphConfig } from '@/plugins/history/types';
import { Block } from '@/shared-types';
import { dashboardStore } from '@/store/dashboards';
import { widgetStore } from '@/store/widgets';
import { createDialog } from '@/utils/dialog';
import { deepCopy } from '@/utils/functional';
import notify from '@/utils/notify';

import { SparkServiceModule, sparkStore } from '../store';
import { BlockConfig, BlockSpec } from '../types';
import { blockGraphCfg, blockIdRules, canDisplay as canDisplayFn } from '../utils';

export interface UseBlockWidgetComponent<BlockT extends Block>
  extends UseWidgetComponent<BlockConfig> {
  sparkModule: SparkServiceModule;
  block: ComputedRef<BlockT>;
  graphConfig: WritableComputedRef<GraphConfig | null>;

  spec: ComputedRef<BlockSpec<BlockT>>;
  isVolatileBlock: ComputedRef<boolean>;

  saveBlock(block: BlockT): Promise<void>;
  saveBlockData(data: BlockT['data']): Promise<void>;
  modifyBlock(fn: (v: BlockT) => unknown): Promise<void>

  constrainers: ComputedRef<string | null>;

  canDisplay: boolean;
  hasGraph: boolean;
  isDriven: ComputedRef<boolean>;

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
      ...useWidgetResults
    } = useWidget.setup<BlockConfig>();

    watch(
      () => widget.value.config.blockId,
      (newId) => {
        if (newId && newId !== widget.value.title && !widget.value.volatile) {
          widgetStore.saveWidget({ ...widget.value, title: newId });
        }
      },
    );

    const sparkModule = sparkStore.moduleById(widget.value.config.serviceId)!;

    const block = computed<BlockT>(
      () => sparkModule.blockById(widget.value.config.blockId)!,
    );

    const spec = computed<BlockSpec<BlockT>>(
      () => sparkStore.spec(block.value),
    );

    const isVolatileBlock = computed<boolean>(
      () => !block.value.meta?.volatile,
    );

    async function saveBlock(block: BlockT): Promise<void> {
      await sparkModule.saveBlock(block);
    }

    async function saveBlockData(data: BlockT['data']): Promise<void> {
      block.value.data = data;
      await sparkModule.saveBlock({ ...block.value, data });
    }

    async function modifyBlock(fn: (v: BlockT) => unknown): Promise<void> {
      fn(block.value);
      await sparkModule.saveBlock(block.value);
    }

    const constrainers = computed<string | null>(
      () => sparkModule.limiters[widget.value.config.blockId]?.join(', ') || null,
    );

    const hasGraph: boolean = !isVolatileBlock.value
      && sparkStore.spec(block.value).fields.some(f => f.graphed);

    const graphConfig = computed<GraphConfig | null>({
      get: () => hasGraph ? blockGraphCfg(block.value, widget.value.config) : null,
      set: cfg => {
        const config: BlockConfig = {
          ...widget.value.config,
          queryParams: cfg?.params,
          graphAxes: cfg?.axes,
          graphLayout: cfg?.layout,
        };
        widgetStore.saveWidget({ ...widget.value, config });
      },
    });

    const canDisplay: boolean = !isVolatileBlock.value
      && canDisplayFn(block.value);


    const isDriven = computed<boolean>(
      () => sparkModule
        .drivenBlocks
        .includes(widget.value.config.blockId),
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
        await sparkModule.renameBlock([widget.value.config.blockId, newId])
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
          rules: blockIdRules(block.value.serviceId),
        },
      })
        .onOk(async (newId: string) => {
          await changeBlockId(newId);
          // crud.closeDialog(); // TODO(Bob)
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
        .onOk(async () => {
          if (!isVolatileBlock.value) {
            await sparkStore.removeBlock(block.value);
            // crud.closeDialog(); // TODO(Bob)
          }
        });
    }

    return {
      widget,
      ...useWidgetResults,
      block,
      spec,
      isVolatileBlock,
      saveBlock,
      saveBlockData,
      modifyBlock,
      sparkModule,
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
