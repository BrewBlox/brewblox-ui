<script lang="ts">
import { CreateElement, VNode } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';

import { GraphAnnotation, GraphConfig, QueryParams } from '../types';


@Component
export default class GraphDialog extends DialogBase {

  @Prop({ type: String, required: true })
  public readonly graphId!: string;

  @Prop({ type: Object, required: true })
  public readonly config!: GraphConfig;

  @Prop({ type: Boolean, default: false })
  public readonly sharedSources!: boolean;

  @Prop({ type: Function, required: false })
  public readonly saveAnnotations!: (a: GraphAnnotation[]) => void;

  @Prop({ type: Function, required: false })
  public readonly saveParams!: (v: QueryParams) => void;

  render(h: CreateElement): VNode {
    return h('q-dialog',
      {
        ref: 'dialog',
        props: {
          maximized: true,
          transitionShow: 'fade',
        },
        on: { hide: this.onDialogHide },
      },
      [
        h('q-card',
          [
            h('HistoryGraph',
              {
                props: {
                  graphId: this.graphId,
                  config: this.config,
                  sharedSources: this.sharedSources,
                  usePresets: this.saveParams !== undefined,
                },
                attrs: {
                  annotated: !!this.saveAnnotations,
                },
                on: {
                  annotations: this.saveAnnotations ?? (() => { }),
                  params: this.saveParams ?? (() => { }),
                },
                scopedSlots: {
                  controls: () => [
                    h('DialogCloseButton', { props: { stretch: true } }),
                  ],
                },
              }),
          ]),
      ]);
  }
}
</script>
