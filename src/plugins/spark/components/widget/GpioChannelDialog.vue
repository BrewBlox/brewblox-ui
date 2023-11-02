<script setup lang="ts">
import { useDialog } from '@/composables';
import { bloxLink } from '@/utils/link';
import {
  ChannelCapabilities,
  GpioDeviceType,
  GpioModuleChannel,
  GpioPins,
} from 'brewblox-proto/ts';
import clamp from 'lodash/clamp';
import { computed, PropType, reactive, watch } from 'vue';

type EditingKind =
  | 'UNKNOWN'
  | 'SSR'
  | 'MOTOR'
  | 'SOLENOID'
  | 'MECH_RELAY'
  | 'GROUND'
  | 'POWER'
  | 'DETECT_LOW'
  | 'DETECT_HIGH';

type EditingMode = 'BOTH' | 'PLUS' | 'MINUS' | 'BIDIRECTIONAL' | 'NONE';

interface EditingChannel {
  name: string;
  kind: EditingKind;
  mode: EditingMode;
  multiply: number;
}

function inferEditingKind({ deviceType }: GpioModuleChannel): EditingKind {
  if (deviceType.startsWith('GPIO_DEV_SSR')) {
    return 'SSR';
  } else if (deviceType.startsWith('GPIO_DEV_MOTOR')) {
    return 'MOTOR';
  } else if (deviceType.startsWith('GPIO_DEV_COIL')) {
    return 'SOLENOID';
  } else if (deviceType.startsWith('GPIO_DEV_MECHANICAL_RELAY')) {
    return 'MECH_RELAY';
  } else if (deviceType.startsWith('GPIO_DEV_POWER')) {
    return 'POWER';
  } else if (deviceType.startsWith('GPIO_DEV_GND')) {
    return 'GROUND';
  } else if (deviceType.startsWith('GPIO_DEV_DETECT_LOW')) {
    return 'DETECT_LOW';
  } else if (deviceType.startsWith('GPIO_DEV_DETECT_HIGH')) {
    return 'DETECT_HIGH';
  } else {
    return 'UNKNOWN';
  }
}

function inferEditingMode({ deviceType }: GpioModuleChannel): EditingMode {
  if (/_2P_BIDIRECTIONAL/.test(deviceType)) {
    return 'BIDIRECTIONAL';
  } else if (/(_1P_HIGH_SIDE|_1P_POWER|_SSR_1P)/.test(deviceType)) {
    return 'PLUS';
  } else if (/(_1P_LOW_SIDE|_1P_GND)/.test(deviceType)) {
    return 'MINUS';
  } else if (/(POWER|GND)_1P/.test(deviceType)) {
    return 'NONE';
  } else {
    return 'BOTH';
  }
}

function inferEditingMultiply({
  deviceType,
  width,
}: GpioModuleChannel): number {
  const base = /_1P/.test(deviceType) ? 1 : 2;
  return clamp(width / base, 1, 4);
}

function inferChannelDeviceType({
  kind,
  mode,
}: EditingChannel): GpioDeviceType {
  if (kind === 'SSR') {
    if (mode === 'BOTH') {
      return GpioDeviceType.GPIO_DEV_SSR_2P;
    } else if (mode === 'PLUS') {
      return GpioDeviceType.GPIO_DEV_SSR_1P;
    }
  } else if (kind === 'MOTOR') {
    if (mode === 'BOTH') {
      return GpioDeviceType.GPIO_DEV_MOTOR_2P;
    } else if (mode === 'PLUS') {
      return GpioDeviceType.GPIO_DEV_MOTOR_1P_HIGH_SIDE;
    } else if (mode === 'MINUS') {
      return GpioDeviceType.GPIO_DEV_MOTOR_1P_LOW_SIDE;
    } else if (mode === 'BIDIRECTIONAL') {
      return GpioDeviceType.GPIO_DEV_MOTOR_2P_BIDIRECTIONAL;
    }
  } else if (kind === 'SOLENOID') {
    if (mode === 'BOTH') {
      return GpioDeviceType.GPIO_DEV_COIL_2P;
    } else if (mode === 'PLUS') {
      return GpioDeviceType.GPIO_DEV_COIL_1P_HIGH_SIDE;
    } else if (mode === 'MINUS') {
      return GpioDeviceType.GPIO_DEV_COIL_1P_LOW_SIDE;
    } else if (mode === 'BIDIRECTIONAL') {
      return GpioDeviceType.GPIO_DEV_COIL_2P_BIDIRECTIONAL;
    }
  } else if (kind === 'MECH_RELAY') {
    if (mode === 'BOTH') {
      return GpioDeviceType.GPIO_DEV_MECHANICAL_RELAY_2P;
    } else if (mode === 'PLUS') {
      return GpioDeviceType.GPIO_DEV_MECHANICAL_RELAY_1P_HIGH_SIDE;
    } else if (mode === 'MINUS') {
      return GpioDeviceType.GPIO_DEV_MECHANICAL_RELAY_1P_LOW_SIDE;
    }
  } else if (kind === 'POWER') {
    // Mode is always NONE
    return GpioDeviceType.GPIO_DEV_POWER_1P;
  } else if (kind === 'GROUND') {
    // Mode is always NONE
    return GpioDeviceType.GPIO_DEV_GND_1P;
  } else if (kind === 'DETECT_LOW') {
    if (mode === 'BOTH') {
      return GpioDeviceType.GPIO_DEV_DETECT_LOW_CURRENT_2P;
    } else if (mode === 'MINUS') {
      return GpioDeviceType.GPIO_DEV_DETECT_LOW_CURRENT_1P_GND;
    }
  } else if (kind === 'DETECT_HIGH') {
    if (mode === 'BOTH') {
      return GpioDeviceType.GPIO_DEV_DETECT_HIGH_CURRENT_2P;
    } else if (mode === 'PLUS') {
      return GpioDeviceType.GPIO_DEV_DETECT_HIGH_CURRENT_1P_POWER;
    } else if (mode === 'MINUS') {
      return GpioDeviceType.GPIO_DEV_DETECT_HIGH_CURRENT_1P_GND;
    }
  }
  // Return NONE for all invalid combinations of kind and mode
  return GpioDeviceType.GPIO_DEV_NONE;
}

