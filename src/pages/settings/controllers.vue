<template>
  <q-card>
    <q-card-title>Connected controllers</q-card-title>
    <q-card-main>
      <q-list>
        <q-item>
          <q-item-main>
            <q-input
              v-model="controllerInput"
              stack-label="Add new controller"
              placeholder="controller-id"
            />
            <q-btn
              icon="add"
              color="primary"
            >
              Add
            </q-btn>
          </q-item-main>
        </q-item>
        <q-item
          v-for="controller in controllers"
          :key="controller"
        >
          {{ controller }}
        </q-item>
      </q-list>
    </q-card-main>
  </q-card>
</template>

<script lang="ts" src="./controllers.ts" />

<style scoped>
.q-item-main {
  display: flex;
}

.q-item-main .q-input {
  width: 100%;
}

.q-item-main .q-btn {
  margin-left: 10px;
  flex-shrink: 0;
}
</style>
