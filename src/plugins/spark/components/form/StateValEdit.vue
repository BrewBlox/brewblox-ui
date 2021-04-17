<script lang="ts">
import { defineComponent } from 'vue';

import { useValEdit } from '@/plugins/spark/composables';
import { DigitalState } from '@/shared-types';

export default defineComponent({
  name: 'StateValEdit',
  props: {
    ...useValEdit.props,
  },
  emits: [
    ...useValEdit.emits,
  ],
  setup(props) {
    const {
      field,
    } = useValEdit.setup<DigitalState>(props.modelValue);

    return {
      field,
    };
  },
});
</script>

<template>
  <div>
    <DigitalStateButton v-model="field" />
  </div>
</template>
