<script lang="ts">
import { Dialog } from 'quasar';
import { Component } from 'vue-property-decorator';

import WatcherBase from '@/components/Watcher/WatcherBase';
import sparkStore from '@/plugins/spark/store';

import { SystemStatus } from '../types';

@Component
export default class SparkWatcher extends WatcherBase {
  cancelStatusWatcher: Function = () => { };
  dismissFunc: Function | null = null;

  get status() {
    return sparkStore.lastStatus(this.service.id);
  }

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

  handleStatusChange(status: SystemStatus) {
    if (!status || status.latest) {
      return;
    }

    this.cancelStatusWatcher();
    this.$q.notify({
      timeout: 0,
      color: 'positive',
      icon: 'mdi-download-network',
      message: `Firmware update available for ${this.service.title}`,
      actions: [
        {
          label: 'Update',
          textColor: 'white',
          handler: () => Dialog.create({
            component: 'FirmwareUpdateDialog',
            serviceId: this.serviceId,
          }),
        },
        {
          label: 'Dismiss',
          textColor: 'white',
        },
      ],
    });
  }

  mounted() {
    this.$watch('updating', this.handleUpdateChange);
    this.cancelStatusWatcher = this.$watch('status', this.handleStatusChange);
  }

  render() {
    return null;
  }
}
</script>
