<script setup lang="ts">
import { computed, onBeforeMount, reactive, ref } from 'vue';
import { useSparkStore } from '@/plugins/spark/store';
import { createDialog } from '@/utils/dialog';
import { UseTaskEmits, UseTaskProps } from '../composables';
import { GpioChange, IoChannelAddress } from '../types';
import { resetGpioChanges } from '../utils';
import { BrewKettleConfig } from './types';

const props = defineProps<UseTaskProps<BrewKettleConfig>>();

const emit = defineEmits<UseTaskEmits<BrewKettleConfig>>();

const sparkStore = useSparkStore();
const kettleChannel = ref<IoChannelAddress | null>(
  props.config.kettleChannel ?? null,
);
const kettleSensor = ref<string | null>(props.config.kettleSensor ?? null);
const changedGpio = reactive<GpioChange[]>(
  props.config.changedGpio ?? resetGpioChanges(props.config.serviceId),
);

const valuesOk = computed<boolean>(() =>
  Boolean(kettleChannel.value && kettleSensor.value),
);

function discover(): void {
  sparkStore.fetchDiscoveredBlocks(props.config.serviceId);
}

function startBlockWizard(): void {
  createDialog({
    component: 'BlockWizardDialog',
    componentProps: {
      serviceId: props.config.serviceId,
    },
  });
}

function taskDone(): void {
  if (!valuesOk.value) {
    return;
  }
  const updated: BrewKettleConfig = {
    ...props.config,
    changedGpio,
    kettleChannel: kettleChannel.value!,
    kettleSensor: kettleSensor.value!,
    renamedBlocks: {
      ...props.config.renamedBlocks,
      [kettleSensor.value!]: props.config.names.kettleSensor,
    },
  };
  emit('update:config', updated);
  emit('next');
}

onBeforeMount(() => discover());
</script>

<template>
  <QuickstartCard>
    <q-card-section>
      <q-item>
        <q-item-section>
          <q-item-label class="text-subtitle1">
            Assign Hardware blocks
          </q-item-label>
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn
            flat
            round
            icon="refresh"
            @click="discover"
          >
            <q-tooltip>Discover OneWire blocks</q-tooltip>
          </q-btn>
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn
            flat
            round
            icon="add"
            @click="startBlockWizard"
          >
            <q-tooltip>Create new Block</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>
      <q-item class="text-weight-light">
        <q-item-section>
          <p>
            Select which hardware should be used for each function.<br />
            You can unplug or heat sensors to identify them. The current value
            will be shown under each dropdown menu.
          </p>
          <p>
            Use the buttons above to discover new OneWire blocks or manually
            create a block.
          </p>
        </q-item-section>
      </q-item>
      <QuickstartMockCreateField
        :service-id="config.serviceId"
        :names="[config.names.kettleSensor]"
      />
      <q-item>
        <q-item-section>
          <q-item-section>
            <QuickstartSensorField
              v-model="kettleSensor"
              :service-id="config.serviceId"
              label="Sensor"
            />
          </q-item-section>
          <QuickstartChannelField
            v-model="kettleChannel"
            :service-id="config.serviceId"
            :changed-gpio="changedGpio"
            :desc="`${config.prefix} heater`"
            label="Output pin"
          />
        </q-item-section>
      </q-item>
    </q-card-section>

    <template #actions>
      <q-btn
        unelevated
        label="Back"
        @click="$emit('back')"
      />
      <q-space />
      <q-btn
        :disable="!valuesOk"
        unelevated
        label="Next"
        color="primary"
        @click="taskDone"
      />
    </template>
  </QuickstartCard>
</template>
