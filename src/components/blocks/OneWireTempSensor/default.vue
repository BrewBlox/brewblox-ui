<template>
  <q-card style="margin-bottom: 20px">
    <q-card-title>OneWireTempSensor ({{ id }})</q-card-title>

    <q-card-main>
      <q-list>
        <q-btn
          :loading="loading"
          icon="check"
          :color="changed ? 'primary' : 'light'"
          :disable="!changed"
          @click="update"
          style="float: right; margin-top: -8px"
        >
          Save
        </q-btn>

        <q-list-header>Settings</q-list-header>
        <q-item>
          <q-item-main>
            <q-input
              v-model="addressInput"
              stack-label="Address"
              placeholder="Address location of sensor"
            />
          </q-item-main>
        </q-item>
        <q-item>
          <q-item-main>
            <q-input
              v-model="offsetInput"
              stack-label="Offset"
              placeholder="Offset of sensor"
              type="number"
            />
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
