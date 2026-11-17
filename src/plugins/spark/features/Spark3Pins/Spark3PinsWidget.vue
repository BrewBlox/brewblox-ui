<script setup lang="ts">
import { Spark3PinsBlock } from 'brewblox-proto/ts';
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { createDialogPromise } from '@/utils/dialog';
import { fixedNumber } from '@/utils/quantity';

const { context } = useContext.setup();
const { block, patchBlock } = useBlockWidget.setup<Spark3PinsBlock>();

async function powerCycle5V(): Promise<void> {
  const ok = await createDialogPromise({
    component: 'ConfirmDialog',
    componentProps: {
      title: 'Power-cycle 5V',
      message:
        'The 5V supply switches off for a second and on again.' +
        ' The devices on the RJ12 ports, such as OneWire sensors, restart.',
    },
  });
  if (ok) {
    await patchBlock({ powerCycleIoSupply5V: true });
  }
}
</script>

<template>
  <Card>
    <template #toolbar>
      <BlockWidgetToolbar has-mode-toggle />
    </template>

    <div>
      <IoArray />

      <div
        v-if="context.mode === 'Full'"
        class="widget-body row"
      >
        <q-separator inset />
        <div class="col-break" />

        <LabeledField
          label="Enable 12V"
          class="col-grow"
          tooltip="12V stays as you set it through a reboot, and is off until you switch it on.
          With 12V on the outputs, a short is more likely to cause damage."
        >
          <q-toggle
            :model-value="block.data.enableIoSupply12V"
            dense
            @update:model-value="(v) => patchBlock({ enableIoSupply12V: v })"
          />
        </LabeledField>
        <div class="col-grow row justify-end items-center">
          <q-btn
            flat
            dense
            color="secondary"
            label="Power-cycle 5V"
            @click="powerCycle5V"
          >
            <q-tooltip>
              Switches 5V off for a second to power-cycle the devices on the
              RJ12 ports.
            </q-tooltip>
          </q-btn>
        </div>

        <div class="col-break" />

        <LabeledField
          label="5V Voltage"
          class="col-grow"
        >
          {{ fixedNumber(block.data.voltage5) }}
        </LabeledField>
        <LabeledField
          label="12V Voltage"
          class="col-grow"
        >
          {{ fixedNumber(block.data.voltage12) }}
        </LabeledField>
      </div>
    </div>
  </Card>
</template>
