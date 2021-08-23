<script lang="ts">
import { computed, defineComponent, ref } from 'vue';

import { useWidget } from '@/composables';
import { BlockType, GpioModuleStatus, GpioPins, OneWireGpioModuleBlock } from '@/shared-types';
import { Widget } from '@/store/widgets';

import GpioChannelEditor from '../OneWireGpioModule/GpioChannelEditor.vue';

export default defineComponent({
  name: 'OneWireGpioTestWidget',
  components: {
    GpioChannelEditor,
  },
  props: {

  },
  setup() {

    const { } = useWidget.setup<Widget>();

    const block = ref<OneWireGpioModuleBlock>({
      id: 'test-gpio',
      serviceId: 'test',
      type: BlockType.OneWireGpioModule,
      groups: [],
      data: {
        channels: [],
        modulePosition: 0,
        moduleStatus: GpioModuleStatus.NONE,
        pullUp: GpioPins.NONE,
        pullUpWhenActive: GpioPins.NONE,
        pullUpWhenInactive: GpioPins.NONE,
        pullDown: GpioPins.NONE,
        pullDownWhenActive: GpioPins.NONE,
        pullDownWhenInactive: GpioPins.NONE,
        pullUpOverCurrent: GpioPins.NONE,
        pullDownOverCurrent: GpioPins.NONE,
        pullUpOpenLoad: GpioPins.NONE,
        pullDownOpenLoad: GpioPins.NONE,
        moduleStatusClear: GpioPins.NONE, // write-only
      },
    });

    return {
      block,
    };
  },
});
</script>


<template>
  <Card>
    <template #toolbar>
      <WidgetToolbar />
    </template>

    <GpioChannelEditor
      v-model:block="block"
    />
  </Card>
</template>
