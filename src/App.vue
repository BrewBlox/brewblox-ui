<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

import { fetchServices } from '@/store/services/actions';
import { allServices } from '@/store/services/getters';
import { fetchDashboards } from '@/store/dashboards/actions';
import { initializerById, fetcherById } from '@/store/providers/getters';

@Component
export default class App extends Vue {
  async created() {
    await Promise.all([
      fetchServices(this.$store),
      fetchDashboards(this.$store),
    ]);

    const initPromises = allServices(this.$store)
      .map(service =>
        initializerById(this.$store, service.type)(this.$store, service));
    await Promise.all(initPromises);

    const fetchPromises = allServices(this.$store)
      .map(service =>
        fetcherById(this.$store, service.type)(this.$store, service));
    await Promise.all(fetchPromises);
  }
}
</script>

<template>
  <div
  id="q-app"

  >
    <router-view />
  </div>
</template>

<style scoped>
</style>
