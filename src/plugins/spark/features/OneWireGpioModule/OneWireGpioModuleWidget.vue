<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useContext } from '@/composables';
import { OneWireGpioModuleBlock } from '@/shared-types';

import { useBlockWidget } from '../../composables';


export default defineComponent({
  name: 'OneWireGpioModuleWidget',
  setup() {
    const { context } = useContext.setup();
    const { block, saveBlock } = useBlockWidget.setup<OneWireGpioModuleBlock>();

    const raw = computed<string>(
      () => JSON.stringify(block.value.data),
    );

    return {
      context,
      block,
      saveBlock,
      raw,
    };
  },
});
</script>

<template>
  <Card>
    <template #toolbar>
      <BlockWidgetToolbar has-mode-toggle />
    </template>

    <div>
      <IoArray />
      <div>
        {{ raw }}
      </div>
    </div>
  </Card>
</template>
