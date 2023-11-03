<script setup lang="ts">
import { useValEdit } from '@/plugins/spark/composables';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BoolValEdit',
  props: {
    ...useValEdit.props,
  },
  emits: [...useValEdit.emits],
  setup() {
    const { field } = useValEdit.setup<boolean>();

    return {
      field,
    };
  },
});
</script>

<template>
  <q-toggle v-model="field" />
</template>
