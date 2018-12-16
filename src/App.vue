<script lang="ts">
import { setupApi as setupDashboardsApi } from '@/store/dashboards/actions';
import { setupApi as setupServicesApi } from '@/store/services/actions';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Notify } from 'quasar';

@Component
export default class App extends Vue {
  showingError: boolean = false;

  notifyError() {
    if (this.showingError) {
      return;
    }
    this.showingError = true;
    Notify.create({
      message: 'Remote datastore unreachable, please refresh page to retry',
      timeout: 0,
      type: 'negative',
      actions: [
        { label: 'Dismiss' },
      ],
      onDismiss: () => { this.showingError = false; },
    });
  }

  async created() {
    await Promise.all([
      setupServicesApi(this.$store, this.notifyError),
      setupDashboardsApi(this.$store, this.notifyError),
    ]);
  }
}
</script>

<template>
  <div id="q-app">
    <router-view/>
  </div>
</template>

<style scoped>
</style>
