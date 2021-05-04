<script lang="ts">
import isMatch from 'lodash/isMatch';
import { computed, defineComponent, nextTick, onBeforeUnmount, ref } from 'vue';

import { sparkStore } from '@/plugins/spark/store';
import { Block, BlockAddress, BlockConfig, BlockType } from '@/plugins/spark/types';
import { makeBlockIdRules } from '@/plugins/spark/utils';
import { tryCreateBlock, tryCreateWidget } from '@/plugins/wizardry';
import { useWidgetWizard } from '@/plugins/wizardry/composables';
import { Widget, widgetStore } from '@/store/widgets';
import { createDialog } from '@/utils/dialog';
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

    const serviceId = ref<string | null>(sparkStore.serviceIds[0] ?? null);
    const dashboardId = ref<string | null>(props.activeDashboardId ?? null);

    const serviceOpts = computed<string[]>(
      () => sparkStore.serviceIds,
    );

    const blockOpts = computed<Block[]>(
      () => sparkStore.serviceBlocks(serviceId.value)
        .filter(block => block.type === props.featureId)
        .sort(objectStringSorter('id')),
    );

    const blockIdRules = computed<InputRule[]>(
      () => serviceId.value
        ? makeBlockIdRules(serviceId.value)
        : [],
    );

    const blockIdValidator = computed<(v: string) => boolean>(
      () => ruleValidator(blockIdRules.value),
    );

    const existingBlockId = ref<string | null>(null);
    const newBlockId = ref<string>(suggestId(featureTitle, blockIdValidator.value));

    const existingBlockAddress = computed<BlockAddress>({
      get: () => ({
        serviceId: serviceId.value,
        id: existingBlockId.value,
        type: blockType,
      }),
      set: addr => existingBlockId.value = addr.id,
    });

    const newBlockAddress = computed<BlockAddress>({
      get: () => ({
        serviceId: serviceId.value,
        id: newBlockId.value,
        type: blockType,
      }),
      set: addr => newBlockId.value = addr.id ?? '',
    });

    const existingBlock = computed<Block | null>(
      () => sparkStore.blockByAddress(existingBlockAddress.value),
    );
    const newBlock = ref<Block | null>(null);

    const newWidget = ref<Widget<BlockConfig> | null>(null);

    const canCreate = computed<boolean>(
      () => {
        if (!serviceId.value || !dashboardId.value) {
          return false;
        }
        if (createMode.value === 'new') {
          return newBlock.value !== null
            || blockIdValidator.value(newBlockId.value);
        }
        if (createMode.value === 'existing') {
          return existingBlock.value !== null;
        }
        return true;
      },
    );

    function showIdKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: newBlockId.value,
          rules: blockIdRules.value,
        },
      });
    }

    function generateVolatileObjects(): void {
      if (!serviceId.value || !dashboardId.value || !canCreate.value) {
        return;
      }

      if (createMode.value === 'new') {
        const blockData: Block['data'] =
          newBlock.value?.data
          ?? sparkStore.spec({ type: blockType }).generate();

        if (newBlock.value && !isMatch(newBlock.value, newBlockAddress.value)) {
          sparkStore.removeVolatileBlock(newBlock.value);
          newBlock.value = null;
        }

        if (!newBlock.value) {
          sparkStore.setVolatileBlock({
            id: newBlockId.value,
            serviceId: serviceId.value,
            type: blockType,
            groups: [0],
            data: blockData,
          });
          newBlock.value = sparkStore.blockByAddress(newBlockAddress.value);
        }
      }

      const actualBlock = createMode.value === 'new'
        ? newBlock.value
        : existingBlock.value;

      if (actualBlock) {
        widgetStore.setVolatileWidget({
          id: widgetId,
          title: actualBlock.id,
          feature: blockType,
          dashboard: dashboardId.value,
          order: 0,
          config: {
            ...(newWidget.value?.config ?? {}),
            serviceId: actualBlock.serviceId,
            blockId: actualBlock.id,
          },
          ...defaultWidgetSize,
          volatile: true,
        });
        newWidget.value = widgetStore.widgetById(widgetId);
      }
    }

    async function configureBlock(): Promise<void> {
      generateVolatileObjects();
      await nextTick();

      if (!canCreate.value) {
        return;
      }

      createDialog({
        component: 'WidgetDialog',
        componentProps: {
          widgetId,
          mode: 'Full',
        },
      });
    }

    async function finish(): Promise<void> {
      generateVolatileObjects();
      await nextTick();

      if (!canCreate.value) {
        return;
      }

      const persistentWidget = { ...newWidget.value!, volatile: undefined };
      const widget = await tryCreateWidget<BlockConfig>(persistentWidget);

      if (!widget) {
        return onClose();
      }

      if (createMode.value === 'new') {
        const persistentBlock = { ...newBlock.value!, meta: undefined };
        const createdBlock = await tryCreateBlock(persistentBlock);
        if (!createdBlock) {
          widgetStore.removeWidget(widget);
          return onClose();
        }
      }

      const block = createMode.value === 'new'
        ? sparkStore.blockByAddress(newBlockAddress.value)
        : sparkStore.blockByAddress(existingBlockAddress.value);

      return onDone({ block, widget });
    }

    onBeforeUnmount(() => {
      sparkStore.removeVolatileBlock(newBlockAddress.value);
      widgetStore.removeVolatileWidget({ id: widgetId });
    });

    return {
      featureTitle,
      onBack,
      createMode,
      createModeOpts,
      serviceId,
      dashboardId,
      existingBlockId,
      blockIdRules,
      blockIdValidator,
      newBlockId,
      serviceOpts,
      blockOpts,
      existingBlockAddress,
      existingBlock,
      canCreate,
      showIdKeyboard,
      configureBlock,
      finish,
    };
  },
});
</script>

<template>
  <WizardBody>
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
          :rules="blockIdRules"
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
          v-model="existingBlockAddress"
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
        @click="finish"
      />
    </template>
  </WizardBody>
</template>
