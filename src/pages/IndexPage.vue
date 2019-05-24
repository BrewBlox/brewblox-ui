<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';

import dashboardStore from '@/store/dashboards';

@Component
export default class IndexPage extends Vue {
  get primaryDashboardId() {
    return dashboardStore.primaryDashboardId;
  }

  @Watch('primaryDashboardId', { immediate: true })
  onPrimaryDashboardFound() {
    if (this.primaryDashboardId !== null) {
      this.$router.replace(`/dashboard/${this.primaryDashboardId}`);
    }
  }

}
</script>

<template>
  <q-page class="flex flex-center">Home</q-page>
</template>
