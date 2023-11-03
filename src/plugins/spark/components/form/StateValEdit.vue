<script setup lang="ts">
import { useValEdit } from '@/plugins/spark/composables';
import { DigitalState } from 'brewblox-proto/ts';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'StateValEdit',
  props: {
    ...useValEdit.props,
  },
  emits: [...useValEdit.emits],
  setup() {
    const { field } = useValEdit.setup<DigitalState>();

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
