<template>
  <q-card style="margin-bottom: 20px">
    <q-card-title>SetPointSimple ({{ id }})</q-card-title>

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

        <q-list-header>Settings</q-list-header>
        <q-item>
          <q-item-main>
            <q-input
              v-model="valueInput"
              stack-label="Value"
              placeholder="Value of SetPoint"
              type="number"
            />
          </q-item-main>
        </q-item>
      </q-list>
    </q-card-main>
  </q-card>
</template>

<script lang="ts" src="./SetPointSimple.ts"></script>
