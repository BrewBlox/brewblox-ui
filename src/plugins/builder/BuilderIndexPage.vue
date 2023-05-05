<script setup lang="ts">
import { useBuilderStore } from '@/plugins/builder/store';
import { startupDone } from '@/user-settings';
import { makeObjectSorter } from '@/utils/functional';
import { computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { BuilderLayout } from './types';
import { startCreateLayout } from './utils';

const sorter = makeObjectSorter<BuilderLayout>('title');

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
    [...builderStore.layouts].sort(sorter)[0] ??
    null;

  return layout ? `/builder/${layout.id}` : null;
});

watch(
  () => builderPage.value,
  (v) => v && router.replace(v),
  { immediate: true },
);
</script>

<template>
  <q-page class="text-h5 darkened">
    <PageError v-if="!builderPage">
      <q-btn
        unelevated
        color="secondary"
        icon="mdi-creation"
        size="lg"
        label="New layout"
        @click="startCreateLayout($router)"
      />
    </PageError>
  </q-page>
</template>
