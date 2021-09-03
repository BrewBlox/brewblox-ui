<script lang="ts">
import { computed, defineComponent } from 'vue';

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

      <OneWireGpioEditor v-model:channels="channels">
        <template #power>
          <q-btn-group outline class="fit" @click="power = !power">
            <q-btn outline label="5V" :color="power ? '' : 'primary'" />
            <q-btn outline label="Ext." :color="power ? 'primary' : ''" />
          </q-btn-group>
        </template>
      </OneWireGpioEditor>
    </div>
  </Card>
</template>
