<template>
  <div>
    <div>SetPointSimple ({{ id }})</div>
    <div>Settings</div>
    <div>
      <span>Value</span><span>{{ settings.value }}</span>
    </div>
  </div>
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
