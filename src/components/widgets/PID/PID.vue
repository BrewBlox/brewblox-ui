<template>
  <div>
    <q-toolbar color="dark-bright">
      <q-toolbar-title>
        {{ block.id }}
      </q-toolbar-title>

      <q-btn
        flat
        round
        dense
        icon="more vert"
      />
    </q-toolbar>

    <div>
      This is a PID grid item {{ cols }} {{ rows }}
    </div>
  </div>
</template>

<script lang="ts" src="./PID.ts" />

<style scoped>

</style>
