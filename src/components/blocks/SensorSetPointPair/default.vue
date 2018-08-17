<script lang="ts" src="./SensorSetPointPair.ts" />

<template>
  <q-card>
    <q-card-title>SensorSetPointPair ({{ id }})</q-card-title>

    <q-card-main>
      <q-list>
        <q-btn
          :loading="loading"
          icon="check"
          :color="changed ? 'primary' : 'light'"
          :disable="!changed"
          @click="save"
          style="float: right; margin-top: -8px"
        >
          Save
        </q-btn>

        <q-list-header>Links</q-list-header>
        <q-item>
          <q-item-main>
            <q-select
              v-model="sensorInput"
              stack-label="Sensor"
              placeholder="Sensor ID"
              :options="allSensors"
            />
          </q-item-main>
        </q-item>
        <q-item>
          <q-item-main>
            <q-select
              v-model="setpointInput"
              stack-label="SetPoint"
              placeholder="SetPoint ID"
              :options="allSetPoints"
            />
          </q-item-main>
        </q-item>
      </q-list>
    </q-card-main>
  </q-card>
</template>
