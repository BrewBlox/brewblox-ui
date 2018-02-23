<template>
  <q-card style="margin-bottom: 20px">
    <q-card-title>OneWireTempSensor ({{ id }})</q-card-title>

    <q-card-main>
      <p class="text-weight-medium">Settings</p>
      <div>
        <span>address</span><span>{{ settings.address }}</span>
        <q-btn
        label="Example button" />
      </div>
      <div>
        <span>offset</span><span>{{ settings.offset }}</span>
        <q-btn
          size="sm"
          label="Small" />
      </div>
      <q-field
      label="slider">
        <q-slider
        label/>
      </q-field>
    </q-card-main>

    <q-card-separator />

    <q-card-main>
      <p class="text-weight-medium">State</p>
      <div>
        <span>value</span><span>{{ state.value }}</span>
      </div>
      <div>
        <span>connected</span><span>{{ state.connected }}</span>
      </div>
    </q-card-main>
  </q-card>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
  name: 'one-wire-temp-sensor',
  props: {
    id: String,
    settings: {
      address: String,
      offset: Number,
    },
    state: {
      value: Number,
      connected: Boolean,
    },
  },
});
</script>

<style scoped>

</style>
