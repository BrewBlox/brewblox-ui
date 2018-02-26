<template>
  <q-card style="margin-bottom: 20px">
    <q-card-title>SetPointSimple ({{ id }})</q-card-title>

    <q-card-main>
      <p class="text-weight-medium">Settings</p>
      <div>
        <span>Value</span><span>{{ settings.value }}</span>
      </div>
    </q-card-main>
  </q-card>
</template>

<script lang="ts">
import Vue from 'vue';

import { getById } from '../../store/blocks/SetPointSimple/getters';

export default Vue.extend({
  name: 'set-point-simple',
  props: {
    id: {
      default: '',
      type: String,
    },
  },
  computed: {
    blockData() {
      const block = getById(this.$props.id);
      return block;
    },
    settings() {
      return this.blockData.settings;
    },
  },
});
</script>

<style scoped>

</style>
