<script setup lang="ts">
import { useBuilderStore } from '@/plugins/builder/store';
import { Dashboard, useDashboardStore } from '@/store/dashboards';
import { useServiceStore } from '@/store/services';
import { userUISettings } from '@/user-settings';
import { createDialog } from '@/utils/dialog';
import { makeObjectSorter } from '@/utils/functional';
import { computed, watch } from 'vue';
import { useRouter } from 'vue-router';

const sorter = makeObjectSorter<Dashboard>('title');

const dashboardStore = useDashboardStore();
const serviceStore = useServiceStore();
const builderStore = useBuilderStore();
const router = useRouter();

const homePage = computed<string | null>(() => {
  const { homePage } = userUISettings.value;

  const defaultPage =
    [...dashboardStore.dashboards]
      .sort(sorter)
      .map((v) => `/dashboard/${v.id}`)[0] ?? null;

  // Defaults to first dashboard
  if (!homePage) {
    return defaultPage;
  }

  const [, section, pageId] = homePage.split('/');
  const valid =
    (section === 'dashboard' && dashboardStore.dashboardIds.includes(pageId)) ||
    (section === 'service' && serviceStore.serviceIds.includes(pageId)) ||
    (section === 'brewery' && builderStore.layoutIds.includes(pageId));

  return valid ? homePage : defaultPage;
});

watch(
  () => homePage.value,
  (v) => v && router.replace(v),
  { immediate: true },
);
</script>

<template>
  <q-page class="text-h5 darkened">
    <PageError v-if="!homePage">
      <q-btn-dropdown
        unelevated
        label="Get started"
        icon="mdi-creation"
        color="secondary"
        size="lg"
      >
        <q-list>
          <ActionItem
            label="Quickstart"
            @click="createDialog({ component: 'QuickstartWizardDialog' })"
          />
          <ActionItem
            label="New block"
            @click="
              createDialog({
                component: 'BlockWizardDialog',
                componentProps: { addWidget: true },
              })
            "
          />
          <ActionItem
            label="New widget"
            @click="createDialog({ component: 'WidgetWizardDialog' })"
          />
        </q-list>
      </q-btn-dropdown>
    </PageError>
  </q-page>
</template>
