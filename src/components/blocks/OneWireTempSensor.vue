<template>
  <div>
    <div>OneWireTempSensor ({{ id }})</div>
    <div>Settings</div>
    <div>
      <span>address</span><span>{{ settings.address }}</span>
    </div>
    <div>
      <span>offset</span><span>{{ settings.offset }}</span>
    </div>
    <div>Value</div>
    <div>
      <span>value</span><span>{{ state.value }}</span>
    </div>
    <div>
      <span>connected</span><span>{{ state.connected }}</span>
    </div>
  </div>
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
