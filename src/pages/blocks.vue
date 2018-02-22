<template>
  <q-page padding>
    <q-btn
      icon="search"
      label="Discover blocks"
      @click="openDiscoverModal"
    />

    <q-modal v-model="discoverModalOpened">
      <h4>Basic Modal</h4>
      <q-btn
        color="primary"
        @click="closeDiscoverModal"
        label="Close"
      />
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
