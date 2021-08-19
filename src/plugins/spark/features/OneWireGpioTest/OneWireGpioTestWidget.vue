<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useWidget } from '@/composables';
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

    return {};
  },
});
</script>


<template>
  <Card>
    <template #toolbar>
      <WidgetToolbar />
    </template>

    <GpioChannelEditor />
  </Card>
</template>
