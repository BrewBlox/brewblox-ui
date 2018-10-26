<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { fetchServices } from '@/store/services/actions';
import { serviceValues } from '@/store/services/getters';
import { fetchDashboards } from '@/store/dashboards/actions';
import { initializerById, fetcherById, updaterById } from '@/store/providers/getters';
import { setInterval } from 'timers';
import { Service } from '@/store/services/state';

@Component
export default class App extends Vue {
  interval: NodeJS.Timer | null = null;

  async update() {
    const updatePromises = serviceValues(this.$store)
      .map(service =>
        updaterById(this.$store, service.type)(this.$store, service));
    await Promise.all(updatePromises);
  }

  async created() {
    await Promise.all([
      fetchServices(this.$store),
      fetchDashboards(this.$store),
    ]);

    // Initialize each service
    const initPromises = serviceValues(this.$store)
      .map(service =>
        initializerById(this.$store, service.type)(this.$store, service));
    await Promise.all(initPromises);

    // Allow each service to fetch
    const fetchPromises = serviceValues(this.$store)
      .map(service =>
        fetcherById(this.$store, service.type)(this.$store, service));
    await Promise.all(fetchPromises);

    // Start regular updates
    this.interval = setInterval(this.update, 5000);
  }

  beforeDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
</script>

<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<style scoped>
</style>
