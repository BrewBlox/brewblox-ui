<script lang="ts">
import { useQuasar } from 'quasar';
import { computed, defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useGlobals } from '@/composables';
import { systemStore } from '@/store/system';

export default defineComponent({
  name: 'DefaultLayout',
  setup() {
    const { localStorage } = useQuasar();
    const { dense } = useGlobals.setup();
    const router = useRouter();

    const devMode = Boolean(process.env.DEV);
    const dashboardEditing = ref<boolean>(false);
    const serviceEditing = ref<boolean>(false);
    const builderEditing = ref<boolean>(false);

    const _drawerOpen = ref<boolean>(localStorage.getItem('drawer') ?? !dense.value);
    const drawerOpen = computed<boolean>({
      get: () => _drawerOpen.value,
      set: v => {
        _drawerOpen.value = v;
        localStorage.set('drawer', v);
      },
    });

    const showSidebarLayouts = computed<boolean>(
      () => systemStore.config.showSidebarLayouts,
    );

    function stopEditing(): void {
      dashboardEditing.value = false;
      serviceEditing.value = false;
      builderEditing.value = false;
    }

    function routeActive(route: string): boolean {
      return Boolean(router.currentRoute.value.path.match(route));
    }

    return {
      devMode,
      dashboardEditing,
      serviceEditing,
      builderEditing,
      drawerOpen,
      showSidebarLayouts,
      stopEditing,
      routeActive,
    };
  },
});
</script>

<template>
  <q-layout view="hHh Lpr fFf" style="overflow: hidden">
    <LayoutHeader @menu="drawerOpen = !drawerOpen">
      <template #title>
        <div id="toolbar-title">
          Brewblox
        </div>
      </template>
      <template #buttons>
        <div id="toolbar-buttons" class="full-height row q-gutter-x-sm q-pr-xs" />
      </template>
    </LayoutHeader>
    <LayoutFooter />

    <q-drawer v-model="drawerOpen" class="column" elevated>
      <SidebarNavigator />

      <q-scroll-area class="col" :thumb-style="{opacity: 0.5, background: 'silver'}">
        <DashboardIndex v-model:editing="dashboardEditing" />
        <!-- <BuilderLayoutIndex v-if="showSidebarLayouts" v-model="builderEditing" /> -->
        <ServiceIndex v-model:editing="serviceEditing" />
      </q-scroll-area>

      <div class="col-auto row q-gutter-sm q-pa-sm">
        <q-btn
          v-if="devMode"
          flat
          icon="mdi-format-paint"
          to="/styles"
          :color="routeActive('/styles') ? 'primary' : ''"
        >
          <q-tooltip>
            Theming
          </q-tooltip>
        </q-btn>
      </div>
    </q-drawer>

    <q-page-container
      style="overflow: hidden"
      @click="stopEditing"
    >
      <router-view />
    </q-page-container>
  </q-layout>
</template>
