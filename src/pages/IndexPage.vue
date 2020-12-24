<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import { objectSorter } from '@/helpers/functional';
import { dashboardStore } from '@/store/dashboards';
import { systemStore } from '@/store/system';

@Component
export default class IndexPage extends Vue {

  get homePage(): string | null {
    return systemStore.config.homePage
      ?? [...dashboardStore.dashboards]
        .sort(objectSorter('order'))
        .map(v => `/dashboard/${v.id}`)[0]
      ?? null;
  }

  @Watch('homePage', { immediate: true })
  onPrimaryDashboardFound(): void {
    if (this.homePage !== null) {
      this.$router.replace(this.homePage);
    }
  }

}
</script>

<template>
  <q-page class="flex flex-center">
    Home
  </q-page>
</template>
