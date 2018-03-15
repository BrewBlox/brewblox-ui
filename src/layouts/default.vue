<template>
  <q-layout view="lHh Lpr lFf">
    <q-layout-header>
      <q-toolbar
        glossy
      >
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
        >
          <q-icon name="menu" />
        </q-btn>

        <q-toolbar-title>
          BrewBlox
        </q-toolbar-title>
      </q-toolbar>
    </q-layout-header>

    <q-layout-drawer
      v-model="leftDrawerOpen"
    >
      <q-list
        no-border
        link
        inset-delimiter
      >
        <q-item
          link
          to="/blocks"
        >
          <q-item-side icon="settings" />
          Blocks
        </q-item>
        <q-item
          link
          to="/metrics"
        >
          <q-item-side icon="show chart" />
          Metrics
        </q-item>

        <q-item
          link
          to="/grid"
        >
          <q-item-side icon="grid on" />
          Grid
        </q-item>
      </q-list>
    </q-layout-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'LayoutDefault',
  data() {
    return {
      leftDrawerOpen: false,
    };
  },
};
</script>

<style>
</style>
