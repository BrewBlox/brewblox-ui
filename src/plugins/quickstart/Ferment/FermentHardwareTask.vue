<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeMount,
  PropType,
  reactive,
  ref,
} from 'vue';

import { useSparkStore } from '@/plugins/spark/store';
import { createBlockWizard } from '@/plugins/wizardry';

import { GpioChange, IoChannelAddress } from '../types';
import { hasShared, resetGpioChanges } from '../utils';
import { FermentConfig } from './types';

export default defineComponent({
  name: 'FermentHardwareTask',
  props: {
    config: {
      type: Object as PropType<FermentConfig>,
      required: true,
    },
  },
  emits: ['update:config', 'back', 'next'],
  setup(props, { emit }) {
    const sparkStore = useSparkStore();

    const coolChannel = ref<IoChannelAddress | null>(
      props.config.coolChannel ?? null,
    );
    const heatChannel = ref<IoChannelAddress | null>(
      props.config.heatChannel ?? null,
    );
    const fridgeSensor = ref<string | null>(props.config.fridgeSensor ?? null);
    const beerSensor = ref<string | null>(props.config.beerSensor ?? null);
    const changedGpio = reactive<GpioChange[]>(
      props.config.changedGpio ?? resetGpioChanges(props.config.serviceId),
    );

    const channelSame = computed<boolean>(() =>
      hasShared([coolChannel.value, heatChannel.value]),
    );

    const sensorSame = computed<boolean>(() =>
      hasShared([fridgeSensor.value, beerSensor.value]),
    );

    const valuesOk = computed<boolean>(() =>
      [
        coolChannel.value,
        heatChannel.value,
        !channelSame.value,
        fridgeSensor.value,
        beerSensor.value,
        !sensorSame.value,
      ].every(Boolean),
    );

    function discover(): void {
      sparkStore.fetchDiscoveredBlocks(props.config.serviceId);
    }

    function startBlockWizard(): void {
      createBlockWizard(props.config.serviceId);
    }

    function taskDone(): void {
      if (!valuesOk.value) {
        return;
      }
      const updates: Partial<FermentConfig> = {
        changedGpio,
        heatChannel: heatChannel.value!,
        coolChannel: coolChannel.value!,
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
      coolChannel,
      heatChannel,
      changedGpio,
      fridgeSensor,
      beerSensor,
      channelSame,
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
            You can unplug or heat sensors to identify them. The current value
            will be shown under each dropdown menu.
          </p>
          <p>
            Use the buttons above to discover new OneWire blocks or manually
            create a block.
          </p>
          <p>We will also set some constraints on the heater and cooler:</p>
          <ul>
            <li>Minimum ON and OFF times to protect the compressor</li>
            <li>
              Minimum wait times for switching between heating and cooling
            </li>
          </ul>
        </q-item-section>
      </q-item>
      <QuickstartMockCreateField
        :service-id="config.serviceId"
        :names="[config.names.fridgeSensor, config.names.beerSensor]"
      />
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
      <q-item>
        <q-item-section>
          <QuickstartChannelField
            v-model="coolChannel"
            :service-id="config.serviceId"
            :changed-gpio="changedGpio"
            :error="channelSame"
            :desc="`${config.prefix} cooler`"
            label="Cooler output"
          />
        </q-item-section>
        <q-item-section>
          <QuickstartChannelField
            v-model="heatChannel"
            :service-id="config.serviceId"
            :changed-gpio="changedGpio"
            :desc="`${config.prefix} heater`"
            :error="channelSame"
            label="Heater output"
          />
        </q-item-section>
      </q-item>
      <CardWarning v-if="channelSame">
        <template #message>
          Multiple outputs are using the same IO Channel.
        </template>
      </CardWarning>
      <CardWarning v-if="sensorSame">
        <template #message>
          Multiple sensors are using the same block.
        </template>
      </CardWarning>
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
  </WizardBody>
</template>
