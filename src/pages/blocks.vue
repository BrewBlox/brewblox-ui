<template>
  <q-page padding>
    <q-btn
      icon="search"
      label="Discover blocks"
      @click="openDiscoverModal"
    />

    <q-modal
      v-model="discoverModalOpened"
      maximized
    >
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-btn
            flat
            round
            dense
            @click="closeDiscoverModal"
            icon="keyboard_arrow_left"
          />
          <q-toolbar-title>
            Discover blocks
          </q-toolbar-title>
        </q-toolbar>

        <div class="layout-padding">
          <p>Super awesome content here</p>
        </div>
      </q-modal-layout>
    </q-modal>
  </q-page>
</template>

<style>
</style>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'PageIndex',
  data() {
    return {
      discoverModalOpened: false,
    };
  },
  methods: {
    openDiscoverModal() {
      this.discoverModalOpened = true;
    },
    closeDiscoverModal() {
      this.discoverModalOpened = false;
    },
  },
});
</script>
