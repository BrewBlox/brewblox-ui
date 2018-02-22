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

<script>
import Vue from 'vue';

export default Vue.extend({
  name: 'set-point-simple',
  props: {
    id: String,
    settings: {
      value: Number,
    },
  },
});
</script>

<style scoped>

</style>
