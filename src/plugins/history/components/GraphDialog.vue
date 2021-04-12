<script lang="ts">
import { defineComponent, h, PropType } from 'vue';

import { useDialog } from '@/composables';

import { GraphAnnotation, GraphConfig, QueryParams } from '../types';

export default defineComponent({
  name: 'GraphDialog',
  props: {
    ...useDialog.props,
    graphId: {
      type: String,
      required: true,
    },
    config: {
      type: Object as PropType<GraphConfig>,
      required: true,
    },
    sharedSources: {
      type: Boolean,
      default: false,
    },
    saveAnnotations: {
      type: Function as PropType<(a: GraphAnnotation[]) => unknown>,
      default: null,
    },
    saveParams: {
      type: Function as PropType<(v: QueryParams) => unknown>,
      default: null,
    },
  },
  emits: useDialog.emits,
  setup(props) {
    const {
      dialogRef,
      onDialogHide,
    } = useDialog.setup();

    return h('q-dialog',
      {
        ref: dialogRef,
        props: {
          maximized: true,
          transitionShow: 'fade',
        },
        on: { hide: onDialogHide },
      },
      [
        h('q-card',
          [
            h('HistoryGraph',
              {
                props: {
                  graphId: props.graphId,
                  config: props.config,
                  sharedSources: props.sharedSources,
                  usePresets: props.saveParams != null,
                },
                attrs: {
                  annotated: props.saveAnnotations != null,
                  maximized: true,
                },
                on: {
                  annotations: props.saveAnnotations ?? (() => { }),
                  params: props.saveParams ?? (() => { }),
                },
                scopedSlots: {
                  controls: () => [
                    h('DialogCloseButton', { props: { stretch: true } }),
                  ],
                },
              }),
          ]),
      ]);
  },
});
</script>
