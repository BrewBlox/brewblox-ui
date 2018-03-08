<template>
  <q-card style="margin-bottom: 20px">
    <q-card-title>OneWireTempSensor ({{ id }})</q-card-title>

    <q-card-main>
      <q-list>
        <q-list-header>Settings</q-list-header>
        <q-item>
          <q-item-main>
            <q-item-tile label>Address</q-item-tile>
            <q-item-tile sublabel>{{ settings.address }}</q-item-tile>
          </q-item-main>
        </q-item>
        <q-item>
          <q-item-main>
            <q-item-tile label>Offset</q-item-tile>
            <q-item-tile sublabel>{{ settings.offset }}</q-item-tile>
          </q-item-main>
        </q-item>
      </q-list>
    </q-card-main>

    <q-card-separator />

    <q-card-main>
      <q-list>
        <q-list-header>State</q-list-header>
        <q-item>
          <q-item-main>
            <q-item-tile label>Value</q-item-tile>
            <q-item-tile sublabel>{{ state.value }}</q-item-tile>
          </q-item-main>
        </q-item>
        <q-item>
          <q-item-main>
            <q-item-tile label>Connected</q-item-tile>
            <q-item-tile sublabel>{{ state.connected }}</q-item-tile>
          </q-item-main>
        </q-item>
      </q-list>
    </q-card-main>
  </q-card>
</template>

<script lang="ts" src="./OneWireTempSensor.ts" />

<style scoped>

</style>
