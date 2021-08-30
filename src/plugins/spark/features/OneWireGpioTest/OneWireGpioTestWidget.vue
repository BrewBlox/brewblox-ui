<script lang="ts">
import { defineComponent, ref } from 'vue';

import { useWidget } from '@/composables';
import { BlockType, GpioModuleStatus, GpioPins, OneWireGpioModuleBlock } from '@/shared-types';
import { Widget } from '@/store/widgets';

import OneWireGpioEditor from '../OneWireGpioModule/OneWireGpioEditor.vue';

export default defineComponent({
  name: 'OneWireGpioTestWidget',
  components: {
    OneWireGpioEditor,
  },
  props: {},
  setup() {
    const {} = useWidget.setup<Widget>();

    const block = ref<OneWireGpioModuleBlock>({
      id: 'test-gpio',
      serviceId: 'test',
      type: BlockType.OneWireGpioModule,
      groups: [],
      data: {
        channels: [],
        modulePosition: 0,
        useExternalPower: false,
        moduleStatus: GpioModuleStatus.NONE,
        pullUpDesired: GpioPins.NONE,
        pullUpStatus: GpioPins.NONE,
        pullUpWhenActive: GpioPins.NONE,
        pullUpWhenInactive: GpioPins.NONE,
        pullDownDesired: GpioPins.NONE,
        pullDownStatus: GpioPins.NONE,
        pullDownWhenActive: GpioPins.NONE,
        pullDownWhenInactive: GpioPins.NONE,
        overCurrent: GpioPins.NONE,
        openLoad: GpioPins.NONE,
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

    <OneWireGpioEditor v-model:block="block" />
  </Card>
</template>
