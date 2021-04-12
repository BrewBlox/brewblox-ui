<script lang="ts">
import { DialogChainObject } from 'quasar';
import { computed, defineComponent, ref } from 'vue';

import { sparkStore } from '@/plugins/spark/store';
import { Block, BlockAddress, BlockConfig, BlockCrud, BlockType } from '@/plugins/spark/types';
import { blockIdRules } from '@/plugins/spark/utils';
import { tryCreateBlock, tryCreateWidget } from '@/plugins/wizardry';
import { useWidgetWizard } from '@/plugins/wizardry/composables';
import { Widget } from '@/store/dashboards';
import { createBlockDialog, createDialog } from '@/utils/dialog';
import { objectStringSorter, ruleValidator, suggestId } from '@/utils/functional';

type CreateMode = 'new' | 'existing';

const createModeOpts: SelectOption<CreateMode>[] = [
  { label: 'Create new block', value: 'new' },
  { label: 'Use existing block', value: 'existing' },
];

export default defineComponent({
  name: 'BlockWidgetWizard',
  props: {
    ...useWidgetWizard.props,
  },
  emits: [
    ...useWidgetWizard.emits,
  ],
  setup(props) {
    const {
      widgetId,
      featureTitle,
      defaultWidgetSize,
      onBack,
      onClose,
      onDone,
    } = useWidgetWizard.setup(props.featureId);

    const blockType = props.featureId as BlockType;
    const createMode = ref<CreateMode>('new');
    const activeDialog = ref<DialogChainObject>();

    const serviceId = ref<string | null>(sparkStore.serviceIds[0] ?? null);
    const dashboardId = ref<string | null>(props.activeDashboardId ?? null);
    const existingBlockId = ref<string | null>(null);

    const createdBlockIdRules = computed<InputRule[]>(
      () => serviceId.value
        ? blockIdRules(serviceId.value)
        : [],
    );

    const validator = computed<(v: string) => boolean>(
      () => ruleValidator(createdBlockIdRules.value),
    );

    const localBlockId = ref<string>(suggestId(featureTitle, validator.value));
    const localBlock = ref<Block | null>(null);

    const serviceOpts = computed<string[]>(
      () => sparkStore.serviceIds,
    );

    const blockOpts = computed<HasId[]>(
      () => {
        if (!serviceId.value) { return []; }
        return sparkStore.serviceBlocks(serviceId.value)
          .filter(block => block.type === props.featureId)
          .sort(objectStringSorter('id'));
      },
    );

    const blockAddress = computed<BlockAddress>({
      get: () => ({
        serviceId: serviceId.value,
        id: existingBlockId.value,
        type: blockType,
      }),
      set: addr => existingBlockId.value = addr.id,
    });

    const existingBlock = computed<Block | null>(
      () => sparkStore.blockByAddress(blockAddress.value),
    );

    const canConfigure = computed<boolean>(
      () => (createMode.value === 'new')
        || (createMode.value === 'existing' && existingBlock.value !== null),
    );

    const canCreate = computed<boolean>(
      () => {
        if (dashboardId.value === null) {
          return false;
        }
        return (createMode.value === 'new' && validator.value(localBlockId.value))
          || (createMode.value === 'existing' && existingBlock.value !== null);
      },
    );

    function showIdKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          value: localBlockId.value,
          rules: createdBlockIdRules.value,
        },
      });
    }

    function ensureLocalBlock(serviceId: string): { block: Block; widget: Widget } {
      const blockId = localBlockId.value;

      const block: Block = localBlock.value ?? {
        id: blockId,
        serviceId,
        type: blockType,
        groups: [0],
        data: sparkStore.spec({ type: blockType }).generate(),
      };
      const widget: Widget = {
        id: widgetId,
        title: blockId,
        feature: blockType,
        dashboard: dashboardId.value ?? '',
        order: 0,
        config: {
          blockId,
          serviceId,
        },
        ...defaultWidgetSize,
      };

      localBlock.value = block;
      localBlock.value.id = blockId;

      return { block, widget };
    }

    function configureBlock(): void {
      if (!canConfigure.value || !serviceId.value) {
        return;
      }

      if (createMode.value === 'new') {
        const { block, widget } = ensureLocalBlock(serviceId.value);
        const crud: BlockCrud = {
          block,
          widget,
          isStoreWidget: false,
          saveWidget: () => { },
          isStoreBlock: false,
          saveBlock: v => { localBlock.value = v; },
          closeDialog,
        };
        activeDialog.value = createDialog({
          component: 'WidgetDialog',
          componentProps: {
            getCrud: () => crud,
            mode: 'Full',
          },
        });
      }

      if (createMode.value === 'existing') {
        createBlockDialog(blockAddress.value);
      }
    }

    function closeDialog(): void {
      if (activeDialog.value) {
        activeDialog.value.hide();
        activeDialog.value = undefined;
      }
    }

    async function createWidget(): Promise<void> {
      if (!canCreate.value || !serviceId.value || !dashboardId.value) {
        return;
      }

      if (createMode.value === 'new') {
        const { block, widget } = ensureLocalBlock(serviceId.value);
        const createdBlock = await tryCreateBlock(block);
        if (!createdBlock) {
          return onClose();
        }
        const createdWidget = await tryCreateWidget<BlockConfig>(widget);
        return onDone({ block: createdBlock, widget: createdWidget });
      }

      if (createMode.value === 'existing' && existingBlock.value) {
        const block = existingBlock.value;
        const widget = await tryCreateWidget<BlockConfig>({
          id: widgetId,
          title: block.id,
          feature: blockType,
          dashboard: dashboardId.value,
          order: 0,
          config: {
            blockId: block.id,
            serviceId: block.serviceId,
          },
          ...defaultWidgetSize,
        });
        return onDone({ widget, block });
      }
    }

    return {
      featureTitle,
      onBack,
      createMode,
      createModeOpts,
      serviceId,
      dashboardId,
      existingBlockId,
      createdBlockIdRules,
      validator,
      localBlockId,
      localBlock,
      serviceOpts,
      blockOpts,
      blockAddress,
      existingBlock,
      canConfigure,
      canCreate,
      showIdKeyboard,
      configureBlock,
      createWidget,
    };
  },
});
</script>

