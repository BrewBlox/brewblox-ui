<template>
  <q-card style="margin-bottom: 20px">
    <q-card-title>SensorSetPointPair ({{ id }})</q-card-title>

    <q-card-main>
      <p class="text-weight-medium">Links</p>
      <div>
        <span>sensor</span><span>{{ links.sensor }}</span>
      </div>
      <div>
        <span>setpoint</span><span>{{ links.setpoint }}</span>
      </div>
    </q-card-main>
  </q-card>
</template>

<script lang="ts" src="./SensorSetPointPair.ts" />
