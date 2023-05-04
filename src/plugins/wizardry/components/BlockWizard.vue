<script lang="ts">
import { useBlockSpecStore, useSparkStore } from '@/plugins/spark/store';
import { ComparedBlockType } from '@/plugins/spark/types';
import { makeBlockIdRules } from '@/plugins/spark/utils/configuration';
import { isCompatible, isSystemBlockType } from '@/plugins/spark/utils/info';
import { tryCreateBlock, tryCreateWidget } from '@/plugins/wizardry';
import { useFeatureStore } from '@/store/features';
import { createDialog } from '@/utils/dialog';
import { makeObjectSorter, nullFilter } from '@/utils/functional';
import { makeRuleValidator, suggestId } from '@/utils/rules';
import { BlockIntfType, UserBlockType } from 'brewblox-proto/ts';
import { nanoid } from 'nanoid';
import { computed, defineComponent, onBeforeMount, PropType, ref } from 'vue';
import { useWizard } from '../composables';

export default defineComponent({
  name: 'BlockWizard',
  props: {
    ...useWizard.props,
    activeServiceId: {
      type: String,
      default: null,
    },
    compatible: {
      type: [String, Array] as PropType<ComparedBlockType>,
      default: null,
    },
    filter: {
      type: Function as PropType<(feature: string) => boolean>,
      default: () => true,
    },
  },
  emits: [...useWizard.emits],
  setup(props) {
    const featureStore = useFeatureStore();
    const sparkStore = useSparkStore();
    const specStore = useBlockSpecStore();
    const { onBack, onClose, onDone, dialogTitle } = useWizard.setup();

    const selected = ref<SelectOption<UserBlockType> | null>(null);
    const lastGeneratedId = ref<string>('');
    const serviceId = ref<string | null>(
      props.activeServiceId ?? sparkStore.serviceIds[0] ?? null,
    );
    const widgetId = nanoid();
    const dashboardId = ref<string | null>(null);
    const blockId = ref<string | null>(null);
    const searchFilter = ref<string>('');

    const discoveryActive = ref<boolean>(false);

    const serviceOpts = computed<string[]>(() => sparkStore.serviceIds);

    const wizardOpts = computed<SelectOption<UserBlockType>[]>(() =>
      specStore.blockSpecs
        .filter(
          (spec) =>
            !isSystemBlockType(spec.type) &&
            isCompatible(spec.type, props.compatible) &&
            props.filter(spec.type),
        )
        .map((spec) => {
          const feature = featureStore.widgetById(spec.type);
          return feature
            ? {
                value: spec.type as UserBlockType,
                label: feature.title,
              }
            : null;
        })
        .filter(nullFilter)
        .sort(makeObjectSorter('label')),
    );

    const activeBlockIdRules = computed<InputRule[]>(() =>
      serviceId.value
        ? makeBlockIdRules(serviceId.value)
        : [() => 'No service selected'],
    );

    const validator = computed<(v: any) => boolean>(() =>
      makeRuleValidator(activeBlockIdRules.value),
    );

    const createReady = computed<boolean>(
      () =>
        selected.value !== null &&
        sparkStore.has(serviceId.value) &&
        validator.value(blockId.value),
    );

    const discoveredType = computed<boolean>(() =>
      isCompatible(selected.value?.value, BlockIntfType.OneWireDeviceInterface),
    );

    const searchedOpts = computed<SelectOption[]>(() => {
      if (!searchFilter.value) {
        return wizardOpts.value;
      }
      const needle = searchFilter.value.toLowerCase();
      return wizardOpts.value.filter((opt) =>
        opt.label.toLowerCase().match(needle),
      );
    });

    function showSearchKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: searchFilter.value,
        },
      }).onOk((v) => (searchFilter.value = v));
    }

    function showNameKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: blockId.value ?? '',
          rules: activeBlockIdRules.value,
        },
      }).onOk((v) => (blockId.value = v));
    }

    function selectOpt(opt: SelectOption<UserBlockType> | null): void {
      selected.value = opt;
      if (opt === null) {
        return;
      } else if (!blockId.value || blockId.value === lastGeneratedId.value) {
        blockId.value = suggestId(opt.label, validator.value);
        lastGeneratedId.value = blockId.value;
      }
    }

    function reset(): void {
      discoveryActive.value = false;
      dialogTitle.value = 'Block wizard';
    }

    async function createBlock(): Promise<void> {
      if (
        !createReady.value ||
        !sparkStore.has(serviceId.value) ||
        !blockId.value ||
        !selected.value
      ) {
        return;
      }

      const createdBlock = await tryCreateBlock({
        id: blockId.value,
        serviceId: serviceId.value,
        type: selected.value.value,
        data: specStore.blockSpecByType(selected.value.value).generate(),
      });

      if (!createdBlock) {
        return close();
      }

      const createdWidget = dashboardId.value
        ? await tryCreateWidget({
            id: widgetId,
            title: createdBlock.id,
            feature: createdBlock.type,
            dashboard: dashboardId.value ?? '',
            order: 0,
            config: {
              serviceId: createdBlock.serviceId,
              blockId: createdBlock.id,
            },
            ...featureStore.widgetSize(createdBlock.type),
          })
        : null;

      onDone({ block: createdBlock, widget: createdWidget });
    }

    onBeforeMount(() => reset());

    return {
      onBack,
      onClose,
      onDone,
      selected,
      serviceId,
      dashboardId,
      blockId,
      searchFilter,
      discoveryActive,
      serviceOpts,
      wizardOpts,
      activeBlockIdRules,
      validator,
      createReady,
      discoveredType,
      searchedOpts,
      showSearchKeyboard,
      showNameKeyboard,
      selectOpt,
      reset,
      createBlock,
    };
  },
});
</script>

