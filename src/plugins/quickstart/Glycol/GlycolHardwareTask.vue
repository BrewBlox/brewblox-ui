<script lang="ts">
import { computed, defineComponent, onBeforeMount, PropType, ref } from 'vue';

import { sparkStore } from '@/plugins/spark/store';
import { createBlockWizard } from '@/plugins/wizardry';

import { PinChannel } from '../types';
import { hasShared } from '../utils';
import { GlycolConfig, GlycolControlMode } from './types';

export default defineComponent({
  name: 'GlycolHardwareTask',
  props: {
    config: {
      type: Object as PropType<GlycolConfig>,
      required: true,
    },
  },
  emits: ['update:config', 'back', 'next'],
  setup(props, { emit }) {
    const heated = ref<boolean>(props.config.heated ?? false);
    const glycolControl = ref<GlycolControlMode>(
      props.config.glycolControl ?? 'No',
    );
    const coolPin = ref<PinChannel | null>(props.config.coolPin ?? null);
    const heatPin = ref<PinChannel | null>(props.config.heatPin ?? null);
    const glycolPin = ref<PinChannel | null>(props.config.glycolPin ?? null);
    const beerSensor = ref<string | null>(props.config.beerSensor ?? null);
    const glycolSensor = ref<string | null>(props.config.glycolSensor ?? null);

    const pinSame = computed<boolean>(
      () =>
        (heated.value &&
          hasShared([coolPin.value, heatPin.value, glycolPin.value])) ||
        (glycolControl.value === 'Control' &&
          hasShared([coolPin.value, heatPin.value, glycolPin.value])),
    );

    const sensorSame = computed<boolean>(
      () =>
        glycolControl.value !== 'No' &&
        hasShared([beerSensor.value, glycolSensor.value]),
    );

    const valuesOk = computed<boolean>(() =>
      [
        coolPin.value,
        heatPin.value || !heated.value,
        glycolPin.value || glycolControl.value !== 'Control',
        !pinSame.value,
        beerSensor.value,
        glycolSensor.value || glycolControl.value === 'No',
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

      const updates: Partial<GlycolConfig> = {
        heated: heated.value,
        heatPin: heated.value ? heatPin.value : null,
        coolPin: coolPin.value!,
        beerSensor: beerSensor.value!,
        glycolSensor: glycolSensor.value!,
        glycolControl: glycolControl.value,
        glycolPin: glycolControl.value === 'Control' ? glycolPin.value : null,
        renamedBlocks:
          glycolControl.value === 'No'
            ? {
                [beerSensor.value!]: props.config.names.beerSensor,
              }
            : {
                [beerSensor.value!]: props.config.names.beerSensor,
                [glycolSensor.value!]: props.config.names.glycolSensor,
              },
      };

      emit('update:config', { ...props.config, ...updates });
      emit('next');
    }

    onBeforeMount(() => discover());

    return {
      heated,
      glycolControl,
      coolPin,
      heatPin,
      glycolPin,
      beerSensor,
      glycolSensor,
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
        :names="[config.names.beerSensor, config.names.glycolSensor]"
      />
      <LabeledField label="Does your fermenter have a heater?" item-aligned>
        <div class="q-gutter-lg">
          <q-radio v-model="heated" :val="false" label="No" />
          <q-radio v-model="heated" :val="true" label="Yes" />
        </div>
      </LabeledField>
      <LabeledField
        label="Should Brewblox manage glycol temperature?"
        item-aligned
      >
        <div class="q-gutter-lg">
          <q-radio v-model="glycolControl" val="No" label="No" />
          <q-radio v-model="glycolControl" val="Measure" label="Measure only" />
          <q-radio
            v-model="glycolControl"
            val="Control"
            label="Actively controlled"
          />
        </div>
      </LabeledField>
      <q-item>
        <q-item-section>
          <QuickstartSensorField
            v-model="beerSensor"
            :service-id="config.serviceId"
            :error="sensorSame"
            label="Beer Sensor"
          />
        </q-item-section>
        <q-item-section />
      </q-item>
      <q-item>
        <q-item-section>
          <QuickstartPinField
            v-model="coolPin"
            :service-id="config.serviceId"
            :error="pinSame"
            label="Glycol pump output"
          />
        </q-item-section>
        <q-item-section>
          <QuickstartPinField
            v-if="heated"
            v-model="heatPin"
            :service-id="config.serviceId"
            :error="pinSame"
            label="Heater output"
          />
        </q-item-section>
      </q-item>
      <q-item v-if="glycolControl !== 'No'">
        <q-item-section>
          <QuickstartSensorField
            v-model="glycolSensor"
            :service-id="config.serviceId"
            :error="sensorSame"
            label="Glycol Sensor"
          />
        </q-item-section>
        <q-item-section>
          <QuickstartPinField
            v-if="glycolControl === 'Control'"
            v-model="glycolPin"
            :service-id="config.serviceId"
            :error="pinSame"
            label="Glycol chiller output"
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
