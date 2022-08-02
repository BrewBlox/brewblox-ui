<script lang="ts">
import { useBuilderStore } from '@/plugins/builder/store';
import { startupDone } from '@/user-settings';
import { createDialog } from '@/utils/dialog';
import { makeObjectSorter } from '@/utils/functional';
import { computed, defineComponent, watch } from 'vue';
import { useRouter } from 'vue-router';
import { BuilderLayout } from './types';

const layoutSorter = makeObjectSorter<BuilderLayout>('dir', 'id');

export default defineComponent({
  name: 'IndexPage',
  setup() {
    const builderStore = useBuilderStore();
    const router = useRouter();

    const builderPage = computed<string | null>(() => {
      if (!startupDone.value) {
        return null;
      }

      if (builderStore.layouts.length === 0) {
        return '/builder/none';
      }

      const layout =
        builderStore.layoutById(builderStore.lastLayoutId) ??
        [...builderStore.layouts].sort(layoutSorter)[0] ??
        null;

      return layout ? `/builder/${layout.id}` : null;
    });

    function showWizard(): void {
      createDialog({ component: 'WizardDialog' });
    }

    watch(
      () => builderPage.value,
      (v) => v && router.replace(v),
      { immediate: true },
    );

    return {
      builderPage,
      showWizard,
    };
  },
});
</script>

<template>
  <q-page class="text-h5 darkened">
    <PageError v-if="!builderPage">
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
