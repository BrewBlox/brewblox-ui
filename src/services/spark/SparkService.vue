<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

import { Service } from '@/store/services/state';
import { allServices, isFetching, serviceById } from '@/store/services/getters';
import { createService, removeService } from '@/store/services/actions';
import { clearBlocks } from './store/actions';

@Component
export default class SparkService extends Vue {
  serviceInput: string = '';
  $q: any;

  get isFetching() {
    return isFetching(this.$store);
  }

  get services() {
    return allServices(this.$store);
  }

  addService() {
    createService(this.$store, {
      id: this.serviceInput,
      type: 'spark',
      config: {},
    });

    // reset input
    this.serviceInput = '';
  }

  clear(service: Service) {
    this.$q.dialog({
      title: 'Remove',
      message: `Do you want to remove all blocks from '${service.id}'?`,
      ok: 'Yes',
      cancel: 'Cancel',
    })
      .then(() => clearBlocks(this.$store, service))
      .catch(() => { });
  }

  remove(service: Service) {
    this.$q.dialog({
      title: 'Remove',
      message: `Do you want to remove the Spark '${service.id}'?`,
      ok: 'Yes',
      cancel: 'Cancel',
    })
      .then(() => removeService(this.$store, service))
      .catch(() => { });
  }
}
</script>

<template>
  <q-card>
    <q-card-title>Connected Spark Controllers</q-card-title>
    <q-card-main>
      <q-list>
        <q-item>
          <q-item-main>
            <form @submit.prevent="addService">
              <q-input
                v-model="serviceInput"
                stack-label="Add new Spark controller"
                placeholder="controller ID"
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
          v-for="service in services"
          :key="service.id"
        >
          {{ service.id }}

          <div
            class="service-actions"
          >
            <q-btn
            class="action-btn"
            icon="clear"
            color="negative"
            @click="clear(service)"
            >
              Clear blocks
            </q-btn>
            <q-btn
              class="action-btn"
              icon="remove circle"
              color="negative"
              @click="remove(service)"
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

.service-actions {
  margin-left: auto;
}

.action-btn {
  margin-left: 10px;
}
</style>
