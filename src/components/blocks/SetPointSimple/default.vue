<template>
  <q-card style="margin-bottom: 20px">
    <q-card-title>SetPointSimple ({{ id }})</q-card-title>

    <q-card-main>
      <q-list>
        <q-list-header>Settings</q-list-header>
        <q-item>
          <q-item-main>
            <q-item-tile label>Value</q-item-tile>
            <q-item-tile sublabel>{{ settings.value }}</q-item-tile>
          </q-item-main>
        </q-item>
      </q-list>
    </q-card-main>
  </q-card>
</template>

<script lang="ts" src="./SetPointSimple.ts"></script>
