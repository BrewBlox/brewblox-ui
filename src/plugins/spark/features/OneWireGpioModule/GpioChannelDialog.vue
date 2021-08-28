<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { GpioModuleChannel } from '@/shared-types';

export default defineComponent({
  name: 'GpioChannelDialog',
  props: {
    channel: {
      type: Object as PropType<GpioModuleChannel>,
      required: true,
    },
  },
  setup() {},
});
</script>
