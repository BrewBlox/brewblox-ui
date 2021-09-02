<script lang="ts">
import { computed, defineComponent, onBeforeMount, PropType, ref } from 'vue';

import { sparkStore } from '@/plugins/spark/store';
import { createBlockWizard } from '@/plugins/wizardry';

import { IoChannelAddress, QuickstartAction } from '../types';
import { createOutputActions, hasShared } from '../utils';
import {
  defineChangedBlocks,
  defineCreatedBlocks,
  defineDisplayedBlocks,
  defineWidgets,
} from './changes';
import { defineLayouts } from './changes-layout';
import { RimsConfig } from './types';

export default defineComponent({
  name: 'RimsHardwareTask',
  props: {
    config: {
      type: Object as PropType<RimsConfig>,
      required: true,
    },
    actions: {
      type: Array as PropType<QuickstartAction[]>,
      required: true,
    },
  },
  emits: ['update:config', 'update:actions', 'back', 'next'],
  setup(props, { emit }) {
    const tubePin = ref<IoChannelAddress | null>(props.config.tubePin ?? null);
    const pumpPin = ref<IoChannelAddress | null>(props.config.pumpPin ?? null);
    const kettleSensor = ref<string | null>(props.config.kettleSensor ?? null);
    const tubeSensor = ref<string | null>(props.config.tubeSensor ?? null);

    const pinSame = computed<boolean>(() =>
      hasShared([tubePin.value, pumpPin.value]),
    );

    const sensorSame = computed<boolean>(() =>
      hasShared([kettleSensor.value, tubeSensor.value]),
    );

    const valuesOk = computed<boolean>(() =>
      [
        tubePin.value,
        pumpPin.value,
        !pinSame.value,
        kettleSensor.value,
        tubeSensor.value,
        !sensorSame.value,
      ].every(Boolean),
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

      const localConfig: RimsConfig = {
        ...props.config,
        pumpPin: pumpPin.value!,
        tubePin: tubePin.value!,
        kettleSensor: kettleSensor.value!,
        tubeSensor: tubeSensor.value!,
        renamedBlocks: {
          [kettleSensor.value!]: props.config.names.kettleSensor,
          [tubeSensor.value!]: props.config.names.tubeSensor,
        },
      };

      const createdBlocks = defineCreatedBlocks(localConfig);
      const changedBlocks = defineChangedBlocks(localConfig);
      const layouts = defineLayouts(localConfig);
      const widgets = defineWidgets(localConfig, layouts);
      const displayedBlocks = defineDisplayedBlocks(localConfig);

      const finalizedConfig: RimsConfig = {
        ...localConfig,
        createdBlocks,
        changedBlocks,
        layouts,
        widgets,
        displayedBlocks,
      };

      emit('update:config', finalizedConfig);
      emit('update:actions', createOutputActions());
      emit('next');
    }

    onBeforeMount(() => discover());

    return {
      tubePin,
      pumpPin,
      kettleSensor,
      tubeSensor,
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
        :names="[config.names.kettleSensor, config.names.tubeSensor]"
      />
      <q-item>
        <q-item-section>
          <QuickstartChannelField
            v-model="pumpPin"
            :service-id="config.serviceId"
            :error="pinSame"
            label="Pump"
          />
        </q-item-section>
        <q-item-section>
          <QuickstartChannelField
            v-model="tubePin"
            :service-id="config.serviceId"
            :error="pinSame"
            label="Tube heater"
          />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <QuickstartSensorField
            v-model="kettleSensor"
            :service-id="config.serviceId"
            :error="sensorSame"
            label="Kettle Sensor"
          />
        </q-item-section>
        <q-item-section>
          <QuickstartSensorField
            v-model="tubeSensor"
            :service-id="config.serviceId"
            :error="sensorSame"
            label="Tube Sensor"
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
