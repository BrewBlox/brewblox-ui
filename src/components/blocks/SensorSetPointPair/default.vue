<template>
  <q-card style="margin-bottom: 20px">
    <q-card-title>SensorSetPointPair ({{ id }})</q-card-title>

    <q-card-main>
      <q-list>
        <q-list-header>Links</q-list-header>
        <q-item>
          <q-item-main>
            <q-input
              v-model="sensorInput"
              stack-label="Sensor"
              placeholder="Sensor ID"
            />
          </q-item-main>
        </q-item>
        <q-item>
          <q-item-main>
            <q-input
              v-model="setpointInput"
              stack-label="SetPoint"
              placeholder="SetPoint ID"
            />
          </q-item-main>
        </q-item>
      </q-list>
    </q-card-main>

    <q-btn
      icon="check"
      :color="changed ? 'primary' : 'light'"
      :disable="!changed"
      @click="update"
    >
      Save
    </q-btn>
  </q-card>
</template>

<script lang="ts" src="./SensorSetPointPair.ts" />
