<template>
  <div>
    <q-toolbar color="dark-bright">
      <q-toolbar-title>
        {{ block.serviceId }}/{{ block.id }}
      </q-toolbar-title>
    </q-toolbar>

    <q-card>
      <q-list>
        <q-item>
          <q-item-tile sublabel>Sensor value</q-item-tile>
          <q-item-tile
            label
            class="q-headline"
          >
            10 Co
          </q-item-tile>
        </q-item>
        <q-item-separator />
        <q-item>
          <q-item-tile sublabel>Set point</q-item-tile>
          <div>Input hier</div>
        </q-item>
      </q-list>
    </q-card>
  </div>
</template>

<script lang="ts" src="./SensorSetPointPair.ts" />

<style scoped>
.q-item {
  display: block;
}
</style>
