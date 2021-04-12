<script lang="ts">
import { computed, defineComponent, onBeforeMount, ref } from 'vue';

import { featureStore, QuickStartFeature } from '@/store/features';

import { useWizard } from '../composables';

export default defineComponent({
  name: 'QuickStartWizardPicker',
  props: {
    ...useWizard.props,
  },
  emits: [
    ...useWizard.emits,
  ],
  setup() {
    const {
      onBack,
      onClose,
      setDialogTitle,
    } = useWizard.setup();

    const model = ref<QuickStartFeature | null>(null);
    const wizardActive = ref<boolean>(false);

    function reset(): void {
      wizardActive.value = false;
      setDialogTitle('Quick start wizard');
    }

    onBeforeMount(() => reset());

    const wizardOpts = computed<QuickStartFeature[]>(
      () => featureStore.quickStarts.filter(qs => !!qs.component),
    );

    function next(): void {
      if (!model.value) { return; }
      setDialogTitle(`${model.value.title} wizard`);
      wizardActive.value = true;
    }

    function confirm(v: QuickStartFeature | null): void {
      model.value = v;
      next();
    }

    return {
      onBack,
      onClose,
      setDialogTitle,
      reset,
      model,
      wizardActive,
      wizardOpts,
      confirm,
      next,
    };
  },
});
</script>

<template>
  <!-- Display selected wizard -->
  <component
    :is="model.component"
    v-if="model && wizardActive"
    :feature-id="model.id"
    @title="setDialogTitle"
    @back="reset"
    @close="onClose"
  />

  <!-- Select a wizard -->
  <ActionCardBody v-else>
    <q-card-section>
      <q-item>
        <q-item-section class="text-weight-light">
          <q-item-label class="text-subtitle1">
            Control blocks
          </q-item-label>
          <p>
            Control blocks are small elements that run on the Brewblox Spark that are combined into a control system.
            Examples of control blocks are setpoints, sensors, actuators and PIDs.
          </p>
          <p>
            We have pre-configured sets of control blocks for common brewing setups.
            This wizard creates new blocks and sets up relations between them.
          </p>
          <q-item-label class="text-subtitle1">
            Tuning
          </q-item-label>
          <p>
            This wizard uses settings that we think will work for the average setup.
            You might have a more powerful heater, a smaller kettle or a bigger fridge.
          </p>
          <p>
            Do some test runs, look at the PID graphs and make adjustments to tune them to your hardware.
          </p>
          <q-item-label class="text-subtitle1">
            Dashboard
          </q-item-label>
          <p>
            This wizard will create a new dashboard to show the most relevant values in your setup.
            The dashboard will have a graph, a graphical overview of your system
            and quick actions to change multiple blocks at once.
          </p>
        </q-item-section>
      </q-item>
    </q-card-section>
    <div class="q-mx-md q-mb-md q-px-sm q-gutter-sm column">
      <div class="text-subtitle1">
        Please select a brewing process
      </div>
      <ListSelect
        v-model="model"
        :options="wizardOpts"
        option-value="id"
        option-label="title"
        @confirm="confirm"
      />
    </div>

    <template #actions>
      <q-btn unelevated label="Back" @click="onBack" />
      <q-space />
      <q-btn
        :disable="!model"
        unelevated
        label="Next"
        color="primary"
        @click="next"
      />
    </template>
  </ActionCardBody>
</template>
