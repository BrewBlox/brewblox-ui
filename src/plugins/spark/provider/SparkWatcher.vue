<script lang="ts">
import Component from 'vue-class-component';
import { updateSource } from '../store/getters';
import { fetchServiceStatus, createUpdateSource } from '../store/actions';
import WatcherBase from '@/components/Watcher/WatcherBase';

@Component
export default class SparkWatcher extends WatcherBase {
  dismissFunc: Function | null = null;

  get updating() {
    return updateSource(this.$store, this.service.id) !== null;
  }

  retryUpdateSource() {
    fetchServiceStatus(this.$store, this.service.id);
    createUpdateSource(this.$store, this.service.id);
  }

  handleUpdateChange(updating: boolean) {
    if (!updating && !this.dismissFunc) {
      this.dismissFunc = this.$q.notify({
        timeout: 0,
        color: 'warning',
        icon: 'warning',
        message: `Lost connection to ${this.service.title}`,
        actions: [
          {
            label: 'Retry',
            textColor: 'white',
            handler: this.retryUpdateSource,
          },
        ],
      });
      return;
    }

    if (updating && this.dismissFunc) {
      this.dismissFunc();
      this.dismissFunc = null;
    }
  }

  mounted() {
    this.$watch('updating', this.handleUpdateChange);
  }
}
</script>

<template>
  <div/>
</template>
