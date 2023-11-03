<script setup lang="ts">
import { GpioChange, IoChannelAddress } from '../types';
import { hasShared, resetGpioChanges } from '../utils';
import { HermsConfig } from './types';
import { useSparkStore } from '@/plugins/spark/store';
import { createDialog } from '@/utils/dialog';
import {
  computed,
  defineComponent,
  onBeforeMount,
  PropType,
  reactive,
  ref,
} from 'vue';

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
    const sparkStore = useSparkStore();

    const hltChannel = ref<IoChannelAddress | null>(
      props.config.hltChannel ?? null,
    );
    const bkChannel = ref<IoChannelAddress | null>(
      props.config.bkChannel ?? null,
    );
    const hltSensor = ref<string | null>(props.config.hltSensor ?? null);
    const mtSensor = ref<string | null>(props.config.mtSensor ?? null);
    const bkSensor = ref<string | null>(props.config.bkSensor ?? null);
    const changedGpio = reactive<GpioChange[]>(
      props.config.changedGpio ?? resetGpioChanges(props.config.serviceId),
    );

    const channelSame = computed<boolean>(() =>
      hasShared([hltChannel.value, bkChannel.value]),
    );

    const sensorSame = computed<boolean>(() =>
      hasShared([hltSensor.value, mtSensor.value, bkSensor.value]),
    );

    const valuesOk = computed<boolean>(() =>
      [
        hltChannel.value,
        bkChannel.value,
        !channelSame.value,
        hltSensor.value,
        mtSensor.value,
        bkSensor.value,
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

      const updates: Partial<HermsConfig> = {
        changedGpio,
        hltChannel: hltChannel.value!,
        bkChannel: bkChannel.value!,
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
      hltChannel,
      bkChannel,
      hltSensor,
      mtSensor,
      bkSensor,
      changedGpio,
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
        :names="[
          config.names.hltSensor,
          config.names.mtSensor,
          config.names.bkSensor,
        ]"
      />
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
      <q-item>
        <q-item-section>
          <QuickstartChannelField
            v-model="hltChannel"
            :service-id="config.serviceId"
            :changed-gpio="changedGpio"
            :error="channelSame"
            :desc="`${config.prefix} HLT`"
            label="HLT output"
          />
        </q-item-section>
        <q-item-section>
          <QuickstartChannelField
            v-model="bkChannel"
            :service-id="config.serviceId"
            :changed-gpio="changedGpio"
            :error="channelSame"
            :desc="`${config.prefix} BK`"
            label="BK output"
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
