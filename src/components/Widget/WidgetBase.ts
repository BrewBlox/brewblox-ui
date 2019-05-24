import Component from 'vue-class-component';

import ItemBase from '../ItemBase';

@Component({
  props: {
    config: {
      type: Object,
      required: true,
    },
    onChangeConfig: {
      type: Function,
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars*/
      default: async () => (id: string, config: any) => { },
    },
    pos: {
      type: Object, // XYPosition
      required: false,
    },
    cols: {
      type: Number,
      required: false,
    },
    rows: {
      type: Number,
      required: false,
    },
  },
})
export default class WidgetBase extends ItemBase {
  protected async saveConfig(config: any): Promise<void> {
    await this.$props.onChangeConfig(this.$props.id, { ...config })
      .catch(() => {
        this.$q.notify({
          color: 'warning',
          icon: 'warning',
          message: `Failed to save '${this.widgetTitle}' configuration`,
        });
        this.$forceUpdate();
      });
  }
}
