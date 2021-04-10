<script lang="ts">
import { computed, defineComponent, watch } from 'vue';
import { useRouter } from 'vue-router';

// import { builderStore } from '@/plugins/builder/store';
import { dashboardStore } from '@/store/dashboards';
import { serviceStore } from '@/store/services';
import { systemStore } from '@/store/system';
import { createDialog } from '@/utils/dialog';
import { objectSorter } from '@/utils/functional';

export default defineComponent({
  name: 'IndexPage',
  setup() {
    const router = useRouter();

    const homePage = computed<string | null>(
      () => {
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
          // (section === 'brewery' && builderStore.layoutIds.includes(pageId))
          false
        );

        return valid
          ? homePage
          : defaultPage;
      },
    );

    function showWizard(): void {
      createDialog({ component: 'WizardDialog' });
    }

    watch(
      () => homePage.value,
      v => v && router.replace(v),
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
