<script lang="ts">
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { createDialogPromise } from '@/utils/dialog';
import {
  GpioModuleChannel,
  GpioModuleStatus,
  GpioPins,
  OneWireGpioModuleBlock,
} from 'brewblox-proto/ts';
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'OneWireGpioModuleWidget',
  setup() {
    const { context } = useContext.setup();
    const { block, patchBlock } =
      useBlockWidget.setup<OneWireGpioModuleBlock>();

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

    const errors = computed<string[]>(() => {
      const values: string[] = [];
      const { moduleStatus, overCurrent } = block.value.data;
      if (overCurrent !== GpioPins.NONE) {
        values.push(
          'ERROR: Overcurrent on pin ' +
            [...Array(8).keys()]
              .filter((i) => (1 << i) & overCurrent)
              .map((i) => `${i + 1}`)
              .join(', '),
        );
      } else if (moduleStatus & GpioModuleStatus.OVERCURRENT) {
        values.push('ERROR: Overcurrent');
      }
      if (moduleStatus & GpioModuleStatus.OVERVOLTAGE) {
        values.push('ERROR: Overvoltage');
      }
      if (moduleStatus & GpioModuleStatus.UNDERVOLTAGE_LOCKOUT) {
        values.push('ERROR: Undervoltage');
      }
      if (moduleStatus & GpioModuleStatus.OVERTEMPERATURE_SHUTDOWN) {
        values.push('ERROR: Overtemperature');
      } else if (moduleStatus & GpioModuleStatus.OVERTEMPERATURE_WARNING) {
        values.push('WARNING: Overtemperature');
      }
      if (moduleStatus & GpioModuleStatus.POWER_ON_RESET) {
        values.push('GPIO Driver not yet initialized (POR)');
      }
      if (moduleStatus & GpioModuleStatus.SPI_ERROR) {
        values.push('GPIO Driver SPI error');
      }
      return values;
    });

    return {
      context,
      block,
      patchBlock,
      power,
      channels,
      errors,
    };
  },
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
      <template #actions>
        <q-btn
          flat
          label="Clear errors"
          @click="patchBlock({ clearFaults: true })"
        />
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
        :error-pins="block.data.overCurrent"
      />

      <span>{{ block.data.moduleStatus }}</span>

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
