<script lang="ts">
import Component from 'vue-class-component';

import WatcherBase from '@/components/Watcher/WatcherBase';
import sparkStore from '@/plugins/spark/store';

@Component
export default class SparkWatcher extends WatcherBase {
  dismissFunc: Function | null = null;

  get updating() {
    return sparkStore.updateSource(this.service.id) !== null;
  }

  retryUpdateSource() {
    sparkStore.fetchServiceStatus(this.service.id);
    sparkStore.createUpdateSource(this.service.id);
  }

  handleUpdateChange(updating: boolean) {
    if (!sparkStore.serviceAvailable(this.service.id)) {
      this.dismissFunc && this.dismissFunc();
      return;
    }

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
