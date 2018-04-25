<template>
  <q-modal-layout>
    <q-toolbar
      slot="header"
      color="dark-bright"
    >
      <q-toolbar-title>
        New Widget
      </q-toolbar-title>
      <q-btn
        flat
        v-close-overlay
      >
        Close
      </q-btn>
    </q-toolbar>

    <div class="layout-padding">
      <h1>Modal</h1>

      <p>This is a Modal presenting a Layout.</p>
    </div>
  </q-modal-layout>
</template>

<script lang="ts" src="./widget-modal.ts" />

<style scoped>

</style>
