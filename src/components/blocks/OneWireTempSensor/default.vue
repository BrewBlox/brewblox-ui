<template>
  <q-card style="margin-bottom: 20px">
    <q-card-title>OneWireTempSensor ({{ id }})</q-card-title>

    <q-card-main>
      <p class="text-weight-medium">Settings</p>
      <div>
        <span>address</span><span>{{ settings.address }}</span>
      </div>
      <div>
        <span>offset</span><span>{{ settings.offset }}</span>
      </div>
    </q-card-main>

    <q-card-separator />

    <q-card-main>
      <p class="text-weight-medium">State</p>
      <div>
        <span>value</span><span>{{ state.value }}</span>
      </div>
      <div>
        <span>connected</span><span>{{ state.connected }}</span>
      </div>
    </q-card-main>
  </q-card>
</template>

<script lang="ts" src="./OneWireTempSensor.ts" />

<style scoped>

</style>
