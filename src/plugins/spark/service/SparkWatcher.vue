<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { serviceStore } from '@/store/services';

import { sparkType } from '../getters';
import { SparkService } from '../types';
import SparkServiceWatcher from './SparkServiceWatcher.vue';

@Component({
  components: {
    SparkServiceWatcher,
  },
})
export default class SparkWatcher extends Vue {
  get services(): SparkService[] {
    return serviceStore.serviceValues
      .filter(service => service.type === sparkType);
  }
}
</script>

<template>
  <div>
    <SparkServiceWatcher
      v-for="service in services"
      :key="service.id"
      :service="service"
    />
  </div>
</template>
