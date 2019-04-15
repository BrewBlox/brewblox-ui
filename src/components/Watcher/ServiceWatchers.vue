<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { serviceValues } from '@/store/services/getters';
import { watcherById } from '@/store/providers/getters';

@Component
export default class ServiceWatchers extends Vue {
  $q: any;

  get watchers() {
    return serviceValues(this.$store)
      .map(service => ({ serviceId: service.id, component: watcherById(this.$store, service.type) }))
      .filter(w => !!w.component);
  }
}
</script>

<template>
  <div style="height: 0px; width: 0px;">
    <component
      v-for="watcher in watchers"
      :key="watcher.serviceId"
      :is="watcher.component"
      :service-id="watcher.serviceId"
    />
  </div>
</template>
