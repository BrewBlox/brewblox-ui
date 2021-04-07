<script lang="ts">
import { Notify } from 'quasar';
import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';

import { systemStore } from '@/store/system';


@Component
export default class ConfigWatcher extends Vue {
  notifyHandle: Function | null = null;

  get userDefinedUnits(): boolean {
    return systemStore.userDefinedUnits;
  }

  showPrompt(): void {
    this.notifyHandle = Notify.create({
      message: 'Please select how temperatures should be displayed',
      html: true,
      icon: 'mdi-thermometer',
      timeout: 0,
      actions: [
        {
          label: 'Celsius',
          textColor: 'white',
          handler: () => systemStore.saveUnits({ temperature: 'degC' }),
        },
        {
          label: 'Fahrenheit',
          textColor: 'white',
          handler: () => systemStore.saveUnits({ temperature: 'degF' }),
        },
      ],
    });
  }

  @Watch('userDefinedUnits', { immediate: true })
  checkUserDefined(newV: boolean): void {
    if (!newV) {
      this.showPrompt();
    }
    else if (this.notifyHandle) {
      this.notifyHandle();
      this.notifyHandle = null;
    }
  }

  render(): null {
    return null;
  }
}
</script>
