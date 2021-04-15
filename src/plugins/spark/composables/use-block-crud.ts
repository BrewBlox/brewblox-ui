import { nanoid } from 'nanoid';
import { computed, ComputedRef, PropType, reactive, WritableComputedRef } from 'vue';

import { useCrud, UseCrudComponent, UseCrudProps } from '@/composables';
import { GraphConfig } from '@/plugins/history/types';
import { Block } from '@/shared-types';
import { dashboardStore } from '@/store/dashboards';
import { Crud } from '@/store/features';
import { widgetStore } from '@/store/widgets';
import { createDialog } from '@/utils/dialog';
import { deepCopy } from '@/utils/functional';
import notify from '@/utils/notify';

import { SparkServiceModule, sparkStore } from '../store';
import { BlockConfig, BlockCrud } from '../types';
import { blockGraphCfg, blockIdRules, canDisplay as canDisplayFn } from '../utils';

export interface UseBlockCrudProps extends UseCrudProps {
  crud: {
    type: PropType<Crud<BlockConfig> | BlockCrud>,
    required: true,
  }
}

export interface UseBlockCrudComponent<BlockT extends Block>
  extends UseCrudComponent<BlockConfig> {
  crud: BlockCrud<BlockT>;

  block: BlockT;
  saveBlock(): Promise<void>;

  sparkModule: SparkServiceModule;
  constrainers: ComputedRef<string | null>;
  graphCfg: WritableComputedRef<GraphConfig>;

  canDisplay: boolean;
  hasGraph: boolean;
  isDriven: ComputedRef<boolean>;

  startMakeWidget(): void;
  startChangeBlockId(): void;
  startRemoveBlock(): void;
}

export interface UseBlockCrudComposable {
  props: UseBlockCrudProps;
  setup<BlockT extends Block>(crud: Crud | BlockCrud): UseBlockCrudComponent<BlockT>;
}


export const useBlockCrud: UseBlockCrudComposable = {
  props: {
    crud: {
      type: Object as PropType<Crud<BlockConfig> | BlockCrud>,
      required: true,
    },
  },
  setup<BlockT extends Block>(sourceCrud: Crud<BlockConfig> | BlockCrud<Block>): UseBlockCrudComponent<BlockT> {
    const { serviceId, blockId } = sourceCrud.widget.config;
    const sparkModule = sparkStore.moduleById(serviceId)!;

    /*
     * This composition function is designed to be flexible in its input,
     * and return reliable output.
     *
     * There are two scenarios for instantiation:
     * 1. A widget is rendered for an existing block.
     * 2. A widget is rendered for a volatile block (eg. during a creation wizard).
     *
     * In the first scenario, we can fetch the block from the store, and save it there as well.
     * Here, `sourceCrud` can be either a generic Crud object, or a previously fleshed out BlockCrud.
     *
     * In the second scenario, the call site is responsible for defining both the block and the save function.
     */
    const crud: BlockCrud<BlockT> = 'block' in sourceCrud
      ? sourceCrud as any
      : reactive({
        ...sourceCrud,
        isStoreBlock: true,
        block: sparkModule.blockById<BlockT>(blockId)!,
        saveBlock: (block: BlockT) => sparkModule.saveBlock(block),
      });

    const block = reactive(crud.block) as BlockT;

    async function saveBlock(): Promise<void> {
      await crud.saveBlock(block);
    }

    const constrainers = computed<string | null>(
      () => sparkModule.limiters[block.id]?.join(', ') || null,
    );

    const graphCfg = computed<GraphConfig>({
      get: () => blockGraphCfg(crud),
      set: cfg => {
        const config: BlockConfig = {
          ...crud.widget.config,
          queryParams: { ...cfg.params },
          graphAxes: { ...cfg.axes },
          graphLayout: { ...cfg.layout },
        };
        crud.widget.config = config;
        crud.saveWidget({ ...crud.widget, config });
      },
    });

    const canDisplay: boolean = crud.isStoreBlock
      && canDisplayFn(block);

    const hasGraph: boolean = crud.isStoreBlock
      && sparkStore.spec(block).fields.some(f => f.graphed);

    const isDriven = computed<boolean>(
      () => sparkModule
        .drivenBlocks
        .includes(block.id),
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
          message: `On which dashboard do you want to create a widget for <i>${crud.widget.title}</i>?`,
          html: true,
          listSelect: selectOptions.length < 10,
          selectOptions,
        },
      })
        .onOk((dashboard: string) => {
          if (dashboard) {
            widgetStore.appendWidget({ ...deepCopy(crud.widget), id, dashboard, pinnedPosition: null });
            notify.done(`Created <b>${crud.widget.title}</b> on <b>${dashboardStore.dashboardTitle(dashboard)}</b>`);
          }
        });
    }

    async function changeBlockId(newId: string): Promise<void> {
      if (crud.isStoreBlock) {
        await sparkModule.renameBlock([block.id, newId])
          .catch(() => { });
      } else {
        await crud.saveBlock({ ...block, id: newId });
      }
    }

    function startChangeBlockId(): void {
      createDialog({
        component: 'InputDialog',
        componentProps: {
          modelValue: block.id,
          title: 'Change block name',
          message: `Choose a new name for <i>${block.id}</i>.`,
          html: true,
          clearable: false,
          rules: blockIdRules(block.serviceId),
        },
      })
        .onOk(async (newId: string) => {
          await changeBlockId(newId);
          crud.closeDialog();
        });
    }

    function startRemoveBlock(): void {
      createDialog({
        component: 'ConfirmDialog',
        componentProps: {
          title: 'Remove block',
          message: `Are you sure you want to remove ${block.id}?`,
        },
      })
        .onOk(async () => {
          if (crud.isStoreBlock) {
            await sparkStore.removeBlock(block);
            crud.closeDialog();
          }
        });
    }

    return {
      ...useCrud.setup(crud),
      crud,
      block,
      saveBlock,
      sparkModule,
      constrainers,
      graphCfg,
      canDisplay,
      hasGraph,
      isDriven,
      startMakeWidget,
      startChangeBlockId,
      startRemoveBlock,
    };
  },
};
