<script lang="ts">
import { computed, defineComponent } from 'vue';

import LabeledField from '@/components/form/LabeledField.vue';
import { GpioModuleChannel, OneWireGpioModuleBlock } from '@/shared-types';
import { createDialogPromise } from '@/utils/dialog';

import { useBlockWidget } from '../../composables';

export default defineComponent({
  name: 'OneWireGpioModuleWidget',
  setup() {
    const { block, saveBlock } = useBlockWidget.setup<OneWireGpioModuleBlock>();

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
          block.value.data.useExternalPower = useExternalPower;
          saveBlock();
        }
      },
    });

    const channels = computed<GpioModuleChannel[]>({
      get: () => block.value.data.channels,
      set: (channels) => {
        block.value.data.channels = channels;
        saveBlock();
      },
    });

    return {
      block,
      power,
      channels,
    };
  },
});
</script>

<template>
  <Card>
    <template #toolbar>
      <BlockWidgetToolbar has-mode-toggle />
    </template>

    <div class="widget-body">
      <div class="row q-gutter-sm">
        <LabeledField label="Module position" class="col-grow">
          {{ block.data.modulePosition }}
        </LabeledField>
      </div>

      <OneWireGpioEditor v-model:channels="channels" />

      <div class="column q-gutter-sm">
        <div>
          All channels in a module use the same power source. This is either 5V,
          or the external power supply.
        </div>
        <div>
          There are two ways to attach an external power source: connected to
          the two right-most pins in any GPIO module, or using a Power over
          Ethernet (PoE) adapter. <br>
          Any external power supply is a valid source for all modules.
        </div>
      </div>
      <LabeledField label="Module power source">
        <q-btn-group outline class="fit" @click="power = !power">
          <q-btn outline label="5V" :color="power ? '' : 'primary'" />
          <q-btn outline label="External" :color="power ? 'primary' : ''" />
        </q-btn-group>
      </LabeledField>
    </div>
  </Card>
</template>
