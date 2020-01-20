<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';

import WatcherBase from '@/components/WatcherBase';
import { createDialog } from '@/helpers/dialog';
import notify from '@/helpers/notify';
import { sparkStore } from '@/plugins/spark/store';

import { SystemStatus } from '../types';

@Component
export default class SparkWatcher extends WatcherBase {
  notifiedUpdate = false;
  dismissFunc: Function | null = null;

  get status(): SystemStatus | null {
    return sparkStore.lastStatus(this.service.id);
  }

  get lastUpdate(): Date | null {
    return sparkStore.lastUpdate(this.service.id);
  }

  get cookieName(): string {
    return `fw-snooze-${this.serviceId}`;
  }

  get snoozeTime(): number {
    if (!this.$q.cookies.has(this.cookieName)) {
      return 0;
    }
    return Date.parse(this.$q.cookies.get(this.cookieName));
  }

  notifying(): boolean {
    return !!this.dismissFunc;
  }

  retryUpdateSource(): void {
    sparkStore.fetchServiceStatus(this.service.id);
    sparkStore.createUpdateSource(this.service.id);
  }

  tryDismiss(): void {
    if (this.dismissFunc) {
      this.dismissFunc();
      this.dismissFunc = null;
    }
  }

  @Watch('lastUpdate')
  async handleUpdateChange(date: Date | null): Promise<void> {
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
  handleStatusChange(status: SystemStatus): void {
    if (this.notifiedUpdate
      || !status
      || !status.connect
      || status.latest
      || this.snoozeTime > new Date().getTime() - (24 * 60 * 60 * 1000)
    ) {
      return;
    }

    this.notifiedUpdate = true;
    notify.info({
      timeout: 0,
      icon: 'mdi-download-network',
      message: `Firmware update available for ${this.service.title}`,
      actions: [
        {
          label: 'Update',
          textColor: 'white',
          handler: () => createDialog({
            component: 'FirmwareUpdateDialog',
            serviceId: this.serviceId,
          }),
        },
        {
          label: 'Dismiss',
          textColor: 'white',
        },
        {
          label: 'Maybe tomorrow',
          textColor: 'white',
          handler: () => this.$q.cookies.set(this.cookieName, new Date().toUTCString()),
        },
      ],
    });
  }

  render(): null {
    return null;
  }
}
</script>
