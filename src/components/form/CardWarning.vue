<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'CardWarning',
  props: {
    icon: {
      type: String,
      default: 'warning',
    },
    color: {
      type: String,
      default: 'warning',
    },
  },
});
</script>

<template>
  <div
    class="row no-wrap items-center q-gutter-x-md q-ma-md justify-center"
    style="max-width: 100%"
  >
    <q-icon
      :name="icon"
      :color="color"
      size="md"
      class="col-auto"
    />
    <div class="col-shrink">
      <slot name="message" />
    </div>
    <div class="col-auto column q-gutter-y-xs">
      <slot name="actions" />
    </div>
  </div>
</template>
