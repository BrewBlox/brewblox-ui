<script lang="ts">
import { DialogChainObject } from 'quasar';
import { computed, defineComponent, onBeforeUnmount, ref } from 'vue';

import { sparkStore } from '@/plugins/spark/store';
import { Block, BlockAddress, BlockConfig, BlockType } from '@/plugins/spark/types';
import { blockIdRules } from '@/plugins/spark/utils';
import { tryCreateBlock, tryCreateWidget } from '@/plugins/wizardry';
import { useWidgetWizard } from '@/plugins/wizardry/composables';
import { Widget, widgetStore } from '@/store/widgets';
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

    const createMode = ref<CreateMode>('new');
    const blockType = props.featureId as BlockType;

    const activeBlock = ref<Block | null>(null);
    const activeWidget = ref<Widget<BlockConfig> | null>(null);
    const activeDialog = ref<DialogChainObject>();

    const serviceId = ref<string | null>(sparkStore.serviceIds[0] ?? null);
    const dashboardId = ref<string | null>(props.activeDashboardId ?? null);

    const createdBlockIdRules = computed<InputRule[]>(
      () => serviceId.value
        ? blockIdRules(serviceId.value)
        : [],
    );

    const validator = computed<(v: string) => boolean>(
      () => ruleValidator(createdBlockIdRules.value),
    );

    const existingBlockId = ref<string | null>(null);
    const newBlockId = ref<string>(suggestId(featureTitle, validator.value));

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

    const canCreate = computed<boolean>(
      () => serviceId.value !== null && dashboardId.value !== null
        &&
        ((createMode.value === 'new' && validator.value(newBlockId.value))
          || (createMode.value === 'existing' && existingBlock.value !== null)),
    );

    function showIdKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: newBlockId.value,
          rules: createdBlockIdRules.value,
        },
      });
    }

    async function ensureVolatile(): Promise<void> {
      if (!serviceId.value || !dashboardId.value) {
        return;
      }

      if (createMode.value === 'new') {
        if (activeBlock.value
          && (activeBlock.value.id !== newBlockId.value
            || activeBlock.value.serviceId !== serviceId.value)) {
          await sparkStore.removeVolatileBlock(activeBlock.value);
          activeBlock.value = null;
        }

        if (!activeBlock.value
          && newBlockId.value
          && serviceId.value
          && validator.value(newBlockId.value)) {
          await sparkStore.createVolatileBlock({
            id: newBlockId.value,
            serviceId: serviceId.value,
            type: blockType,
            groups: [0],
            data: sparkStore.spec({ type: blockType }).generate(),
          });
        }
      }

      onBeforeUnmount(() => {
        if (activeBlock.value) {
          sparkStore.removeVolatileBlock(activeBlock.value);
        }
        if (activeWidget.value) {
          widgetStore.removeVolatileWidget(activeWidget.value);
        }
      });

      const blockId = createMode.value === 'new'
        ? newBlockId.value
        : existingBlockId.value;
      const block = sparkStore.blockById(serviceId.value, blockId);

      if (block) {
        await widgetStore.createVolatileWidget({
          id: widgetId,
          title: block.id,
          feature: blockType,
          dashboard: dashboardId.value,
          order: 0,
          config: {
            ...(activeWidget.value?.config ?? {}),
            serviceId: block.serviceId,
            blockId: block.id,
          },
          ...defaultWidgetSize,
          volatile: true,
        });
        activeWidget.value = widgetStore.widgetById(widgetId);
      }
      else {
        activeWidget.value = null;
      }
    }

    async function configureBlock(): Promise<void> {
      if (!canCreate.value) {
        return;
      }

      await ensureVolatile();

      if (createMode.value === 'new'
        && activeBlock.value
        && activeWidget.value) {
        activeDialog.value = createDialog({
          component: 'WidgetDialog',
          componentProps: {
            widgetId: activeWidget.value.id,
            mode: 'Full',
          },
        });
      }

      if (createMode.value === 'existing'
        && existingBlock.value
        && activeWidget.value) {
        createBlockDialog(blockAddress.value);
      }
    }

    async function createWidget(): Promise<void> {
      if (!canCreate.value) {
        return;
      }

      await ensureVolatile();

      if (createMode.value === 'new'
        && activeBlock.value
        && activeWidget.value
      ) {
        const block = await tryCreateBlock(activeBlock.value);
        if (!block) {
          return onClose();
        }
        const widget = await tryCreateWidget<BlockConfig>(activeWidget.value);
        return onDone({ block, widget });
      }

      if (createMode.value === 'existing'
        && existingBlock.value
        && activeWidget.value
      ) {
        const block = existingBlock.value;
        const widget = await tryCreateWidget<BlockConfig>(activeWidget.value);
        return onDone({ block, widget });
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
      newBlockId,
      serviceOpts,
      blockOpts,
      blockAddress,
      existingBlock,
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
          v-model="newBlockId"
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
        :disable="!canCreate"
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
