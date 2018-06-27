<template>
  <div>
    <q-toolbar color="dark-bright">
      <q-toolbar-title>
        {{ block.serviceId }}/{{ block.id }}
      </q-toolbar-title>
    </q-toolbar>

    <q-card>
      <q-card-main>
        <q-list>
          <q-item class="grid-items-2">
            <q-item-main>
              <q-item-tile sublabel>Sensor</q-item-tile>
              <q-item-tile
                label
                class="q-headline"
              >
                {{ sensor.state.value | unit }}
              </q-item-tile>
            </q-item-main>
            <q-item-main>
              <q-item-tile sublabel>Setpoint</q-item-tile>
              <q-input
                v-model="inputs.setpoint"
                type="number"
                :suffix="sensor.state.value.unitNotation"
                numeric-keyboard-toggle
              />
            </q-item-main>
          </q-item>
        </q-list>
      </q-card-main>
      <q-card-separator />
      <q-card-actions align="end">
        <q-btn
          icon="check"
          :color="setpointChanged ? 'primary' : 'light'"
          :disable="!setpointChanged"
          @click="save"
        >
          Save changes
        </q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script lang="ts" src="./SensorSetPointPair.ts" />

<style scoped>
.q-list {
  border: 0;
}

.q-item {
  display: grid;
  grid-gap: 10px;
}

.grid-items-2 {
  grid-template-columns: 1fr 1fr;
}
</style>
