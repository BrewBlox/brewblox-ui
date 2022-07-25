<script lang="ts">
import { useSparkStore } from '@/plugins/spark/store';
import { createBlockWizard } from '@/plugins/wizardry';
import {
  computed,
  defineComponent,
  onBeforeMount,
  PropType,
  reactive,
  ref,
} from 'vue';
import { GpioChange, IoChannelAddress, QuickstartAction } from '../types';
import { hasShared, resetGpioChanges } from '../utils';
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
  emits: ['update:config', 'back', 'next'],
  setup(props, { emit }) {
    const sparkStore = useSparkStore();

    const tubeChannel = ref<IoChannelAddress | null>(
      props.config.tubeChannel ?? null,
    );
    const pumpChannel = ref<IoChannelAddress | null>(
      props.config.pumpChannel ?? null,
    );
    const kettleSensor = ref<string | null>(props.config.kettleSensor ?? null);
    const tubeSensor = ref<string | null>(props.config.tubeSensor ?? null);
    const changedGpio = reactive<GpioChange[]>(
      props.config.changedGpio ?? resetGpioChanges(props.config.serviceId),
    );

    const channelSame = computed<boolean>(() =>
      hasShared([tubeChannel.value, pumpChannel.value]),
    );

    const sensorSame = computed<boolean>(() =>
      hasShared([kettleSensor.value, tubeSensor.value]),
    );

    const valuesOk = computed<boolean>(() =>
      [
        tubeChannel.value,
        pumpChannel.value,
        !channelSame.value,
        kettleSensor.value,
        tubeSensor.value,
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

      const updatedConfig: RimsConfig = {
        ...props.config,
        changedGpio,
        pumpChannel: pumpChannel.value!,
        tubeChannel: tubeChannel.value!,
        kettleSensor: kettleSensor.value!,
        tubeSensor: tubeSensor.value!,
        renamedBlocks: {
          [kettleSensor.value!]: props.config.names.kettleSensor,
          [tubeSensor.value!]: props.config.names.tubeSensor,
        },
      };

      emit('update:config', updatedConfig);
      emit('next');
    }

    onBeforeMount(() => discover());

    return {
      tubeChannel,
      pumpChannel,
      kettleSensor,
      tubeSensor,
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
  <WizardBody>
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
        :names="[config.names.kettleSensor, config.names.tubeSensor]"
      />
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
      <q-item>
        <q-item-section>
          <QuickstartChannelField
            v-model="pumpChannel"
            :service-id="config.serviceId"
            :changed-gpio="changedGpio"
            :error="channelSame"
            :desc="`${config.prefix} pump`"
            label="Pump"
          />
        </q-item-section>
        <q-item-section>
          <QuickstartChannelField
            v-model="tubeChannel"
            :service-id="config.serviceId"
            :changed-gpio="changedGpio"
            :error="channelSame"
            :desc="`${config.prefix} tube`"
            label="Tube heater"
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
  </WizardBody>
</template>
