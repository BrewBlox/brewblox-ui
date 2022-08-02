<script lang="ts">
import { useGlobals } from '@/composables';
import { useQuasar } from 'quasar';
import { computed, defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'DefaultLayout',
  setup() {
    const { localStorage } = useQuasar();
    const { dense } = useGlobals.setup();
    const router = useRouter();

    const devMode = Boolean((import.meta as any).env.DEV);

    const _drawerOpen = ref<boolean>(
      localStorage.getItem('drawer') ?? !dense.value,
    );
    const drawerOpen = computed<boolean>({
      get: () => _drawerOpen.value,
      set: (v) => {
        _drawerOpen.value = v;
        localStorage.set('drawer', v);
      },
    });

    function routeActive(route: string): boolean {
      return Boolean(router.currentRoute.value.path.match(route));
    }

    return {
      devMode,
      drawerOpen,
      routeActive,
    };
  },
});
</script>

<template>
  <q-layout
    view="hHh Lpr fFf"
    style="overflow: hidden"
  >
    <LayoutHeader @menu="drawerOpen = !drawerOpen">
      <template #title>
        <portal-target name="toolbar-title" />
      </template>
      <template #buttons>
        <div class="full-height row q-gutter-x-sm q-pr-xs">
          <portal-target name="toolbar-buttons" />
        </div>
      </template>
    </LayoutHeader>
    <LayoutFooter />

    <q-drawer
      v-model="drawerOpen"
      class="column"
      elevated
    >
      <SidebarNavigator />

      <q-scroll-area
        class="col"
        :thumb-style="{ opacity: '0.5', background: 'silver' }"
      >
        <DashboardIndex />
        <BreweryIndex />
        <ServiceIndex />
      </q-scroll-area>

      <div class="col-auto row q-gutter-sm q-pa-sm">
        <q-btn
          v-if="devMode"
          flat
          icon="mdi-format-paint"
          to="/styles"
          :color="routeActive('/styles') ? 'primary' : ''"
        >
          <q-tooltip> Theming </q-tooltip>
        </q-btn>
      </div>
    </q-drawer>

    <q-page-container style="overflow: hidden">
      <router-view />
    </q-page-container>
  </q-layout>
</template>
