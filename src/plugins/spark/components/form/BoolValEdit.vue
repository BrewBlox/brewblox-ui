<script lang="ts">
import { defineComponent } from 'vue';

import { useValEdit } from '@/plugins/spark/composables';

export default defineComponent({
  name: 'BoolValEdit',
  props: {
    ...useValEdit.props,
  },
  emits: {
    ...useValEdit.emits,
  },
  setup(props) {
    const {
      field,
    } = useValEdit.setup<boolean>(props.modelValue);

    return {
      field,
    };
  },
});
</script>

<template>
  <q-toggle v-model="field" />
</template>
