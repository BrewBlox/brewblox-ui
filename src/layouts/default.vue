<template>
  <q-layout view="lHh Lpr lFf">
    <q-layout-header>
      <q-toolbar
        glossy
        color="dark-bright"
      >
        <q-btn
          flat
          dense
          round
          @click="toggleDrawer"
        >
          <q-icon name="menu" />
        </q-btn>

        <q-toolbar-title>
          <portal-target name="toolbar-title">BrewBlox</portal-target>
        </q-toolbar-title>

        <portal-target name="toolbar-buttons" />
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
        <q-list-header>Main menu</q-list-header>
        <q-item
          link
          to="/settings"
        >
          <q-item-side icon="settings" />
          Settings
        </q-item>
        <q-item
          link
          to="/blocks"
        >
          <q-item-side icon="device hub" />
          Blocks
        </q-item>
        <q-item
          link
          to="/metrics"
        >
          <q-item-side icon="show chart" />
          Metrics
        </q-item>

        <q-item-separator />

        <q-list-header v-if="!isFetching && dashboards.length > 0">Dashboards</q-list-header>

        <q-item
          v-for="dashboard in dashboards"
          link
          :to="`/dashboard/${ dashboard.id }`"
          :key="dashboard.id"
        >
          {{ dashboard.title }}
        </q-item>
      </q-list>
    </q-layout-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" src="./default.ts" />

<style>
.q-toolbar .vue-portal-target .q-btn {
  margin-left: 10px;
}
</style>
