<script lang="ts">
import { Dialog } from 'quasar';
import { Component, Watch } from 'vue-property-decorator';

import WatcherBase from '@/components/Watcher/WatcherBase';
import { sparkStore } from '@/plugins/spark/store';

import { SystemStatus } from '../types';

@Component
export default class SparkWatcher extends WatcherBase {
  notifiedUpdate: boolean = false;
  dismissFunc: Function | null = null;

  get status() {
    return sparkStore.lastStatus(this.service.id);
  }

  get lastUpdate() {
    return sparkStore.lastUpdate(this.service.id);
  }

  notifying() {
    return !!this.dismissFunc;
  }

  retryUpdateSource() {
    sparkStore.fetchServiceStatus(this.service.id);
    sparkStore.createUpdateSource(this.service.id);
  }

  tryDismiss() {
    if (this.dismissFunc) {
      this.dismissFunc();
      this.dismissFunc = null;
    }
  }

  @Watch('lastUpdate')
  async handleUpdateChange(date: Date | null) {
    // Update received from source -> dismiss prompt
    if (date) {
      this.tryDismiss();
      return;
    }

    // Service was removed -> dismiss prompt
    if (!sparkStore.serviceAvailable(this.service.id)) {
      this.tryDismiss();
      return;
    }

    // Already showing notification -> wait for user action
    if (this.notifying()) {
      return;
    }

    // Show prompt to user
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

    // Maybe it's only a hiccup -> schedule a retry
    setTimeout(() => { this.lastUpdate || this.retryUpdateSource(); }, 3000);
  }

  @Watch('status')
  handleStatusChange(status: SystemStatus) {
    if (this.notifiedUpdate || !status || status.latest) {
      return;
    }

    this.notifiedUpdate = true;
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

  render() {
    return null;
  }
}
</script>
