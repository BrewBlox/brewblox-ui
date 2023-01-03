<script lang="ts">
import { defineComponent } from 'vue';
import { usePart } from '../../composables';

export default defineComponent({
  name: 'BorderMenuContent',
  setup() {
    const { bordered } = usePart.setup();

    return {
      bordered,
    };
  },
});
</script>

<template>
  <q-item
    v-ripple
    v-close-popup
    tag="label"
  >
    <q-item-section>
      <q-item-label>Border</q-item-label>
    </q-item-section>
    <q-item-section side>
      <q-toggle v-model="bordered" />
    </q-item-section>
  </q-item>
</template>
