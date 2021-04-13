<script lang="ts">
import { computed, defineComponent, onBeforeMount, ref } from 'vue';

import { featureStore } from '@/store/features';
import { systemStore } from '@/store/system';
import { createDialog } from '@/utils/dialog';
import { objectStringSorter } from '@/utils/functional';

import { useWizard } from '../composables';

interface WidgetFeatureOption {
  label: string,
  value: string,
  component: string,
  badge: string | null,
}

export default defineComponent({
  name: 'WidgetWizardPicker',
  props: {
    ...useWizard.props,
  },
  emits: [
    ...useWizard.emits,
  ],
  setup() {
    const feature = ref<WidgetFeatureOption | null>(null);
    const wizardActive = ref<boolean>(false);
    const filter = ref<string>('');
    const {
      onBack,
      onClose,
      onDone,
      setDialogTitle,
    } = useWizard.setup();

    function reset(): void {
      wizardActive.value = false;
      setDialogTitle('Widget wizard');
      filter.value = '';
    }

    onBeforeMount(() => reset());

    const experimental = computed<boolean>(
      () => systemStore.config.experimental,
    );

    const wizardOpts = computed<WidgetFeatureOption[]>(
      () => featureStore.widgets
        .filter(feature => experimental.value || !feature.experimental)
        .map(feature => ({
          label: feature.title,
          value: feature.id,
          component: featureStore.widgetWizard(feature.id),
          badge: feature.experimental ? 'experimental' : null,
        }))
        .filter((opt): opt is WidgetFeatureOption => opt.component !== null)
        .sort(objectStringSorter('label')),
    );

    const filteredOpts = computed<SelectOption[]>(
      () => {
        if (!filter.value) {
          return wizardOpts.value;
        }
        const needle = filter.value.toLowerCase();
        return wizardOpts
          .value
          .filter(opt => opt.label.toLowerCase().match(needle));
      },
    );

    const valuesOk = computed<boolean>(
      () => feature.value !== null,
    );

    function showSearchKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: filter.value,
        },
      })
        .onOk((v: string) => filter.value = v);
    }

    function next(): void {
      if (feature.value === null) { return; }
      wizardActive.value = true;
      setDialogTitle(`${feature.value.label} wizard`);
    }

    function confirm(opt: WidgetFeatureOption | null): void {
      feature.value = opt;
      next();
    }

    return {
      onBack,
      onClose,
      onDone,
      setDialogTitle,
      filter,
      feature,
      wizardActive,
      reset,
      filteredOpts,
      valuesOk,
      showSearchKeyboard,
      next,
      confirm,
    };
  },
});
</script>

<template>
  <component
    :is="feature.component"
    v-if="feature && wizardActive"
    :feature-id="feature.value"
    :active-dashboard-id="activeDashboardId"
    @title="setDialogTitle"
    @back="reset"
    @close="onClose"
    @done="onDone"
  />

  <ActionCardBody v-else @keyup.ctrl.enter="next">
    <div class="widget-body column">
      <q-input
        v-model="filter"
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
        v-model="feature"
        :options="filteredOpts"
        option-value="value"
        option-label="label"
        @confirm="confirm"
      />
    </div>

    <template #actions>
      <q-btn
        unelevated
        label="Back"
        @click="onBack"
      />
      <q-space />
      <q-btn
        :disable="!valuesOk"
        unelevated
        label="Next"
        color="primary"
        @click="next"
      />
    </template>
  </ActionCardBody>
</template>
