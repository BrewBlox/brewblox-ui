<script lang="ts">
import { useBlockSpecStore, useSparkStore } from '@/plugins/spark/store';
import { BlockAddress, BlockConfig } from '@/plugins/spark/types';
import { makeBlockIdRules } from '@/plugins/spark/utils/configuration';
import { tryCreateBlock, tryCreateWidget } from '@/plugins/wizardry';
import { useWidgetWizard } from '@/plugins/wizardry/composables';
import { createDialog } from '@/utils/dialog';
import { makeObjectSorter } from '@/utils/functional';
import { makeRuleValidator, suggestId } from '@/utils/rules';
import { Block, BlockType } from 'brewblox-proto/ts';
import { computed, defineComponent, PropType, ref } from 'vue';

type CreateMode = 'new' | 'existing';

const createModeOpts: SelectOption<CreateMode>[] = [
  { label: 'Create new block', value: 'new' },
  { label: 'Use existing block', value: 'existing' },
];

export default defineComponent({
  name: 'BlockWidgetWizard',
  props: {
    ...useWidgetWizard.props,
    featureId: {
      type: String as PropType<BlockType>,
      required: true,
    },
    singleMode: {
      type: String as PropType<CreateMode | undefined>,
      default: undefined,
    },
  },
  emits: [...useWidgetWizard.emits],
  setup(props) {
    const sparkStore = useSparkStore();
    const specStore = useBlockSpecStore();
    const {
      widgetId,
      featureTitle,
      defaultWidgetSize,
      onBack,
      onClose,
      onDone,
    } = useWidgetWizard.setup(props.featureId);

    const createMode = ref<CreateMode>(props.singleMode ?? 'new');

    const serviceId = ref<string | null>(sparkStore.serviceIds[0] ?? null);
    const dashboardId = ref<string | null>(props.activeDashboardId ?? null);

    const serviceOpts = computed<string[]>(() => sparkStore.serviceIds);

    const blockOpts = computed<Block[]>(() =>
      sparkStore
        .blocksByService(serviceId.value)
        .filter((block) => block.type === props.featureId)
        .sort(makeObjectSorter('id')),
    );

    const blockIdRules = computed<InputRule[]>(() =>
      serviceId.value ? makeBlockIdRules(serviceId.value) : [],
    );

    const blockIdValidator = computed<(v: string) => boolean>(() =>
      makeRuleValidator(blockIdRules.value),
    );

    const newBlockId = ref<string>(
      suggestId(featureTitle, blockIdValidator.value),
    );

    const newBlockAddress = computed<BlockAddress>(() => ({
      serviceId: serviceId.value,
      id: newBlockId.value,
      type: props.featureId,
    }));

    const existingBlockId = ref<string | null>(null);
    const existingBlockAddress = computed<BlockAddress>({
      get: () => ({
        serviceId: serviceId.value,
        id: existingBlockId.value,
        type: props.featureId,
      }),
      set: (addr) => (existingBlockId.value = addr.id),
    });

    const existingBlock = computed<Block | null>(() =>
      sparkStore.blockByAddress(existingBlockAddress.value),
    );

    const newWidgetConfig = ref<BlockConfig | null>(null);

    const canCreate = computed<boolean>(() => {
      if (!serviceId.value || !dashboardId.value) {
        return false;
      }
      if (createMode.value === 'new') {
        return blockIdValidator.value(newBlockId.value);
      }
      if (createMode.value === 'existing') {
        return existingBlock.value !== null;
      }
      return true;
    });

    function showIdKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: newBlockId.value,
          rules: blockIdRules.value,
        },
      });
    }

    async function finish(): Promise<void> {
      if (!serviceId.value || !dashboardId.value || !canCreate.value) {
        return;
      }

      const blockId =
        createMode.value === 'new' ? newBlockId.value : existingBlockId.value!;

      const widget = await tryCreateWidget<BlockConfig>({
        id: widgetId,
        title: blockId,
        feature: props.featureId,
        dashboard: dashboardId.value,
        order: 0,
        config: {
          ...(newWidgetConfig.value ?? {}),
          serviceId: serviceId.value,
          blockId,
        },
        ...defaultWidgetSize,
      });

      if (!widget) {
        return onClose();
      }

      if (createMode.value === 'new') {
        const createdBlock = await tryCreateBlock({
          id: newBlockId.value,
          serviceId: serviceId.value,
          type: props.featureId,
          data: specStore.blockSpecByType(props.featureId)!.generate(),
        });

        if (!createdBlock) {
          return onClose();
        }
      }

      const block =
        createMode.value === 'new'
          ? sparkStore.blockByAddress(newBlockAddress.value)
          : sparkStore.blockByAddress(existingBlockAddress.value);

      return onDone({ block, widget });
    }

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
      finish,
    };
  },
});
</script>

<template>
  <WizardBody>
    <div class="widget-body column">
      <q-btn-toggle
        v-if="!singleMode"
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
                <br />Multiple widgets can display the same block. <br />Rules:
                <ul>
                  <li>The name must not be empty.</li>
                  <li>The name must be unique.</li>
                  <li>The name must begin with a letter.</li>
                  <li>
                    The name may only contain alphanumeric characters, space,
                    and _-()|.
                  </li>
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
      <q-btn
        flat
        label="Back"
        @click="onBack"
      />
      <q-space />
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
