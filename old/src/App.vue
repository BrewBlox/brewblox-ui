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
        <MainMenu />
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

import MainMenu from './MainMenu.vue';

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
    MainMenu,
  },
  data() {
    return {};
  },
  mounted() {
  },
};
</script>

<style></style>
