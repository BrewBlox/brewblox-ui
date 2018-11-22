<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  props: {
    serviceId: {
      type: String,
      required: true,
    },
  },
})
export default class InvalidPage extends Vue { }
</script>

<template>
  <div class="flex flex-center">Invalid service page: {{ $props.serviceId }}</div>
</template>

<style scoped>
</style>
