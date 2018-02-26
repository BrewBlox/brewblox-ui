<template>
  <q-card style="margin-bottom: 20px">
    <q-card-title>SetPointSimple ({{ id }})</q-card-title>

    <q-card-main>
      <p class="text-weight-medium">Settings</p>
      <div>
        <span>Value</span><span>{{ settings.value }}</span>
      </div>
    </q-card-main>
  </q-card>
</template>

<script lang="ts" src="./SetPointSimple.ts"></script>
