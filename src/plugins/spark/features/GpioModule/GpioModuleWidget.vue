<script setup lang="ts">
import {
  AnalogCalibrationState,
  AnalogModuleChannel,
  GpioErrorFlags,
  GpioModuleBlock,
  GpioModuleChannel,
  GpioPins,
  PairCalibration,
  Quantity,
} from 'brewblox-proto/ts';
import { computed } from 'vue';
import { useBlockWidget } from '@/plugins/spark/composables';
import { ENUM_LABELS_ANALOG_CALIBRATION_STATE } from '@/plugins/spark/const';
import { asBlockAddress } from '@/plugins/spark/utils/configuration';
import { analogChannelName } from '@/plugins/spark/utils/formatting';
import { createDialogPromise } from '@/utils/dialog';
import { bloxQty } from '@/utils/quantity';

interface CalibrationPair {
  channels: string;
  state: AnalogCalibrationState;
  description: string;
  switchResistance: Quantity | null;
}

/**
 * Converts GpioPins bitmask to list of 1-indexed pin numbers
 */
function listedPins(pins: GpioPins): number[] {
  return [...Array(8).keys()].filter((i) => (1 << i) & pins).map((i) => i + 1);
}

function calibrationPair(
  channelIds: number[],
  calibration: PairCalibration | undefined,
): CalibrationPair {
  // An absent calibration is NONE.
  // A pair that is running or failed without one stored has empty scales.
  const state =
    calibration?.state ?? AnalogCalibrationState.ANALOG_CALIBRATION_STATE_NONE;
  const stored = !!calibration?.scale.length;

  let description: string;
  switch (state) {
    case AnalogCalibrationState.ANALOG_CALIBRATION_STATE_RUNNING:
      description =
        'Takes about 5 seconds. The readings of these channels are paused meanwhile.';
      break;
    case AnalogCalibrationState.ANALOG_CALIBRATION_STATE_DONE:
      description = 'The stored calibration is in use.';
      break;
    case AnalogCalibrationState.ANALOG_CALIBRATION_STATE_FAILED:
      description =
        (stored
          ? 'The previous calibration stays in use.'
          : 'The nominal calibration is in use.') +
        ' The Spark log has the reason why it failed.';
      break;
    default:
      description = 'No calibration stored.';
  }

  return {
    channels: channelIds.map(analogChannelName).join(', '),
    state,
    description,
    switchResistance: stored ? calibration!.switchResistance : null,
  };
}

// Writes patch only the fields they change.
// They must leave out analogCalibration12 and analogCalibration34:
// this copy of the block can be stale, and a null there is refused.
const { block, patchBlock } = useBlockWidget.setup<GpioModuleBlock>();

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

// Analog channels and their sensor type are detected by the controller
const analogChannels = computed<Readonly<AnalogModuleChannel[]>>(
  () => block.value.data.analogChannels,
);

const calibrationPairs = computed<CalibrationPair[]>(() => [
  calibrationPair([1, 2], block.value.data.analogCalibration12),
  calibrationPair([3, 4], block.value.data.analogCalibration34),
]);

const calibrating = computed<boolean>(() =>
  calibrationPairs.value.some(
    (pair) =>
      pair.state === AnalogCalibrationState.ANALOG_CALIBRATION_STATE_RUNNING,
  ),
);

async function calibrateAnalog(): Promise<void> {
  const ok = await createDialogPromise({
    component: 'ConfirmDialog',
    componentProps: {
      title: 'Calibrate analog inputs',
      message:
        'All analog channels calibrate again.' +
        ' Their readings are paused for about 5 seconds.' +
        ' The result replaces the stored calibration only if it passes the checks.',
    },
  });
  if (ok) {
    await patchBlock({ calibrateAnalog: true });
  }
}

// The barometer is part of the analog frontend.
// When it stops answering, its pressure is left out of the block.
const baroPressure = computed<Quantity>(
  () => block.value.data.baroPressure ?? bloxQty(null, 'mbar'),
);

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
      <BlockWidgetToolbar />
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

    <!-- Switch the actuators of the channels, as on other IO modules -->
    <template v-if="block.data.channels.length > 0">
      <IoArray />
      <q-separator />
    </template>

    <div class="widget-body">
      <div class="text-subtitle1 text-right col">Digital channels</div>
      <GpioArrayEditor
        v-model:channels="channels"
        :error-pins="block.data.status.overCurrent"
      />

      <template v-if="analogChannels.length > 0">
        <q-separator />
        <div class="text-subtitle1 text-right col">Analog channels</div>
        <AnalogArrayEditor
          :channels="analogChannels"
          :address="asBlockAddress(block)"
        />
        <div class="col-break" />
        <q-separator />
        <div class="text-subtitle1 text-right col">Analog calibration</div>
        <div
          v-for="pair in calibrationPairs"
          :key="pair.channels"
          class="row q-gutter-sm items-center"
        >
          <LabeledField
            :label="`Channels ${pair.channels}`"
            class="col-3"
          >
            {{ ENUM_LABELS_ANALOG_CALIBRATION_STATE[pair.state] }}
          </LabeledField>
          <QuantityField
            v-if="pair.switchResistance"
            :model-value="pair.switchResistance"
            label="Switch resistance"
            class="col-3"
            readonly
          />
          <div class="col">{{ pair.description }}</div>
        </div>
        <div class="row justify-end">
          <q-btn
            flat
            dense
            color="secondary"
            label="Calibrate analog inputs"
            :loading="calibrating"
            @click="calibrateAnalog"
          />
        </div>
      </template>
      <div class="col-break" />
      <q-separator />
      <div class="text-subtitle1 text-right col">Module settings</div>
      <div class="row q-gutter-sm">
        <LabeledField
          label="Module position"
          class="col-3"
        >
          {{ block.data.modulePosition || 'None' }}
        </LabeledField>
        <QuantityField
          v-if="analogChannels.length > 0 || block.data.baroPressure"
          :model-value="baroPressure"
          label="Barometric pressure"
          class="col-3"
          readonly
        />
        <LabeledField label="Digital channels voltage">
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
        <div class="column q-pt-md">
          <div>
            All channels in a module use the same power source. This is either
            the internal 5V, or the external power supply.
          </div>
          <div>
            There are two ways to attach an external power source: connected to
            the two right-most pins in any GPIO module, or using a Power over
            Ethernet (PoE) adapter. <br />

            External power is internally routed to all modules. You cannot use a
            different external voltage for each module, but they can each toggle
            between 5V or the shared external power source.
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>
