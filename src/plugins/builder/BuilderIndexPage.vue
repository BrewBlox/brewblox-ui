<script lang="ts">
import { computed, defineComponent, watch } from 'vue';
import { useRouter } from 'vue-router';

import { builderStore } from '@/plugins/builder/store';
import { systemStore } from '@/store/system';
import { createDialog } from '@/utils/dialog';
import { objectSorter } from '@/utils/functional';

export default defineComponent({
  name: 'IndexPage',
  setup() {
    const router = useRouter();

    const builderPage = computed<string | null>(
      () => {
        if (!systemStore.started) {
          return null;
        }

        if (builderStore.layouts.length === 0) {
          return '/builder/none';
        }

        const layout = null
          ?? builderStore.layoutById(builderStore.lastLayoutId)
          ?? [...builderStore.layouts].sort(objectSorter('order'))[0]
          ?? null;

        return layout
          ? `/builder/${layout.id}`
          : null;
      },
    );

    function showWizard(): void {
      createDialog({ component: 'WizardDialog' });
    }

    watch(
      () => builderPage.value,
      v => v && router.replace(v),
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