<template>
  <ActionCardBody>
    <div class="widget-body column">
      <q-btn-toggle
        v-model="createMode"
        :options="createModeOpts"
        outline
        class="self-center q-my-md"
      />

      <q-select
        v-model="serviceId"
        :options="serviceOpts"
        label="Service"
        @keyup.enter.exact.stop
      />

      <DashboardSelect
        v-model="dashboardId"
        :default-value="activeDashboardId"
      />

      <template v-if="createMode === 'new'">
        <q-input
          v-model="localBlockId"
          :rules="createdBlockIdRules"
          autofocus
          label="Block name"
        >
          <template #append>
            <KeyboardButton @click="showIdKeyboard" />
            <q-icon name="mdi-information">
              <q-tooltip>
                The name of the Spark Controller block.
                <br>Multiple widgets can display the same block.
                <br>Rules:
                <ul>
                  <li>The name must not be empty.</li>
                  <li>The name must be unique.</li>
                  <li>The name must begin with a letter.</li>
                  <li>The name may only contain alphanumeric characters, space, and _-()|.</li>
                  <li>The name must be less than 200 characters.</li>
                </ul>
              </q-tooltip>
            </q-icon>
          </template>
        </q-input>
      </template>

      <template v-if="createMode === 'existing'">
        <BlockAddressField
          v-model="blockAddress"
          :creatable="false"
          label="Existing block"
        />
      </template>
    </div>

    <template #actions>
      <q-btn flat label="Back" @click="onBack" />
      <q-space />
      <q-btn
        :disable="!canConfigure"
        flat
        label="Configure block"
        @click="configureBlock"
      />
      <q-btn
        :disable="!canCreate"
        unelevated
        label="Create"
        color="primary"
        @click="createWidget"
      />
    </template>
  </ActionCardBody>
</template>
