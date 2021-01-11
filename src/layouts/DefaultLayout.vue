<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { systemStore } from '@/store/system';

@Component
export default class DefaultLayout extends Vue {
  localDrawer: boolean | null = null;
  dashboardEditing = false;
  serviceEditing = false;
  builderEditing = false;

  get drawerOpen(): boolean {
    return Boolean(
      this.localDrawer
      ?? this.$q.localStorage.getItem('drawer')
      ?? !this.$dense);
  }

  set drawerOpen(v: boolean) {
    this.localDrawer = v;
    this.$q.localStorage.set('drawer', v);
  }

  get devMode(): boolean {
    return !!process.env.DEV;
  }

  get showSidebarLayouts(): boolean {
    return systemStore.config.showSidebarLayouts;
  }

  stopEditing(): void {
    this.dashboardEditing = false;
    this.serviceEditing = false;
    this.builderEditing = false;
  }

  routeActive(route: string): boolean {
    return !!this.$route.path.match(route);
  }
}
</script>

<template>
  <q-layout view="hHh Lpr fFf" style="overflow: hidden">
    <LayoutHeader @menu="drawerOpen = !drawerOpen">
      <template #title>
        <portal-target name="toolbar-title">
          Brewblox
        </portal-target>
      </template>
      <template #buttons>
        <portal-target name="toolbar-buttons" class="full-height row q-gutter-x-sm q-pr-xs" />
      </template>
    </LayoutHeader>
    <LayoutFooter />

    <q-drawer v-model="drawerOpen" content-class="column" elevated>
      <SidebarNavigator />

      <q-scroll-area class="col" :thumb-style="{opacity: 0.5, background: 'silver'}">
        <DashboardIndex v-model="dashboardEditing" />
        <BuilderLayoutIndex v-if="showSidebarLayouts" v-model="builderEditing" />
        <ServiceIndex v-model="serviceEditing" />
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
      @click.native="stopEditing"
    >
      <router-view />
    </q-page-container>
  </q-layout>
</template>
