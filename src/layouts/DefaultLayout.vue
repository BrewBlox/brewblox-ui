<script setup lang="ts">
import brewbloxLogoSvg from '@/assets/logo-wordmark-dark.svg';
import { useGlobals, useKiosk } from '@/composables';
import { startCreateLayout } from '@/plugins/builder/utils';
import { startCreateFolder } from '@/store/sidebar/utils';
import { startCreateDashboard } from '@/utils/dashboards';
import { createDialog } from '@/utils/dialog';
import { useQuasar } from 'quasar';
import { computed, ref } from 'vue';

const { localStorage } = useQuasar();
const { dense } = useGlobals.setup();
const { kiosk } = useKiosk.setup();

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
          flat
          round
          icon="mdi-fullscreen"
          @click="kiosk = true"
        >
          <q-tooltip>Kiosk mode</q-tooltip>
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
        <q-space />
        <q-btn-dropdown
          fab-mini
          icon="mdi-creation"
          color="secondary"
        >
          <q-list>
            <ActionItem
              label="Quickstart"
              class="text-secondary text-bold"
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
            <ActionItem
              label="New dashboard"
              @click="startCreateDashboard($router)"
            />
            <ActionItem
              label="New layout"
              @click="startCreateLayout($router)"
            />
            <ActionItem
              label="New folder"
              @click="startCreateFolder(null)"
            />
          </q-list>
        </q-btn-dropdown>
      </div>
    </q-drawer>

    <q-page-container style="overflow: hidden">
      <router-view />
    </q-page-container>
  </q-layout>
</template>