<template>
  <BlockDiscoveryWizard
    v-if="discoveryActive && selected"
    :feature-id="selected.value"
    :active-dashboard-id="dashboardId"
    :active-service-id="serviceId"
    optional-widget
    @back="reset"
    @close="onClose"
    @done="onDone"
  />

  <WizardBody v-else>
    <div class="widget-body column">
      <q-select
        v-model="serviceId"
        :options="serviceOpts"
        label="Service"
        @keyup.enter.exact.stop
      />

      <DashboardSelect
        v-model="dashboardId"
        label="Show on dashboard (optional)"
        clearable
      />

      <q-input
        v-model="searchFilter"
        placeholder="Search"
        clearable
        autofocus
        class="q-mb-md"
      >
        <template #append>
          <KeyboardButton @click="showSearchKeyboard" />
          <q-icon name="search" />
        </template>
      </q-input>

      <ListSelect
        :model-value="selected"
        :options="searchedOpts"
        option-value="value"
        option-label="label"
        @update:model-value="selectOpt"
        @confirm="
          (v) => {
            selectOpt(v);
            createBlock();
          }
        "
      />
    </div>

    <template #actions>
      <q-input
        v-model="blockId"
        :disable="discoveredType"
        :rules="activeBlockIdRules"
        label="Block name"
        clearable
        class="col-12"
      >
        <template #append>
          <KeyboardButton @click="showNameKeyboard" />
          <q-icon name="mdi-information">
            <q-tooltip>
              The name of the Spark Controller block. <br />
              Multiple widgets can display the same block. <br />
              Rules:
              <ul>
                <li>The name must not be empty.</li>
                <li>The name must be unique.</li>
                <li>The name must begin with a letter.</li>
                <li>
                  The name may only contain alphanumeric characters, space, and
                  _-()|.
                </li>
                <li>The name must be less than 200 characters.</li>
              </ul>
            </q-tooltip>
          </q-icon>
        </template>
      </q-input>
      <q-btn
        flat
        label="Back"
        @click="onBack"
      />
      <q-space />
      <template v-if="discoveredType">
        <q-btn
          unelevated
          label="Discover"
          color="primary"
          @click="discoveryActive = true"
        />
      </template>
      <template v-else>
        <q-btn
          :disable="!createReady"
          unelevated
          label="Create"
          color="primary"
          @click="createBlock"
        />
      </template>
    </template>
  </WizardBody>
</template>
