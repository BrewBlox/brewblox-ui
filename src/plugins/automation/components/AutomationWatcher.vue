<script lang="ts">
import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';

import { automationStore } from '../store';


@Component
export default class AutomationWatcher extends Vue {
  dismissFunc: Function | null = null;

  @Watch('lastUpdate')
  async lastUpdateWatcher(newV: number): Promise<void> {
    // Update received from source -> dismiss prompt if any
    if (newV > 0) {
      this.tryDismiss();
      return;
    }

    // Already showing notification -> wait for user action
    if (!!this.dismissFunc) {
      return;
    }

    // Show prompt to user
    this.dismissFunc = this.$q.notify({
      timeout: 0,
      color: 'warning',
      icon: 'warning',
      message: 'Lost connection to the Automation service',
      actions: [
        {
          label: 'Retry',
          textColor: 'white',
          handler: () => {
            this.dismissFunc = null;
            automationStore.subscribe();
          },
        },
      ],
    });

    // Maybe it's only a hiccup -> schedule a retry
    setTimeout(() => { this.lastUpdate > 0 || automationStore.subscribe(); }, 3000);
  }

  get source(): EventSource | null {
    return automationStore.source;
  }

  get lastUpdate(): number {
    return automationStore.lastUpdate;
  }

  tryDismiss(): void {
    if (this.dismissFunc) {
      this.dismissFunc();
      this.dismissFunc = null;
    }
  }

  created(): void {
    automationStore.subscribe();
  }

  render(): null {
    return null;
  }
}
</script>
