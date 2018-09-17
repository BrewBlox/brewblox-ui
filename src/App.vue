<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

import { fetchServices } from '@/store/services/actions';
import { allServices } from '@/store/services/getters';
import { fetchDashboards } from '@/store/dashboards/actions';
import { fetchByType } from '@/services/service-by-type';

@Component
export default class App extends Vue {
  created() {
    // fetch all block and dashboard on init
    Promise
      .all([
        fetchServices(this.$store),
        fetchDashboards(this.$store),
      ])
      .then(() => allServices(this.$store)
        .forEach(service => fetchByType(service.type)(this.$store, service)))
      .catch((e) => { throw new Error(e); });
  }
}
</script>

<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<style>
</style>
