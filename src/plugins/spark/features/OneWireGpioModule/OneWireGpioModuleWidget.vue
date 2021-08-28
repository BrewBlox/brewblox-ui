<script lang="ts">
import { defineComponent } from 'vue';

import { useContext } from '@/composables';
import { OneWireGpioModuleBlock } from '@/shared-types';

import { useBlockWidget } from '../../composables';
import OneWireGpioEditor from './OneWireGpioEditor.vue';

export default defineComponent({
  name: 'OneWireGpioModuleWidget',
  components: {
    OneWireGpioEditor,
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

    <OneWireGpioEditor :block="block" @update:block="doSaveBlock" />
  </Card>
</template>
