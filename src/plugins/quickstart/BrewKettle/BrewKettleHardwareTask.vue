<script lang="ts">
import { computed, defineComponent, onBeforeMount, PropType, ref } from 'vue';

import { sparkStore } from '@/plugins/spark/store';
import { createBlockWizard } from '@/plugins/wizardry';

import { PinChannel } from '../types';
import { BrewKettleConfig } from './types';

export default defineComponent({
  name: 'BrewKettleHardwareTask',
  props: {
    config: {
      type: Object as PropType<BrewKettleConfig>,
      required: true,
    },
  },
  emits: [
    'update:config',
    'back',
    'next',
  ],
  setup(props, { emit }) {
    const kettlePin = ref<PinChannel | null>(props.config.kettlePin ?? null);
    const kettleSensor = ref<string | null>(props.config.kettleSensor ?? null);

    const valuesOk = computed<boolean>(
      () => Boolean(kettlePin.value && kettleSensor.value),
    );

    function discover(): void {
      sparkStore.moduleById(props.config.serviceId)?.fetchDiscoveredBlocks();
    }

    function startBlockWizard(): void {
      createBlockWizard(props.config.serviceId);
    }

    function taskDone(): void {
      if (!valuesOk.value) {
        return;
      }
      const updated: BrewKettleConfig = {
        ...props.config,
        kettlePin: kettlePin.value!,
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

    return {
      kettlePin,
      kettleSensor,
      valuesOk,
      discover,
      startBlockWizard,
      taskDone,
    };
  },
});
</script>

<template>
  <ActionCardBody>
    <q-card-section>
      <q-item>
        <q-item-section>
          <q-item-label class="text-subtitle1">
            Assign Hardware blocks
          </q-item-label>
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn flat round icon="refresh" @click="discover">
            <q-tooltip>Discover OneWire blocks</q-tooltip>
          </q-btn>
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn flat round icon="add" @click="startBlockWizard">
            <q-tooltip>Create new Block</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>
      <q-item class="text-weight-light">
        <q-item-section>
          <p>
            Select which hardware should be used for each function.<br>
            You can unplug or heat sensors to identify them.
            The current value will be shown under each dropdown menu.
          </p>
          <p>
            Use the buttons above to discover new OneWire blocks or manually create a block.
          </p>
        </q-item-section>
      </q-item>
      <QuickstartMockCreateField
        :service-id="config.serviceId"
        :names="[
          config.names.kettleSensor,
        ]"
      />
      <q-item>
        <q-item-section>
          <QuickstartPinField
            v-model="kettlePin"
            :service-id="config.serviceId"
            label="Output pin"
          />
        </q-item-section>
        <q-item-section>
          <QuickstartSensorField
            v-model="kettleSensor"
            :service-id="config.serviceId"
            label="Sensor"
          />
        </q-item-section>
      </q-item>
    </q-card-section>

    <template #actions>
      <q-btn unelevated label="Back" @click="$emit('back')" />
      <q-space />
      <q-btn
        :disable="!valuesOk"
        unelevated
        label="Next"
        color="primary"
        @click="taskDone"
      />
    </template>
  </ActionCardBody>
</template>
