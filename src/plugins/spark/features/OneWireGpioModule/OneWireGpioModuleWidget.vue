<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useContext } from '@/composables';
import { OneWireGpioModuleBlock } from '@/shared-types';

import { useBlockWidget } from '../../composables';
import GpioChannelEditor from './GpioChannelEditor.vue';

export default defineComponent({
  name: 'OneWireGpioModuleWidget',
  components: {
    GpioChannelEditor,
  },
  setup() {
    const { context } = useContext.setup();
    const { block, saveBlock } = useBlockWidget.setup<OneWireGpioModuleBlock>();

    function doSaveBlock(b: OneWireGpioModuleBlock): void {
      saveBlock(b);
    }

    return {
      context,
      block,
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

    <GpioChannelEditor :block="block" @update:block="doSaveBlock" />
  </Card>
</template>
