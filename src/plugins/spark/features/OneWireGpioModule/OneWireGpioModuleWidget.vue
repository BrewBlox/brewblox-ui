<script setup lang="ts">
import {
  GpioErrorFlags,
  GpioModuleChannel,
  GpioPins,
  OneWireGpioModuleBlock,
} from 'brewblox-proto/ts';
import { computed } from 'vue';
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { createDialogPromise } from '@/utils/dialog';

/**
 * Converts GpioPins bitmask to list of 1-indexed pin numbers
 */
function listedPins(pins: GpioPins): number[] {
  return [...Array(8).keys()].filter((i) => (1 << i) & pins).map((i) => i + 1);
}

const { context } = useContext.setup();
const { block, patchBlock } = useBlockWidget.setup<OneWireGpioModuleBlock>();

const power = computed<boolean>({
  get: () => block.value.data.useExternalPower,
  set: async (useExternalPower) => {
    const ok =
      !useExternalPower ||
      (await createDialogPromise({
        component: 'ConfirmDialog',
        componentProps: {
          title: 'Switch to external power',
          message:
            'If enabled, all channels on this module will use the external power supply.' +
            ' Are you sure?',
        },
      }));
    if (ok) {
      patchBlock({ useExternalPower });
    }
  },
});

const channels = computed<GpioModuleChannel[]>({
  get: () => block.value.data.channels,
  set: (channels) => patchBlock({ channels }),
});

const inputPins = computed<GpioPins>(() =>
  block.value.data.channels
    .filter((chan) => chan.deviceType.includes('DEV_DETECT'))
    .reduce(
      (pins: GpioPins, chan: GpioModuleChannel) => pins | chan.pinsMask,
      GpioPins.NONE,
    ),
);

const errors = computed<string[]>(() => {
  const values: string[] = [];
  const { moduleStatus, overCurrent, openLoad } = block.value.data.status;
  if (overCurrent !== GpioPins.NONE) {
    values.push(
      'ERROR: Overcurrent on pin ' + listedPins(overCurrent).toString(),
    );
  } else if (moduleStatus & GpioErrorFlags.OVERCURRENT) {
    values.push('ERROR: Overcurrent');
  }
  if (moduleStatus & GpioErrorFlags.OVERVOLTAGE) {
    values.push('ERROR: Overvoltage');
  }
  if (moduleStatus & GpioErrorFlags.UNDERVOLTAGE_LOCKOUT) {
    values.push('ERROR: Undervoltage');
  }
  if (moduleStatus & GpioErrorFlags.OVERTEMPERATURE_SHUTDOWN) {
    values.push('ERROR: Overtemperature');
  } else if (moduleStatus & GpioErrorFlags.OVERTEMPERATURE_WARNING) {
    values.push('WARNING: Overtemperature');
  }
  if (moduleStatus & GpioErrorFlags.POWER_ON_RESET) {
    values.push('ERROR: Not yet initialized (power on reset)');
  }
  if (moduleStatus & GpioErrorFlags.SPI_ERROR) {
    values.push('ERROR: SPI error');
  }
  if (moduleStatus & GpioErrorFlags.OPEN_LOAD) {
    const relevantPins = ~inputPins.value & openLoad;
    if (relevantPins != GpioPins.NONE) {
      values.push(
        'WARNING: Open Load on pin ' + listedPins(relevantPins).toString(),
      );
    }
  }
  return values;
});
</script>

<template>
  <Card>
    <template #toolbar>
      <BlockWidgetToolbar has-mode-toggle />
    </template>

    <CardWarning v-if="errors.length">
      <template #message>
        <div
          v-for="e in errors"
          :key="`error-${e}`"
        >
          {{ e }}
        </div>
      </template>
    </CardWarning>

    <div class="widget-body">
      <div class="row q-gutter-sm">
        <LabeledField
          label="Module position"
          class="col-grow"
        >
          {{ block.data.modulePosition }}
        </LabeledField>
      </div>

      <OneWireGpioEditor
        v-model:channels="channels"
        :error-pins="block.data.status.overCurrent"
      />

      <template v-if="context.mode === 'Full'">
        <q-separator inset />

        <div class="column q-gutter-sm">
          <div>
            All channels in a module use the same power source. This is either
            5V, or the external power supply.
          </div>
          <div>
            There are two ways to attach an external power source: connected to
            the two right-most pins in any GPIO module, or using a Power over
            Ethernet (PoE) adapter. <br />
            Any external power supply is a valid source for all modules.
          </div>
        </div>
        <LabeledField label="Module power source">
          <q-btn-group
            outline
            class="fit"
            @click="power = !power"
          >
            <q-btn
              outline
              label="5V"
              :color="power ? '' : 'primary'"
            />
            <q-btn
              outline
              label="External"
              :color="power ? 'primary' : ''"
            />
          </q-btn-group>
        </LabeledField>
      </template>
    </div>
  </Card>
</template>
