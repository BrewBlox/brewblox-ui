<template>
  <div>
    <q-toolbar color="dark-bright">
      <q-toolbar-title>
        {{ block.serviceId }}/{{ block.id }}
      </q-toolbar-title>
    </q-toolbar>

    <q-list>
      <q-item>
        <q-item-tile sublabel>Sensor value</q-item-tile>
        <q-item-tile
          label
          class="q-headline"
        >
          {{ sensor.state.value | unit }}
        </q-item-tile>
      </q-item>
      <q-item-separator />
      <q-item>
        <q-item-tile sublabel>Setpoint</q-item-tile>
        <div>Input hier</div>
      </q-item>
    </q-list>
  </div>
</template>

<script lang="ts" src="./SensorSetPointPair.ts" />

<style scoped>
.q-list {
  border: 0;
}

.q-item {
  display: block;
}
</style>
