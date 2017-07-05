<template>
  <!-- Don't drop "q-app" class -->
  <div id="q-app">
    <q-layout
      ref="layout"
      view="hHh Lpr fff"
      :left-class="{'bg-grey-2': true}"
    >
      <q-toolbar slot="header" class="glossy">
        <q-btn
          flat
          @click="$refs.layout.toggleLeft()"
        >
          <q-icon name="menu" />
        </q-btn>

        <q-toolbar-title>
          BrewBlox
          <div slot="subtitle">{{$route.name}}</div>
        </q-toolbar-title>
      </q-toolbar>

      <div slot="left">
        <!--
          Use <q-side-link> component 
          instead of <q-item> for 
          internal vue-router navigation
        -->

        <q-list no-border link inset-delimiter>
          <q-list-header>Brewing</q-list-header>
          <q-side-link item to="/dashboard">
            <q-item-side icon="dashboard" /> 
            <q-item-main label="Dashboard" sublabel="Dashboard" />
          </q-side-link>
          <q-side-link item to="/charts">
            <q-item-side icon="timeline" /> 
            <q-item-main label="Charts" sublabel="Your brewing data" />
          </q-side-link>
          <q-side-link item to="/flows">
            <q-item-side icon="grid on" /> 
            <q-item-main label="Flows" sublabel="Flow visualization" />
          </q-side-link>
          <q-list-header>Admin</q-list-header>
          <q-side-link item to="/admin">
            <q-item-side icon="settings" />
            <q-item-main label="Settings" sublabel="global settings" />
          </q-side-link>
        </q-list>
      </div>
      <div>
        <router-view />
      </div>
    </q-layout>
  </div>
</template>

<script>
/*
 * Root component
 */
import {
  QLayout,
  QToolbar,
  QToolbarTitle,
  QBtn,
  QIcon,
  QList,
  QListHeader,
  QItem,
  QItemSide,
  QItemMain,
  QSideLink,
} from 'quasar';

export default {
  name: 'index',
  components: {
    QLayout,
    QToolbar,
    QToolbarTitle,
    QBtn,
    QIcon,
    QList,
    QListHeader,
    QItem,
    QItemSide,
    QItemMain,
    QSideLink,
  },
};
</script>

<style></style>
