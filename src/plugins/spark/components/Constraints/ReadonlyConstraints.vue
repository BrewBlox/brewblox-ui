<script lang="ts">
import Component from 'vue-class-component';
import Constraints from './Constraints';

@Component
export default class ReadOnlyConstraints extends Constraints { }
</script>

<template>
  <div>
    <big v-if="constraints.length === 0">-</big>
    <big
      v-for="(cinfo, idx) in constraints"
      :key="idx"
      class="row gutter-x-xs"
    >
      {{ cinfo.key }}: {{ cinfo.value }}
    </big>
  </div>
</template>

<style scoped>
</style>
