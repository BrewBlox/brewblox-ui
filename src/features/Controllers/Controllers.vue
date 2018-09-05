<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

import { controllers, isFetching } from '@/store/settings/getters';
import { addController, removeController } from '@/store/settings/actions';
import { clearBlocks } from '@/store/blocks/actions';
import { serviceById } from '@/store/services/getters';


@Component
export default class Controllers extends Vue {
  controllerInput: string = '';
  $q: any;

  get isFetching() {
    return isFetching(this.$store);
  }

  get controllers() {
    return controllers(this.$store);
  }

  addController() {
    addController(this.$store, this.controllerInput);

    // reset input
    this.controllerInput = '';
  }

  clear(controller: string) {
    this.$q.dialog({
      title: 'Remove',
      message: `Do you want to remove all blocks from '${controller}'?`,
      ok: 'Yes',
      cancel: 'Cancel',
    })
      .then(() => clearBlocks(this.$store, serviceById(this.$store, controller)))
      .catch(() => { });
  }

  remove(controller: string) {
    this.$q.dialog({
      title: 'Remove',
      message: `Do you want to remove controller '${controller}'?`,
      ok: 'Yes',
      cancel: 'Cancel',
    })
      .then(() => removeController(this.$store, controller))
      .catch(() => { });
  }
}
</script>

<template>
  <q-card>
    <q-card-title>Connected controllers</q-card-title>
    <q-card-main>
      <q-list>
        <q-item>
          <q-item-main>
            <form @submit.prevent="addController">
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
            </form>
          </q-item-main>
        </q-item>
        <q-item
          v-for="controller in controllers"
          :key="controller"
        >
          {{ controller }}

          <div
            class="controller-actions"
          >
            <q-btn
            class="action-btn"
            icon="clear"
            color="negative"
            @click="clear(controller)"
            >
              Clear blocks
            </q-btn>
            <q-btn
              class="action-btn"
              icon="remove circle"
              color="negative"
              @click="remove(controller)"
            >
              Remove
            </q-btn>
          </div>
        </q-item>
      </q-list>
    </q-card-main>
  </q-card>
</template>

<style scoped>
.q-item-main form {
  display: flex;
}

.q-item-main .q-input {
  width: 100%;
}

.q-item-main .q-btn {
  margin-left: 10px;
  flex-shrink: 0;
}

.controller-actions {
  margin-left: auto;
}

.action-btn {
  margin-left: 10px;
}
</style>
