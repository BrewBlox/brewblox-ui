<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { objectSorter } from '@/helpers/functional';
import { builderStore } from '@/plugins/builder/store';
import { dashboardStore } from '@/store/dashboards';
import { serviceStore } from '@/store/services';
import { systemStore } from '@/store/system';

@Component
export default class IndexPage extends Vue {

  get homePage(): string | null {
    const { homePage } = systemStore.config;

    const defaultPage = [...dashboardStore.dashboards]
      .sort(objectSorter('order'))
      .map(v => `/dashboard/${v.id}`)[0] ?? null;

    // Defaults to first dashboard
    if (!homePage) {
      return defaultPage;
    }

    const [, section, pageId] = homePage.split('/');
    const valid = (
      (section === 'dashboard' && dashboardStore.dashboardIds.includes(pageId)) ||
      (section === 'service' && serviceStore.serviceIds.includes(pageId)) ||
      (section === 'brewery' && builderStore.layoutIds.includes(pageId))
    );

    return valid
      ? homePage
      : defaultPage;
  }

  @Watch('homePage', { immediate: true })
  watchHomePage(): void {
    if (this.homePage) {
      this.$router.replace(this.homePage);
    }
  }

  showWizard(): void {
    createDialog({ component: 'WizardDialog' });
  }
}
</script>

<template>
  <q-page class="text-h5 darkened">
    <PageError v-if="!homePage">
      <q-btn
        unelevated
        color="secondary"
        icon="mdi-creation"
        size="lg"
        label="Get started"
        @click="showWizard"
      />
    </PageError>
  </q-page>
</template>
