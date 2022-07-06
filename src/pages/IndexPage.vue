<script lang="ts">
import { computed, defineComponent, watch } from 'vue';
import { useRouter } from 'vue-router';

import { useBuilderStore } from '@/plugins/builder/store';
import { useDashboardStore } from '@/store/dashboards';
import { useServiceStore } from '@/store/services';
import { userUISettings } from '@/user-settings';
import { createDialog } from '@/utils/dialog';
import { makeObjectSorter } from '@/utils/functional';

const dashboardSorter = makeObjectSorter('order');

export default defineComponent({
  name: 'IndexPage',
  setup() {
    const dashboardStore = useDashboardStore();
    const serviceStore = useServiceStore();
    const builderStore = useBuilderStore();
    const router = useRouter();

    const homePage = computed<string | null>(() => {
      const { homePage } = userUISettings.value;

      const defaultPage =
        [...dashboardStore.dashboards]
          .sort(dashboardSorter)
          .map((v) => `/dashboard/${v.id}`)[0] ?? null;

      // Defaults to first dashboard
      if (!homePage) {
        return defaultPage;
      }

      const [, section, pageId] = homePage.split('/');
      const valid =
        (section === 'dashboard' &&
          dashboardStore.dashboardIds.includes(pageId)) ||
        (section === 'service' && serviceStore.serviceIds.includes(pageId)) ||
        (section === 'brewery' && builderStore.layoutIds.includes(pageId));

      return valid ? homePage : defaultPage;
    });

    function showWizard(): void {
      createDialog({ component: 'WizardDialog' });
    }

    watch(
      () => homePage.value,
      (v) => v && router.replace(v),
      { immediate: true },
    );

    return {
      homePage,
      showWizard,
    };
  },
});
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
