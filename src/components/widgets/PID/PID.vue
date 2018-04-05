<template>
  <div>
    <q-toolbar color="dark-bright">
      <q-toolbar-title>
        {{ block.id }}
      </q-toolbar-title>

      <q-btn
        flat
        round
        dense
        icon="settings"
        @click="openModal"
      />
    </q-toolbar>

    <q-card>
      <q-list>
        <q-item>
          <q-item-side>
            <q-item-tile sublabel>Input</q-item-tile>
            <q-item-tile
              label
              class="q-headline"
            >
              {{ state.inputValue }}
            </q-item-tile>
          </q-item-side>
          <q-item-side>
            <q-item-tile sublabel>Setpoint</q-item-tile>
            <q-item-tile
              label
              class="q-headline"
            >
              {{ state.inputSetting }}
            </q-item-tile>
          </q-item-side>
        </q-item>
        <q-item-separator />
        <q-item>
          <q-item-side>
            <q-item-tile sublabel>P</q-item-tile>
            <q-item-tile label>{{ state.p }}</q-item-tile>
          </q-item-side>
          <q-item-side>
            <q-item-tile sublabel>I</q-item-tile>
            <q-item-tile label>{{ state.i }}</q-item-tile>
          </q-item-side>
          <q-item-side>
            <q-item-tile sublabel>D</q-item-tile>
            <q-item-tile label>{{ state.d }}</q-item-tile>
          </q-item-side>
        </q-item>
        <q-item-separator />
        <q-item>
          <q-item-side>
            <q-item-tile sublabel>Output</q-item-tile>
            <q-item-tile
              label
              class="q-display-2"
            >
              {{ state.outputValue }}
            </q-item-tile>
          </q-item-side>
        </q-item>
      </q-list>
    </q-card>

    <q-modal v-model="modalOpen">
      Modal for settings of PID component
    </q-modal>
  </div>
</template>

<script lang="ts" src="./PID.ts" />

<style scoped>
.dashboard-item .q-card {
  box-shadow: none;
}

.q-item {
  justify-content: space-around;
}

.q-item-side {
  text-align: center;
  margin-left: 0;
}
</style>