function inferChannelWidth({ mode, multiply }: EditingChannel): number {
  if (mode === 'BOTH' || mode === 'BIDIRECTIONAL') {
    return 2 * multiply;
  } else {
    return multiply;
  }
}

const props = defineProps({
  ...useDialog.props,
  channel: {
    type: Object as PropType<GpioModuleChannel>,
    required: true,
  },
});

defineEmits<UseDialogEmits>();

const { dialogRef, dialogOpts, onDialogHide, onDialogCancel, onDialogOK } =
  useDialog.setup();

const local = reactive<EditingChannel>({
  name: props.channel.name,
  kind: inferEditingKind(props.channel),
  mode: inferEditingMode(props.channel),
  multiply: inferEditingMultiply(props.channel),
});

const kindOpts: SelectOption<EditingKind>[] = [
  { value: 'SSR', label: 'SSR' },
  { value: 'MOTOR', label: 'Motor' },
  { value: 'SOLENOID', label: 'Solenoid' },
  { value: 'MECH_RELAY', label: 'Mechanical Relay' },
  { value: 'POWER', label: 'Power (always on)' },
  { value: 'GROUND', label: 'Ground' },
  { value: 'DETECT_LOW', label: 'Input (detect current 2-100mA)' },
  { value: 'DETECT_HIGH', label: 'Input (detect current 30-1000mA)' },
];

const modeOpts = computed<SelectOption<EditingMode>[]>(() => {
  if (local.kind === 'POWER' || local.kind === 'GROUND') {
    return [{ value: 'NONE', label: 'N/A' }];
  }

  const opts: SelectOption<EditingMode>[] = [
    { value: 'BOTH', label: '- and +' },
  ];
  if (local.kind !== 'DETECT_LOW') {
    opts.push({ value: 'PLUS', label: 'Only +' });
  }
  if (local.kind !== 'SSR') {
    opts.push({ value: 'MINUS', label: 'Only -' });
  }
  if (local.kind === 'MOTOR' || local.kind === 'SOLENOID') {
    opts.push({ value: 'BIDIRECTIONAL', label: '- and + (bidirectional)' });
  }
  return opts;
});

const multiplyOpts: SelectOption<number>[] = [
  { value: 1, label: 'x1 (1A)' },
  { value: 2, label: 'x2 (2A)' },
  { value: 3, label: 'x3 (3A)' },
  { value: 4, label: 'x4 (4A)' },
];

const error = computed<string | null>(() => {
  const type = inferChannelDeviceType(local);
  if (type === GpioDeviceType.GPIO_DEV_NONE) {
    return 'Invalid device type';
  }
  if (local.multiply < 1 || local.multiply > 4) {
    return 'Invalid multiplication value';
  }
  if (local.name.length >= 32) {
    return 'Invalid name: too long';
  }
  return null;
});

function save(): void {
  if (error.value !== null) {
    return;
  }

  const { id } = props.channel;
  const { name } = local;
  const deviceType = inferChannelDeviceType(local);
  const width = inferChannelWidth(local);
  const changed =
    deviceType !== props.channel.deviceType || width !== props.channel.width;
  const pinsMask = changed ? GpioPins.NONE : props.channel.pinsMask;
  const capabilities = changed
    ? ChannelCapabilities.CHAN_SUPPORTS_NONE
    : props.channel.capabilities;

  const channel: GpioModuleChannel = {
    id,
    name,
    pinsMask,
    deviceType,
    width,
    capabilities,
    claimedBy: bloxLink(null),
  };

  onDialogOK(channel);
}

watch(
  () => local.kind,
  () => {
    if (!modeOpts.value.find((opt) => opt.value === local.mode)) {
      local.mode = modeOpts.value[0].value;
    }
  },
);
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogOpts"
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{ title, message, html }">
      <div class="row q-gutter-x-md">
        <q-select
          v-model="local.kind"
          :options="kindOpts"
          label="Device type"
          emit-value
          map-options
          class="col-grow"
          @keyup.enter.stop
        />

        <div class="col-break" />

        <q-input
          v-model="local.name"
          label="Channel name"
          class="col-grow"
          stack-label
          :rules="[
            (v) => v.length < 32 || 'Name must be less than 32 characters',
          ]"
        />

        <div class="col-break" />

        <LabeledField
          :disable="local.kind === 'DETECT_LOW'"
          label="Multiply pins"
          class="col-6"
        >
          <div class="text-weight-light">
            Control parallel devices or deliver more power to a single device.
          </div>
          <q-option-group
            v-model="local.multiply"
            :options="multiplyOpts"
            type="radio"
          />
        </LabeledField>

        <q-select
          v-model="local.mode"
          :options="modeOpts"
          label="Pin mode"
          emit-value
          map-options
          class="col-5"
          @keyup.enter.stop
        />
      </div>
      <template #actions>
        <q-btn
          flat
          label="Cancel"
          color="primary"
          @click="onDialogCancel"
        />
        <q-btn
          flat
          label="OK"
          color="primary"
          :disabled="error !== null"
          @click="save"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
