<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  useDialog,
  UseDialogEmits,
  UseDialogProps,
  useGlobals,
} from '@/composables';
import { QuickstartFeature, useFeatureStore } from '@/store/features';

defineProps<UseDialogProps>();

defineEmits<UseDialogEmits>();

const { dialogRef, dialogOpts, onDialogHide } = useDialog.setup();
const { dense } = useGlobals.setup();
const featureStore = useFeatureStore();

const selectedQuickstart = ref<QuickstartFeature | null>(null);
const wizardActive = ref<boolean>(false);

const quickstartOpts = computed<QuickstartFeature[]>(
  () => featureStore.quickStarts,
);
</script>

<template>
  <q-dialog
    ref="dialogRef"
    :maximized="dense"
    v-bind="dialogOpts"
    @hide="onDialogHide"
  >
    <!-- Display selected wizard -->
    <QuickstartTaskMaster
      v-if="selectedQuickstart && wizardActive"
      :tasks="selectedQuickstart.tasks"
      :title="`${selectedQuickstart.title} wizard`"
      @back="wizardActive = false"
      @close="onDialogHide"
    />

    <!-- Select a wizard -->
    <Card v-else>
      <template #toolbar>
        <Toolbar
          icon="mdi-creation"
          title="Quickstart wizard"
        />
      </template>

      <q-card-section>
        <q-item>
          <q-item-section class="text-weight-light">
            <q-item-label class="text-subtitle1"> Control blocks </q-item-label>
            <p>
              Control blocks are small elements that run on the Brewblox Spark
              that are combined into a control system. Examples of control
              blocks are setpoints, sensors, actuators and PIDs.
            </p>
            <p>
              We have pre-configured sets of control blocks for common brewing
              setups. This wizard creates new blocks and sets up relations
              between them.
            </p>
            <q-item-label class="text-subtitle1"> Tuning </q-item-label>
            <p>
              This wizard uses settings that we think will work for the average
              setup. You might have a more powerful heater, a smaller kettle or
              a bigger fridge.
            </p>
            <p>
              Do some test runs, look at the PID graphs and make adjustments to
              tune them to your hardware.
            </p>
            <q-item-label class="text-subtitle1"> Dashboard </q-item-label>
            <p>
              This wizard will create a new dashboard to show the most relevant
              values in your setup. The dashboard will have a graph, a graphical
              overview of your system and quick actions to change multiple
              blocks at once.
            </p>
          </q-item-section>
        </q-item>
      </q-card-section>
      <div class="q-mx-md q-mb-md q-px-sm q-gutter-sm column">
        <div class="text-subtitle1">Please select a brewing process</div>
        <ListSelect
          v-model="selectedQuickstart"
          :options="quickstartOpts"
          option-value="id"
          option-label="title"
          @confirm="
            (qs) => {
              selectedQuickstart = qs;
              wizardActive = true;
            }
          "
        />
      </div>
      <template #actions>
        <q-space />
        <q-btn
          :disable="!selectedQuickstart"
          unelevated
          label="Next"
          color="primary"
          @click="wizardActive = true"
        />
      </template>
    </Card>
  </q-dialog>
</template>
