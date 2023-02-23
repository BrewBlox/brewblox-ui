<script lang="ts">
import brewbloxIconSvg from '@/assets/logo-x.svg';

import brewbloxLogoSvg from '@/assets/logo-wordmark-dark.svg';
import { useGlobals, useKiosk } from '@/composables';
import { startCreateFolder } from '@/store/sidebar/utils';
import { useQuasar } from 'quasar';
import { computed, defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'DefaultLayout',
  setup() {
    const { localStorage } = useQuasar();
    const { dense } = useGlobals.setup();
    const { kiosk } = useKiosk.setup();
    const router = useRouter();

    const devMode = Boolean(import.meta.env.DEV);
    const editing = ref<boolean>(false);

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
      brewbloxLogoSvg,
      brewbloxIconSvg,
      kiosk,
      devMode,
      editing,
      drawerOpen,
      routeActive,
      startCreateFolder,
    };
  },
});
</script>

<template>
  <q-layout
    view="hHh Lpr fFf"
    style="overflow: hidden"
  >
    <LayoutHeader
      v-if="!kiosk"
      @menu="drawerOpen = !drawerOpen"
    >
      <template #title>
        <portal-target name="toolbar-title" />
      </template>
      <template #buttons>
        <div class="full-height row q-gutter-x-sm q-pr-xs">
          <portal-target name="toolbar-buttons" />
        </div>
      </template>
    </LayoutHeader>
    <div
      v-else
      class="absolute z-top q-pa-sm"
    >
      <img
        :src="brewbloxLogoSvg"
        class="clickable bg-transparent"
        style="height: 24px"
        @click="kiosk = false"
      />
    </div>
    <LayoutFooter v-if="!kiosk" />

    <q-drawer
      v-if="!kiosk"
      v-model="drawerOpen"
      class="column"
      elevated
    >
      <SidebarNavigator />

      <q-scroll-area
        class="col"
        :thumb-style="{ opacity: '0.5', background: 'silver' }"
      >
        <SidebarIndex :editing="editing" />
      </q-scroll-area>

      <div class="col-auto row q-gutter-sm q-pa-sm">
        <q-btn
          v-if="devMode"
          flat
          icon="mdi-format-paint"
          to="/styles"
          :color="routeActive('/styles') ? 'primary' : ''"
        >
          <q-tooltip>Theming</q-tooltip>
        </q-btn>
        <q-btn
          flat
          icon="mdi-fullscreen"
          @click="kiosk = true"
        >
          <q-tooltip>Kiosk mode</q-tooltip>
        </q-btn>
        <q-space />
        <q-btn
          flat
          round
          icon="mdi-folder-plus"
          @click="startCreateFolder(null)"
        >
          <q-tooltip>Add folder</q-tooltip>
        </q-btn>
        <q-btn
          :color="editing ? 'primary' : ''"
          flat
          round
          icon="edit"
          @click="editing = !editing"
        >
          <q-tooltip>Edit sidebar</q-tooltip>
        </q-btn>
      </div>
    </q-drawer>

    <q-page-container style="overflow: hidden">
      <router-view />
    </q-page-container>
  </q-layout>
</template>
