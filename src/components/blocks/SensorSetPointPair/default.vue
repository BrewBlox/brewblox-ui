<template>
  <q-card style="margin-bottom: 20px">
    <q-card-title>SensorSetPointPair ({{ id }})</q-card-title>

    <q-card-main>
      <q-list>
        <q-list-header>Links</q-list-header>
        <q-item>
          <q-item-main>
            <q-item-tile label>Sensor</q-item-tile>
            <q-item-tile sublabel>{{ sensor.id }}</q-item-tile>
          </q-item-main>
        </q-item>
        <q-item>
          <q-item-main>
            <q-item-tile label>SetPoint</q-item-tile>
            <q-item-tile sublabel>{{ setpoint.id }}</q-item-tile>
          </q-item-main>
        </q-item>
      </q-list>
    </q-card-main>
  </q-card>
</template>

<script lang="ts" src="./SensorSetPointPair.ts" />
