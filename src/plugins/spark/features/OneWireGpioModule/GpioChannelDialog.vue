<script lang="ts">
import clamp from 'lodash/clamp';
import { computed, defineComponent, PropType, reactive } from 'vue';

import { useDialog } from '@/composables';
import { GpioDeviceType, GpioModuleChannel, GpioPins } from '@/shared-types';
import { isJsonEqual } from '@/utils/objects';

type EditingKind = 'UNKNOWN' | 'SSR' | 'MOTOR' | 'SOLENOID' | 'MECH_RELAY';
type EditingMode = 'BOTH' | 'PLUS' | 'MINUS' | 'BIDIRECTIONAL';

interface EditingChannel {
  kind: EditingKind;
  mode: EditingMode;
  amps: number;
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
  } else {
    return 'UNKNOWN';
  }
}

function inferEditingMode({ deviceType }: GpioModuleChannel): EditingMode {
  if (/_2P_BIDIRECTIONAL/.test(deviceType)) {
    return 'BIDIRECTIONAL';
  } else if (/_1P_HIGH_SIDE/.test(deviceType)) {
    return 'PLUS';
  } else if (/_1P_LOW_SIDE/.test(deviceType)) {
    return 'MINUS';
  } else {
    return 'BOTH';
  }
}

function inferEditingAmps({ deviceType, width }: GpioModuleChannel): number {
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
  }
  // Return NONE for all invalid combinations of kind and mode
  return GpioDeviceType.GPIO_DEV_NONE;
}

function inferChannelWidth({ kind, mode, amps }: EditingChannel): number {
  if (kind === 'SSR') {
    return mode === 'PLUS' ? 1 : 2;
  } else if (mode === 'BOTH' || mode === 'BIDIRECTIONAL') {
    return 2 * amps;
  } else {
    return amps;
  }
}

export default defineComponent({
  name: 'GpioChannelDialog',
  props: {
    ...useDialog.props,
    channel: {
      type: Object as PropType<GpioModuleChannel>,
      required: true,
    },
  },
  emits: [...useDialog.emits],
  setup(props) {
    const { dialogRef, dialogProps, onDialogHide, onDialogCancel, onDialogOK } =
      useDialog.setup();

    const local = reactive<EditingChannel>({
      kind: inferEditingKind(props.channel),
      mode: inferEditingMode(props.channel),
      amps: inferEditingAmps(props.channel),
    });

    const kindOpts: SelectOption<EditingKind>[] = [
      { value: 'SSR', label: 'SSR' },
      { value: 'MOTOR', label: 'Motor' },
      { value: 'SOLENOID', label: 'Solenoid' },
      { value: 'MECH_RELAY', label: 'Mechanical Relay' },
    ];

    const modeOpts = computed<SelectOption<EditingMode>[]>(() => {
      const opts: SelectOption<EditingMode>[] = [
        { value: 'BOTH', label: '- and + connected' },
        { value: 'PLUS', label: '+ connected' },
      ];
      if (local.kind !== 'SSR') {
        opts.push({ value: 'MINUS', label: '- connected' });
      }
      if (local.kind === 'MOTOR' || local.kind === 'SOLENOID') {
        opts.push({ value: 'BIDIRECTIONAL', label: 'Bidirectional' });
      }
      return opts;
    });

    const ampOpts: SelectOption<number>[] = [
      { value: 1, label: '1A' },
      { value: 2, label: '2A' },
      { value: 3, label: '3A' },
      { value: 4, label: '4A' },
    ];

    const hasAmps = computed<boolean>(() => local.kind !== 'SSR');

    const error = computed<string | null>(() => {
      const type = inferChannelDeviceType(local);
      if (type === GpioDeviceType.GPIO_DEV_NONE) {
        return 'Invalid device type';
      }
      if (hasAmps.value && (local.amps < 1 || local.amps > 4)) {
        return 'Invalid amperage value';
      }
      return null;
    });

    function save(): void {
      if (error.value !== null) {
        return;
      }

      const { id, pinsMask } = props.channel;
      const channel: GpioModuleChannel = {
        id,
        pinsMask,
        deviceType: inferChannelDeviceType(local),
        width: inferChannelWidth(local),
      };

      // If the channel has meaningful changes, always unassign its pins
      if (!isJsonEqual(props.channel, channel)) {
        channel.pinsMask = GpioPins.NONE;
      }

      onDialogOK(channel);
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      save,
      local,
      kindOpts,
      ampOpts,
      hasAmps,
      modeOpts,
      error,
    };
  },
});
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogProps"
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{ title, message, html }">
      <div class="row q-gutter-md">
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
        <q-option-group
          v-if="hasAmps"
          v-model="local.amps"
          :options="ampOpts"
          type="radio"
          class="col-grow"
        />
        <q-select
          v-model="local.mode"
          :options="modeOpts"
          label="Pin mode"
          emit-value
          map-options
          class="col-grow"
          @keyup.enter.stop
        />
      </div>
      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
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
