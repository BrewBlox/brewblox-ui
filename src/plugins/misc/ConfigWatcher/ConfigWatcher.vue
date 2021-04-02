<script lang="ts">
import { Notify } from 'quasar';
import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';

import { prettyUnit } from '@/helpers/bloxfield';
import { systemStore } from '@/store/system';


@Component
export default class ConfigWatcher extends Vue {
  notifyHandle: Function | null = null;

  get userDefinedUnits(): boolean {
    return systemStore.userDefinedUnits;
  }

  showPrompt(): void {
    this.notifyHandle = Notify.create({
      message: 'How do you want temperature values formatted?',
      html: true,
      icon: 'mdi-thermometer',
      timeout: 0,
      actions: [
        {
          label: 'Use ' + prettyUnit('degC'),
          textColor: 'white',
          handler: () => systemStore.saveUnits({ temperature: 'degC' }),
        },
        {
          label: 'Use ' + prettyUnit('degF'),
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
