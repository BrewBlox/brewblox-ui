<script setup lang="ts">
import { computed, onBeforeMount, reactive, ref } from 'vue';
import { useSparkStore } from '@/plugins/spark/store';
import { createDialog } from '@/utils/dialog';
import { UseTaskEmits, UseTaskProps } from '../composables';
import { GpioChange, IoChannelAddress } from '../types';
import { hasShared, resetGpioChanges } from '../utils';
import { GlycolConfig, GlycolControlMode } from './types';

const props = defineProps<UseTaskProps<GlycolConfig>>();

const emit = defineEmits<UseTaskEmits<GlycolConfig>>();

const sparkStore = useSparkStore();

const heated = ref<boolean>(props.config.heated ?? false);
const glycolControl = ref<GlycolControlMode>(
  props.config.glycolControl ?? 'No',
);
const coolChannel = ref<IoChannelAddress | null>(
  props.config.coolChannel ?? null,
);
const heatChannel = ref<IoChannelAddress | null>(
  props.config.heatChannel ?? null,
);
const glycolChannel = ref<IoChannelAddress | null>(
  props.config.glycolChannel ?? null,
);
const beerSensor = ref<string | null>(props.config.beerSensor ?? null);
const glycolSensor = ref<string | null>(props.config.glycolSensor ?? null);
const changedGpio = reactive<GpioChange[]>(
  props.config.changedGpio ?? resetGpioChanges(props.config.serviceId),
);

const heatedDesc = computed<'Yes' | 'No'>({
  get: () => (heated.value ? 'Yes' : 'No'),
  set: (v) => (heated.value = v === 'Yes'),
});

const channelSame = computed<boolean>(
  () =>
    (heated.value &&
      hasShared([coolChannel.value, heatChannel.value, glycolChannel.value])) ||
    (glycolControl.value === 'Control' &&
      hasShared([coolChannel.value, heatChannel.value, glycolChannel.value])),
);

const sensorSame = computed<boolean>(
  () =>
    glycolControl.value !== 'No' &&
    hasShared([beerSensor.value, glycolSensor.value]),
);

const valuesOk = computed<boolean>(() =>
  [
    coolChannel.value,
    heatChannel.value || !heated.value,
    glycolChannel.value || glycolControl.value !== 'Control',
    !channelSame.value,
    beerSensor.value,
    glycolSensor.value || glycolControl.value === 'No',
    !sensorSame.value,
  ].every(Boolean),
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

  const updates: Partial<GlycolConfig> = {
    changedGpio,
    heated: heated.value,
    heatChannel: heated.value ? heatChannel.value : null,
    coolChannel: coolChannel.value!,
    beerSensor: beerSensor.value!,
    glycolSensor: glycolSensor.value!,
    glycolControl: glycolControl.value,
    glycolChannel:
      glycolControl.value === 'Control' ? glycolChannel.value : null,
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
          <p v-if="changedGpio.length">
            The GPIO modules are shown below. You can create IO channels there
            to add them to the dropdown menus.
          </p>
        </q-item-section>
      </q-item>
      <QuickstartMockCreateField
        :service-id="config.serviceId"
        :names="[config.names.beerSensor, config.names.glycolSensor]"
      />
      <LabeledField
        label="Does your fermenter have a heater?"
        item-aligned
      >
        <div class="q-gutter-lg">
          <q-radio
            v-model="heatedDesc"
            val="No"
            label="No"
          />
          <q-radio
            v-model="heatedDesc"
            val="Yes"
            label="Yes"
          />
        </div>
      </LabeledField>
      <LabeledField
        label="Should Brewblox manage glycol temperature?"
        item-aligned
      >
        <div class="q-gutter-lg">
          <q-radio
            v-model="glycolControl"
            val="No"
            label="No"
          />
          <q-radio
            v-model="glycolControl"
            val="Measure"
            label="Measure only"
          />
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
          <QuickstartChannelField
            v-model="coolChannel"
            :service-id="config.serviceId"
            :changed-gpio="changedGpio"
            :error="channelSame"
            :desc="`${config.prefix} cooler`"
            label="Glycol pump output"
          />
        </q-item-section>
        <q-item-section>
          <QuickstartChannelField
            v-if="heated"
            v-model="heatChannel"
            :service-id="config.serviceId"
            :changed-gpio="changedGpio"
            :error="channelSame"
            :desc="`${config.prefix} heater`"
            label="Heater output"
          />
        </q-item-section>
      </q-item>
      <q-item v-if="glycolControl !== 'No'">
        <q-item-section>
          <QuickstartSensorField
            v-model="glycolSensor"
            :service-id="config.serviceId"
            :changed-gpio="changedGpio"
            :error="sensorSame"
            label="Glycol Sensor"
          />
        </q-item-section>
        <q-item-section>
          <QuickstartChannelField
            v-if="glycolControl === 'Control'"
            v-model="glycolChannel"
            :service-id="config.serviceId"
            :changed-gpio="changedGpio"
            :error="channelSame"
            :desc="`${config.prefix} glycol`"
            label="Glycol chiller output"
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
