<script lang="ts">
import { ClosePopup } from 'quasar/src/directives';
import { CreateElement, VNode } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';

import { GraphConfig } from '../types';


@Component
export default class GraphDialog extends DialogBase {

  @Prop({ type: String, required: true })
  public readonly graphId!: string;

  @Prop({ type: Object, required: true })
  public readonly config!: GraphConfig;

  @Prop({ type: Boolean, default: false })
  public readonly sharedSources!: boolean;

  @Prop({ type: Function, required: false })
  public readonly renderControls!: (h: CreateElement) => VNode;

  render(h: CreateElement): VNode {
    return h('q-dialog',
      {
        ref: 'dialog',
        props: { maximized: true },
        on: { hide: this.onDialogHide },
      },
      [
        h('q-card',
          { props: { dark: true }, class: 'bg-dark' },
          [
            h('HistoryGraph',
              {
                props: {
                  graphId: this.graphId,
                  config: this.config,
                  sharedSources: this.sharedSources,
                },
                scopedSlots: {
                  controls: () => [
                    this.renderControls && this.renderControls(h),
                    h('q-btn',
                      {
                        props: { flat: true, label: 'close' },
                        directives: [ClosePopup],
                      }),
                  ],
                },
              }),
          ]),
      ]);
  }
}
</script>
