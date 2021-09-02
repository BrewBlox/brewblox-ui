<script lang="ts">
import { computed, defineComponent } from 'vue';

import { OneWireGpioModuleBlock } from '@/shared-types';

import { useBlockWidget } from '../../composables';

export default defineComponent({
  name: 'OneWireGpioModuleWidget',
  setup() {
    const { block, saveBlock } = useBlockWidget.setup<OneWireGpioModuleBlock>();

    function doSaveBlock(b: OneWireGpioModuleBlock): void {
      saveBlock(b);
    }

    const power = computed<boolean>({
      get: () => block.value.data.useExternalPower,
      set: (useExternalPower) => {
        block.value.data.useExternalPower = useExternalPower;
        saveBlock();
      },
    });

    return {
      block,
      power,
      doSaveBlock,
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
      <div class="column q-gutter-y-sm">
        <div class="col-grow text-h6 text-secondary">
          Module {{ block.data.modulePosition }}
        </div>
        <div class="row">
          <ToggleButton v-model="power" label="Use external power" unelevated />
        </div>
        <div class="col-grow text-h6 text-secondary">
          Pin layout
        </div>
      </div>

      <OneWireGpioEditor :block="block" @update:block="doSaveBlock" />
    </div>
  </Card>
</template>
