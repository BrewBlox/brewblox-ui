<script lang="ts">
import { useFeatureStore } from '@/store/features';
import { userUISettings } from '@/user-settings';
import { createDialog } from '@/utils/dialog';
import { makeObjectSorter } from '@/utils/functional';
import { computed, defineComponent, onBeforeMount, ref } from 'vue';
import { useWizard } from '../composables';

interface WidgetFeatureOption {
  label: string;
  value: string;
  component: string;
  badge: string | null;
}

export default defineComponent({
  name: 'WidgetWizardPicker',
  props: {
    ...useWizard.props,
  },
  emits: [...useWizard.emits],
  setup() {
    const featureStore = useFeatureStore();
    const feature = ref<WidgetFeatureOption | null>(null);
    const wizardActive = ref<boolean>(false);
    const filter = ref<string>('');
    const { onBack, onClose, onDone, dialogTitle } = useWizard.setup();

    function reset(): void {
      wizardActive.value = false;
      dialogTitle.value = 'Widget wizard';
      filter.value = '';
    }

    onBeforeMount(() => reset());

    const experimental = computed<boolean>(
      () => userUISettings.value.experimental,
    );

    const wizardOpts = computed<WidgetFeatureOption[]>(() =>
      featureStore.widgets
        .filter((feature) => experimental.value || !feature.experimental)
        .map((feature) => ({
          label: feature.title,
          value: feature.id,
          component: featureStore.widgetWizard(feature.id),
          badge: feature.experimental ? 'experimental' : null,
        }))
        .filter((opt): opt is WidgetFeatureOption => opt.component !== null)
        .sort(makeObjectSorter('label')),
    );

    const filteredOpts = computed<SelectOption[]>(() => {
      if (!filter.value) {
        return wizardOpts.value;
      }
      const needle = filter.value.toLowerCase();
      return wizardOpts.value.filter((opt) =>
        opt.label.toLowerCase().match(needle),
      );
    });

    const valuesOk = computed<boolean>(() => feature.value !== null);

    function showSearchKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: filter.value,
        },
      }).onOk((v: string) => (filter.value = v));
    }

    function next(): void {
      if (feature.value === null) {
        return;
      }
      wizardActive.value = true;
      dialogTitle.value = `${feature.value.label} wizard`;
    }

    function confirm(opt: WidgetFeatureOption | null): void {
      feature.value = opt;
      next();
    }

    return {
      onBack,
      onClose,
      onDone,
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
    @back="reset"
    @close="onClose"
    @done="onDone"
  />

  <WizardBody
    v-else
    @keyup.ctrl.enter="next"
  >
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
  </WizardBody>
</template>
