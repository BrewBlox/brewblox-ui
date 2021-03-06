<script lang="ts">
import { computed, defineComponent, onBeforeMount, PropType, ref } from 'vue';

import { sparkStore } from '@/plugins/spark/store';
import { createBlockWizard } from '@/plugins/wizardry';

import { PinChannel } from '../types';
import { hasShared } from '../utils';
import { FermentConfig } from './types';

export default defineComponent({
  name: 'FermentHardwareTask',
  props: {
    config: {
      type: Object as PropType<FermentConfig>,
      required: true,
    },
  },
  emits: [
    'update:config',
    'back',
    'next',
  ],
  setup(props, { emit }) {
    const coolPin = ref<PinChannel | null>(props.config.coolPin ?? null);
    const heatPin = ref<PinChannel | null>(props.config.heatPin ?? null);
    const fridgeSensor = ref<string | null>(props.config.fridgeSensor ?? null);
    const beerSensor = ref<string | null>(props.config.beerSensor ?? null);

    const pinSame = computed<boolean>(
      () => hasShared([coolPin.value, heatPin.value]),
    );

    const sensorSame = computed<boolean>(
      () => hasShared([fridgeSensor.value, beerSensor.value]),
    );

    const valuesOk = computed<boolean>(
      () => [
        coolPin.value,
        heatPin.value,
        !pinSame.value,
        fridgeSensor.value,
        beerSensor.value,
        !sensorSame.value,
      ]
        .every(Boolean),
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
      const updates: Partial<FermentConfig> = {
        heatPin: heatPin.value!,
        coolPin: coolPin.value!,
        fridgeSensor: fridgeSensor.value!,
        beerSensor: beerSensor.value!,
        renamedBlocks: {
          [fridgeSensor.value!]: props.config.names.fridgeSensor,
          [beerSensor.value!]: props.config.names.beerSensor,
        },
      };
      emit('update:config', { ...props.config, ...updates });
      emit('next');
    }

    onBeforeMount(() => discover());

    return {
      coolPin,
      heatPin,
      fridgeSensor,
      beerSensor,
      pinSame,
      sensorSame,
      valuesOk,
      discover,
      startBlockWizard,
      taskDone,
    };
  },
});
</script>

<template>
  <WizardBody>
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
          <p>
            We will also set some constraints on the heater and cooler:
            <ul>
              <li>Minimum ON and OFF times to protect the compressor</li>
              <li>Minimum wait times for switching between heating and cooling</li>
            </ul>
          </p>
        </q-item-section>
      </q-item>
      <QuickstartMockCreateField
        :service-id="config.serviceId"
        :names="[
          config.names.fridgeSensor,
          config.names.beerSensor,
        ]"
      />
      <q-item>
        <q-item-section>
          <QuickstartPinField
            v-model="coolPin"
            :service-id="config.serviceId"
            :error="pinSame"
            label="Cooler output"
          />
        </q-item-section>
        <q-item-section>
          <QuickstartPinField
            v-model="heatPin"
            :service-id="config.serviceId"
            :error="pinSame"
            label="Heater output"
          />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <QuickstartSensorField
            v-model="fridgeSensor"
            :service-id="config.serviceId"
            :error="sensorSame"
            label="Fridge Sensor"
          />
        </q-item-section>
        <q-item-section>
          <QuickstartSensorField
            v-model="beerSensor"
            :service-id="config.serviceId"
            :error="sensorSame"
            label="Beer Sensor"
          />
        </q-item-section>
      </q-item>
      <CardWarning v-if="pinSame">
        <template #message>
          Multiple outputs are using the same Pin.
        </template>
      </CardWarning>
      <CardWarning v-if="sensorSame">
        <template #message>
          Multiple sensors are using the same Block.
        </template>
      </CardWarning>
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
  </WizardBody>
</template>
