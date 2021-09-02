<script lang="ts">
import { computed, defineComponent, onBeforeMount, PropType, ref } from 'vue';

import { sparkStore } from '@/plugins/spark/store';
import { createBlockWizard } from '@/plugins/wizardry';

import { IoChannelAddress } from '../types';
import { hasShared } from '../utils';
import { HermsConfig } from './types';

export default defineComponent({
  name: 'HermsHardwareTask',
  props: {
    config: {
      type: Object as PropType<HermsConfig>,
      required: true,
    },
  },
  emits: ['update:config', 'back', 'next'],
  setup(props, { emit }) {
    const hltPin = ref<IoChannelAddress | null>(props.config.hltPin ?? null);
    const bkPin = ref<IoChannelAddress | null>(props.config.bkPin ?? null);
    const hltSensor = ref<string | null>(props.config.hltSensor ?? null);
    const mtSensor = ref<string | null>(props.config.mtSensor ?? null);
    const bkSensor = ref<string | null>(props.config.bkSensor ?? null);

    const pinSame = computed<boolean>(() =>
      hasShared([hltPin.value, bkPin.value]),
    );

    const sensorSame = computed<boolean>(() =>
      hasShared([hltSensor.value, mtSensor.value, bkSensor.value]),
    );

    const valuesOk = computed<boolean>(() =>
      [
        hltPin.value,
        bkPin.value,
        !pinSame.value,
        hltSensor.value,
        mtSensor.value,
        bkSensor.value,
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

      const updates: Partial<HermsConfig> = {
        hltPin: hltPin.value!,
        bkPin: bkPin.value!,
        hltSensor: hltSensor.value!,
        mtSensor: mtSensor.value!,
        bkSensor: bkSensor.value!,
        renamedBlocks: {
          [hltSensor.value!]: props.config.names.hltSensor,
          [mtSensor.value!]: props.config.names.mtSensor,
          [bkSensor.value!]: props.config.names.bkSensor,
        },
      };

      emit('update:config', { ...props.config, ...updates });
      emit('next');
    }

    onBeforeMount(() => discover());

    return {
      hltPin,
      bkPin,
      hltSensor,
      mtSensor,
      bkSensor,
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
        :names="[
          config.names.hltSensor,
          config.names.mtSensor,
          config.names.bkSensor,
        ]"
      />
      <q-item>
        <q-item-section>
          <QuickstartChannelField
            v-model="hltPin"
            :service-id="config.serviceId"
            :error="pinSame"
            label="HLT output"
          />
        </q-item-section>
        <q-item-section>
          <QuickstartChannelField
            v-model="bkPin"
            :service-id="config.serviceId"
            :error="pinSame"
            label="BK output"
          />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <QuickstartSensorField
            v-model="hltSensor"
            :service-id="config.serviceId"
            :error="sensorSame"
            label="HLT Sensor"
          />
        </q-item-section>
        <q-item-section>
          <QuickstartSensorField
            v-model="bkSensor"
            :service-id="config.serviceId"
            :error="sensorSame"
            label="BK Sensor"
          />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <QuickstartSensorField
            v-model="mtSensor"
            :service-id="config.serviceId"
            :error="sensorSame"
            label="MT Sensor"
          />
        </q-item-section>
        <q-item-section />
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
